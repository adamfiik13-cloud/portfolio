begin;
alter table public.briefs add column revision integer not null default 0 check(revision>=0), add column review_note text check(length(review_note)<=5000);
create table public.brief_revisions (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
  revision integer not null check(revision>0), event text not null check(event in ('draft_saved','submitted','changes_requested','approved')),
  responses jsonb not null check(jsonb_typeof(responses)='object'), note text check(length(note)<=5000),
  actor_id uuid not null references public.profiles(id) on delete restrict, created_at timestamptz not null default now(), unique(order_id,revision)
);
alter table public.brief_revisions enable row level security;
-- Hosted default privileges must not permit writes or TRUNCATE (which bypasses
-- row immutability triggers) from API roles.
revoke all on public.brief_revisions from public,anon,authenticated,service_role;
grant select on public.brief_revisions to authenticated;
grant select,insert on public.brief_revisions to service_role;
create policy brief_revision_read on public.brief_revisions for select to authenticated using(private.is_admin() or private.is_client(order_id));
create trigger reject_mutation before update or delete on public.brief_revisions for each row execute function private.reject_mutation();

-- Questions are read only from the immutable accepted snapshot, including legacy
-- custom offers whose requirements precede the typed direct-package definitions.
create function private.workspace_fields(p_order uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare s public.order_snapshots; fields jsonb;
begin
  select * into s from public.order_snapshots where order_id=p_order;
  if not found then raise exception 'Accepted snapshot required'; end if;
  if s.selected_package->'terms' ? 'brief_fields' then fields=s.selected_package->'terms'->'brief_fields';
  else
    select jsonb_agg(jsonb_build_object('id','requirement_'||ordinality::text,'label',value,'instruction',value,'required',true) order by ordinality) into fields
      from jsonb_array_elements(s.requirements) with ordinality;
  end if;
  if jsonb_typeof(fields) is distinct from 'array' or jsonb_array_length(fields) not between 1 and 40 then raise exception 'Invalid brief definitions'; end if;
  if exists(select 1 from jsonb_array_elements(fields) f where jsonb_typeof(f) is distinct from 'object' or jsonb_typeof(f->'id') is distinct from 'string' or (f->>'id') !~ '^[a-z0-9_-]{1,80}$' or jsonb_typeof(f->'required') is distinct from 'boolean')
    or (select count(distinct f->>'id') from jsonb_array_elements(fields) f)<>jsonb_array_length(fields) then raise exception 'Invalid brief definitions'; end if;
  return fields;
end $$;
create function private.workspace_valid_responses(p_order uuid,p_responses jsonb,p_complete boolean) returns boolean language plpgsql stable security definer set search_path='' as $$
declare fields jsonb; field_definition jsonb;
begin
  if p_complete is null or jsonb_typeof(p_responses) is distinct from 'object' or octet_length(p_responses::text)>1000000 then return false; end if;
  fields=private.workspace_fields(p_order);
  if exists(select 1 from jsonb_each(p_responses) e where jsonb_typeof(e.value) is distinct from 'string' or length(e.value #>> '{}')>6000
    or not exists(select 1 from jsonb_array_elements(fields) f where f->>'id'=e.key)) then return false; end if;
  if p_complete then
    for field_definition in select value from jsonb_array_elements(fields) loop
      if (field_definition->>'required')::boolean and (jsonb_typeof(p_responses->(field_definition->>'id')) is distinct from 'string' or not coalesce((p_responses->>(field_definition->>'id')) ~ '[^[:space:]]',false)) then return false; end if;
    end loop;
  end if;
  return true;
end $$;
create or replace function private.guard_brief_approval() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.status in ('submitted','approved') and private.workspace_valid_responses(new.order_id,new.responses,true) is not true then raise exception 'Complete mandatory brief required'; end if;
  if new.status='approved' and not exists(select 1 from public.staff_access where user_id=new.approved_by and active and role in ('owner','admin')) then raise exception 'Active admin approval required'; end if;
  return new;
end $$;
create function public.workspace_save_brief(p_actor uuid,p_order uuid,p_revision integer,p_responses jsonb,p_submit boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders; b public.briefs; next_status text;
begin
  if not exists(select 1 from auth.users where id=p_actor and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verified client required'; end if;
  select * into o from public.orders where id=p_order for update;
  if not found or o.client_id is distinct from p_actor then raise exception 'Unauthorized'; end if;
  select * into b from public.briefs where order_id=p_order for update;
  if not found then raise exception 'Brief required'; end if;
  if p_revision is null or p_revision is distinct from b.revision then raise exception 'Stale brief'; end if;
  if o.payment_status<>'paid' or o.work_started_at is not null or o.work_status in ('cancelled','completed') or b.status not in ('incomplete','changes_requested') then raise exception 'Brief not editable'; end if;
  if p_submit is null or private.workspace_valid_responses(p_order,p_responses,p_submit) is not true then raise exception 'Invalid brief'; end if;
  if p_submit and exists(select 1 from public.order_files where order_id=p_order and bucket_id='client-briefs' and status='pending') then raise exception 'Pending attachments'; end if;
  next_status=case when p_submit then 'submitted' else b.status end;
  update public.briefs set responses=p_responses,status=next_status,revision=b.revision+1,submitted_at=case when p_submit then now() else submitted_at end,approved_by=null,approved_at=null where id=b.id;
  insert into public.brief_revisions(order_id,revision,event,responses,note,actor_id) values(p_order,b.revision+1,case when p_submit then 'submitted' else 'draft_saved' end,p_responses,b.review_note,p_actor);
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_actor,case when p_submit then 'brief_submitted' else 'brief_draft_saved' end,'briefs',b.id);
  return jsonb_build_object('revision',b.revision+1,'status',next_status);
end $$;
create function public.workspace_review_brief(p_actor uuid,p_order uuid,p_revision integer,p_decision text,p_note text) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders; b public.briefs; next_status text;
begin
  if not exists(select 1 from public.staff_access s join auth.users u on u.id=s.user_id where s.user_id=p_actor and s.active and s.role='owner' and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)) then raise exception 'Owner required'; end if;
  select * into o from public.orders where id=p_order for update;
  if not found then raise exception 'Order required'; end if;
  select * into b from public.briefs where order_id=p_order for update;
  if not found then raise exception 'Brief required'; end if;
  if p_revision is null or p_revision is distinct from b.revision then raise exception 'Stale brief'; end if;
  if o.payment_status<>'paid' or o.work_started_at is not null or o.work_status in ('cancelled','completed') or b.status<>'submitted' then raise exception 'Submitted brief required'; end if;
  if p_decision is null or p_decision not in ('approve','changes_requested') or p_note is null or length(p_note)>5000 or (p_decision='changes_requested' and p_note !~ '[^[:space:]]') then raise exception 'Invalid review'; end if;
  if p_decision='approve' and private.workspace_valid_responses(p_order,b.responses,true) is not true then raise exception 'Complete mandatory brief required'; end if;
  if exists(select 1 from public.order_files where order_id=p_order and bucket_id='client-briefs' and status='pending') then raise exception 'Pending attachments'; end if;
  next_status=case when p_decision='approve' then 'approved' else 'changes_requested' end;
  update public.briefs set status=next_status,revision=b.revision+1,review_note=nullif(p_note,''),approved_by=case when p_decision='approve' then p_actor else null end,approved_at=case when p_decision='approve' then now() else null end where id=b.id;
  insert into public.brief_revisions(order_id,revision,event,responses,note,actor_id) values(p_order,b.revision+1,next_status,b.responses,nullif(p_note,''),p_actor);
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_actor,'brief_'||next_status,'briefs',b.id);
  return jsonb_build_object('revision',b.revision+1,'status',next_status);
end $$;
create function public.workspace_start_work(p_actor uuid,p_order uuid,p_revision integer) returns timestamptz language plpgsql security definer set search_path='' as $$
declare o public.orders; b public.briefs; started timestamptz;
begin
  if not exists(select 1 from public.staff_access s join auth.users u on u.id=s.user_id where s.user_id=p_actor and s.active and s.role='owner' and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)) then raise exception 'Owner required'; end if;
  select * into o from public.orders where id=p_order for update;
  if not found then raise exception 'Order required'; end if;
  select * into b from public.briefs where order_id=p_order for update;
  if not found or p_revision is null or p_revision is distinct from b.revision then raise exception 'Stale brief'; end if;
  if o.payment_status<>'paid' or b.status<>'approved' or o.work_status in ('cancelled','completed') or private.workspace_valid_responses(p_order,b.responses,true) is not true
    or not exists(select 1 from public.payment_records where order_id=p_order and status='verified' and verified_at is not null and amount_idr=o.amount_idr and currency=o.currency)
    or not exists(select 1 from public.staff_access where user_id=b.approved_by and active and role in ('owner','admin')) then raise exception 'Verified payment and approved brief required'; end if;
  if exists(select 1 from public.order_files where order_id=p_order and bucket_id='client-briefs' and status='pending') then raise exception 'Pending attachments'; end if;
  if o.work_started_at is not null then return o.work_started_at; end if;
  if o.work_status not in ('draft','awaiting_brief','brief_review','ready') then raise exception 'Invalid work state'; end if;
  -- Allows the existing status-history trigger to retain the verified real actor.
  perform set_config('request.jwt.claim.sub',p_actor::text,true);
  update public.orders set work_status='in_progress',work_started_at=now() where id=p_order returning work_started_at into started;
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_actor,'work_started','orders',p_order);
  return started;
end $$;
revoke all on function private.workspace_fields(uuid),private.workspace_valid_responses(uuid,jsonb,boolean),private.guard_brief_approval() from public,anon,authenticated,service_role;
revoke all on function public.workspace_save_brief(uuid,uuid,integer,jsonb,boolean),public.workspace_review_brief(uuid,uuid,integer,text,text),public.workspace_start_work(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.workspace_save_brief(uuid,uuid,integer,jsonb,boolean),public.workspace_review_brief(uuid,uuid,integer,text,text),public.workspace_start_work(uuid,uuid,integer) to service_role;
commit;
