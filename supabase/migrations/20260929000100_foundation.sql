-- Phase 3A: schema only. All privileged mutations are reserved for trusted server code.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null default '' check (length(display_name) <= 160),
  email text, -- Auth-managed reference; never a client-editable identity field.
  locale text not null default 'en' check (locale in ('en','id')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.staff_access (
  user_id uuid primary key references public.profiles(id) on delete restrict,
  role text not null check (role in ('owner','admin','team')),
  active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  service_id text not null check (service_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  locale text not null check (locale in ('en','id')),
  work_status text not null default 'draft' check (work_status in ('draft','awaiting_brief','brief_review','ready','in_progress','delivered','revision','completed','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','expired','cancelled')),
  refund_status text not null default 'none' check (refund_status in ('none','requested','reviewing','approved','rejected','partial','refunded')),
  amount_idr bigint not null check (amount_idr >= 0), currency text not null default 'IDR' check (currency = 'IDR'),
  work_started_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, client_id)
);
create table public.policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_type text not null check (policy_type in ('terms','service','refund','privacy')),
  version text not null, locale text not null check (locale in ('en','id')),
  effective_date date not null,
  content text not null check (length(content) > 0),
  content_sha256 text not null check (content_sha256 ~ '^[a-f0-9]{64}$'),
  published_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (policy_type,version,locale), unique(id,policy_type,version,locale,effective_date)
);
create table public.order_snapshots (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  service_name text not null, selected_package jsonb not null default '{}'::jsonb check (jsonb_typeof(selected_package)='object'),
  agreed_amount_idr bigint not null check (agreed_amount_idr >= 0), currency text not null default 'IDR' check(currency='IDR'),
  scope jsonb not null check(jsonb_typeof(scope)='array'),
  deliverables jsonb not null check(jsonb_typeof(deliverables)='array'),
  requirements jsonb not null check(jsonb_typeof(requirements)='array'),
  exclusions jsonb not null check(jsonb_typeof(exclusions)='array'),
  milestones jsonb not null default '[]'::jsonb check(jsonb_typeof(milestones)='array'),
  revision_rule jsonb not null check(jsonb_typeof(revision_rule)='object'),
  estimated_duration text not null,
  cancellation_refund_terms jsonb not null check(jsonb_typeof(cancellation_refund_terms)='object'),
  ownership_terms jsonb not null default '{}'::jsonb check(jsonb_typeof(ownership_terms)='object'),
  confidentiality_terms jsonb not null default '{}'::jsonb check(jsonb_typeof(confidentiality_terms)='object'),
  policy_version_ids uuid[] not null check(cardinality(policy_version_ids)=4),
  content_sha256 text not null check(content_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);
create table public.briefs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  required_inputs jsonb not null default '[]'::jsonb check(jsonb_typeof(required_inputs)='array'),
  responses jsonb not null default '{}'::jsonb check(jsonb_typeof(responses)='object'),
  status text not null default 'incomplete' check(status in ('incomplete','submitted','changes_requested','approved')),
  submitted_at timestamptz, approved_at timestamptz,
  approved_by uuid references public.staff_access(user_id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (status <> 'approved' or (submitted_at is not null and approved_at is not null and approved_by is not null)),
  check (approved_at is null or approved_at >= submitted_at)
);
create table public.team_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  staff_id uuid not null references public.staff_access(user_id) on delete restrict,
  assignment_role text not null check(length(assignment_role) between 1 and 100),
  status text not null default 'active' check(status in ('active','revoked','completed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(order_id,staff_id)
);
create table public.order_messages (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
  author_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check(length(body) between 1 and 20000),
  visibility text not null default 'client' check(visibility in ('client','internal')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_files (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
  uploader_id uuid not null references public.profiles(id) on delete restrict,
  category text not null check(category in ('brief','supporting','deliverable')),
  bucket_id text not null check(bucket_id in ('client-briefs','work-files','deliverables')),
  storage_path text not null,
  original_filename text not null check(length(original_filename) between 1 and 255),
  size_bytes bigint not null check(size_bytes between 1 and 10485760),
  mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png','image/webp','text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
  visibility text not null default 'internal' check(visibility in ('client','internal')),
  status text not null default 'pending' check(status in ('pending','ready','quarantined','deleted')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(bucket_id,storage_path),
  check(storage_path = order_id::text || '/' || id::text),
  check((category='brief' and bucket_id='client-briefs') or (category='supporting' and bucket_id='work-files') or (category='deliverable' and bucket_id='deliverables'))
);
create table public.custom_offers (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.profiles(id) on delete restrict,
  offer_series_id uuid not null default gen_random_uuid(), version integer not null default 1 check(version > 0),
  title text not null, scope jsonb not null check(jsonb_typeof(scope)='array'),
  amount_idr bigint not null check(amount_idr >= 0), currency text not null default 'IDR' check(currency='IDR'),
  estimated_duration text not null, revision_rule jsonb not null check(jsonb_typeof(revision_rule)='object'),
  expires_at timestamptz not null, status text not null default 'draft' check(status in ('draft','sent','accepted','rejected','expired','withdrawn')),
  accepted_at timestamptz, order_id uuid unique,
  created_by uuid not null references public.staff_access(user_id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(order_id,client_id) references public.orders(id,client_id) on delete restrict,
  unique(offer_series_id,version),
  check(status <> 'accepted' or (accepted_at is not null and order_id is not null)),
  check(accepted_at is null or accepted_at <= expires_at)
);
create table public.policy_acceptances (
  id uuid primary key default gen_random_uuid(), order_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete restrict,
  policy_version_id uuid not null,
  policy_type text not null, version text not null, locale text not null,
  effective_date date not null,
  accepted_at timestamptz not null default now(),
  -- Canonical accepted content retained in immutable policy_versions, not a mutable URL.
  foreign key(policy_version_id,policy_type,version,locale,effective_date) references public.policy_versions(id,policy_type,version,locale,effective_date) on delete restrict,
  foreign key(order_id,user_id) references public.orders(id,client_id) on delete restrict,
  unique(order_id,policy_type)
);
create table public.payment_records (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null check(provider ~ '^[a-z0-9_-]{1,40}$'), provider_reference text,
  amount_idr bigint not null check(amount_idr >= 0), currency text not null default 'IDR' check(currency='IDR'),
  status text not null default 'pending' check(status in ('pending','verified','failed','expired','cancelled')),
  verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(provider,provider_reference), unique(id,order_id),
  check(status <> 'verified' or verified_at is not null)
);
create table public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(), provider text not null,
  provider_event_id text not null, provider_reference text,
  event_type text not null check(length(event_type) <= 100),
  payload_sha256 text check(payload_sha256 ~ '^[a-f0-9]{64}$'), -- No raw payload/card data.
  processing_status text not null default 'received' check(processing_status in ('received','processing','processed','failed','ignored')),
  received_at timestamptz not null default now(), processed_at timestamptz,
  unique(provider,provider_event_id),
  check(processing_status not in ('processed','ignored') or processed_at is not null)
);
create table public.refunds (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid not null, requested_by uuid not null references public.profiles(id) on delete restrict,
  requested_amount_idr bigint not null check(requested_amount_idr > 0), approved_amount_idr bigint, refunded_amount_idr bigint,
  reason text not null check(length(reason) between 1 and 5000),
  status text not null default 'requested' check(status in ('requested','reviewing','approved','rejected','processed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(payment_id,order_id) references public.payment_records(id,order_id) on delete restrict,
  check(approved_amount_idr between 0 and requested_amount_idr),
  check(refunded_amount_idr between 0 and approved_amount_idr),
  check(status <> 'approved' or approved_amount_idr is not null),
  check(status <> 'processed' or (approved_amount_idr is not null and refunded_amount_idr is not null)),
  check(refunded_amount_idr is null or approved_amount_idr is not null)
);
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
  dimension text not null check(dimension in ('work','payment','refund')),
  old_status text, new_status text not null,
  actor_id uuid references public.profiles(id) on delete restrict,
  reason text, created_at timestamptz not null default now()
);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id) on delete restrict,
  action text not null, entity_type text not null, entity_id uuid,
  metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(metadata)='object' and metadata - array['field','from_status','to_status','reason_code'] = '{}'::jsonb),
  created_at timestamptz not null default now()
);
create table public.system_health (
  id smallint primary key check(id=1), healthy boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.system_health(id) values(1);

-- Foreign-key/access-path indexes. No service catalog duplication.
create index orders_client_idx on public.orders(client_id,created_at desc);
create index orders_status_idx on public.orders(work_status,payment_status);
create index assignments_staff_idx on public.team_assignments(staff_id,status,order_id);
create index messages_order_idx on public.order_messages(order_id,created_at);
create index messages_author_idx on public.order_messages(author_id);
create index files_order_idx on public.order_files(order_id,status);
create index files_uploader_idx on public.order_files(uploader_id);
create index offers_client_idx on public.custom_offers(client_id,status);
create index offers_creator_idx on public.custom_offers(created_by);
create index acceptances_user_idx on public.policy_acceptances(user_id);
create index acceptances_version_idx on public.policy_acceptances(policy_version_id);
create index payments_order_idx on public.payment_records(order_id);
create index refunds_payment_idx on public.refunds(payment_id,order_id);
create index refunds_order_idx on public.refunds(order_id);
create index refunds_requester_idx on public.refunds(requested_by);
create index history_order_idx on public.order_status_history(order_id,created_at);
create index history_actor_idx on public.order_status_history(actor_id);
create index audit_actor_idx on public.audit_events(actor_id,created_at);
create index audit_entity_idx on public.audit_events(entity_type,entity_id,created_at);
create index briefs_approver_idx on public.briefs(approved_by);

create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end $$;
create function private.reject_mutation() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Immutable record'; end $$;
create function private.sync_auth_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,email) values(new.id,new.email)
  on conflict(id) do update set email=excluded.email;
  return new;
end $$;
-- Never read a role from user_metadata; public signups can only get a profile.
create trigger auth_profile_created after insert or update of email on auth.users for each row execute function private.sync_auth_profile();
insert into public.profiles(id,email) select id,email from auth.users on conflict(id) do nothing;

create function private.validate_snapshot() returns trigger language plpgsql set search_path='' as $$
declare o public.orders; policy_count integer;
begin
  select * into o from public.orders where id=new.order_id for update;
  if new.agreed_amount_idr <> o.amount_idr or new.currency <> o.currency then raise exception 'Snapshot amount mismatch'; end if;
  select count(distinct policy_type) into policy_count from public.policy_versions where id=any(new.policy_version_ids) and locale=o.locale;
  if policy_count <> 4 then raise exception 'Four matching policy versions required'; end if;
  return new;
end $$;
create trigger validate_snapshot before insert on public.order_snapshots for each row execute function private.validate_snapshot();
create function private.validate_acceptance() returns trigger language plpgsql set search_path='' as $$
begin
  if not exists(select 1 from public.order_snapshots s join public.orders o on o.id=s.order_id
    where s.order_id=new.order_id and new.policy_version_id=any(s.policy_version_ids) and new.locale=o.locale) then raise exception 'Acceptance must match order snapshot'; end if;
  return new;
end $$;
create trigger validate_acceptance before insert on public.policy_acceptances for each row execute function private.validate_acceptance();
create function private.guard_payment() returns trigger language plpgsql set search_path='' as $$
declare o public.orders;
begin
  select * into o from public.orders where id=new.order_id for update;
  if new.amount_idr <> o.amount_idr or new.currency <> o.currency then raise exception 'Payment amount mismatch'; end if;
  if (select count(*) from public.policy_acceptances where order_id=new.order_id) <> 4 then raise exception 'Terms acceptance required before payment'; end if;
  return new;
end $$;
create trigger guard_payment before insert or update on public.payment_records for each row execute function private.guard_payment();
create function private.guard_order() returns trigger language plpgsql set search_path='' as $$
begin
  if tg_op='UPDATE' and (new.client_id,new.service_id,new.locale,new.amount_idr,new.currency) is distinct from (old.client_id,old.service_id,old.locale,old.amount_idr,old.currency)
    then raise exception 'Create a new versioned order instead'; end if;
  if tg_op='UPDATE' and old.work_started_at is not null and new.work_started_at is distinct from old.work_started_at then raise exception 'Work start is immutable'; end if;
  if new.payment_status='paid' and not exists(select 1 from public.payment_records where order_id=new.id and status='verified' and amount_idr=new.amount_idr) then raise exception 'Verified payment required'; end if;
  if (tg_op='INSERT' and (new.work_status in ('in_progress','delivered','revision','completed') or new.work_started_at is not null)) or
     (tg_op='UPDATE' and old.work_started_at is null and (new.work_status in ('in_progress','delivered','revision','completed') or new.work_started_at is not null)) then
    if new.payment_status <> 'paid' or not exists(select 1 from public.briefs where order_id=new.id and status='approved') then raise exception 'Payment and approved brief required before work'; end if;
    new.work_started_at=now();
  end if;
  return new;
end $$;
create trigger guard_order before insert or update on public.orders for each row execute function private.guard_order();
create function private.guard_offer() returns trigger language plpgsql set search_path='' as $$
begin
  if tg_op='DELETE' then if old.status='accepted' then raise exception 'Accepted offer is immutable'; end if; return old; end if;
  if tg_op='UPDATE' and old.status='accepted' then raise exception 'Accepted offer is immutable'; end if;
  if new.status='accepted' and not exists(select 1 from public.order_snapshots where order_id=new.order_id and agreed_amount_idr=new.amount_idr) then raise exception 'Accepted offer requires order snapshot'; end if;
  return new;
end $$;
create trigger guard_offer before insert or update or delete on public.custom_offers for each row execute function private.guard_offer();
create function private.log_order_status() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if old.work_status is distinct from new.work_status then insert into public.order_status_history(order_id,dimension,old_status,new_status,actor_id) values(new.id,'work',old.work_status,new.work_status,auth.uid()); end if;
  if old.payment_status is distinct from new.payment_status then insert into public.order_status_history(order_id,dimension,old_status,new_status,actor_id) values(new.id,'payment',old.payment_status,new.payment_status,auth.uid()); end if;
  if old.refund_status is distinct from new.refund_status then insert into public.order_status_history(order_id,dimension,old_status,new_status,actor_id) values(new.id,'refund',old.refund_status,new.refund_status,auth.uid()); end if;
  return new;
end $$;
create trigger log_order_status after update on public.orders for each row execute function private.log_order_status();

do $$ declare t text; begin
  foreach t in array array['profiles','staff_access','orders','briefs','team_assignments','order_messages','order_files','custom_offers','payment_records','refunds'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',t);
  end loop;
  foreach t in array array['order_snapshots','policy_versions','policy_acceptances','order_status_history','audit_events'] loop
    execute format('create trigger reject_mutation before update or delete on public.%I for each row execute function private.reject_mutation()',t);
  end loop;
end $$;

create function private.guard_brief_approval() returns trigger language plpgsql set search_path='' as $$
begin
  if new.status='approved' and not exists(select 1 from public.staff_access where user_id=new.approved_by and active and role in ('owner','admin')) then raise exception 'Active admin approval required'; end if;
  return new;
end $$;
create trigger guard_brief_approval before insert or update on public.briefs for each row execute function private.guard_brief_approval();
create function private.guard_refund_amount() returns trigger language plpgsql set search_path='' as $$
declare paid bigint; reserved bigint;
begin
  select amount_idr into paid from public.payment_records where id=new.payment_id and order_id=new.order_id and status='verified' for update;
  if paid is null or new.requested_amount_idr > paid then raise exception 'Invalid refund payment or amount'; end if;
  select coalesce(sum(greatest(coalesce(approved_amount_idr,0),coalesce(refunded_amount_idr,0))),0) into reserved from public.refunds where payment_id=new.payment_id and id<>new.id and status in ('approved','processed');
  if reserved + greatest(coalesce(new.approved_amount_idr,0),coalesce(new.refunded_amount_idr,0)) > paid then raise exception 'Refund exceeds payment'; end if;
  return new;
end $$;
create trigger guard_refund_amount before insert or update on public.refunds for each row execute function private.guard_refund_amount();
create function private.log_access_change() returns trigger language plpgsql security definer set search_path='' as $$
declare record_data jsonb;
begin
  record_data=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  insert into public.audit_events(actor_id,action,entity_type,entity_id)
    values(auth.uid(),lower(tg_op),tg_table_name,coalesce(record_data->>'id',record_data->>'user_id')::uuid);
  if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger log_staff_access after insert or update or delete on public.staff_access for each row execute function private.log_access_change();
create trigger log_assignment_access after insert or update or delete on public.team_assignments for each row execute function private.log_access_change();

revoke all on all functions in schema private from public, anon, authenticated;
commit;
