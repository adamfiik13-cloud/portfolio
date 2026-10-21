-- Phase 6 brief attachments. Apply after brief_workspace on verified staging.
begin;
alter table public.order_files add column upload_revision integer check(upload_revision>=0);
alter table public.order_files add column content_sha256 text check(content_sha256 ~ '^[a-f0-9]{64}$');

-- Only upload metadata becomes visible for recovery/discard. Storage object RLS
-- remains unchanged: unknown, pending and quarantined bytes are unreadable.
create policy brief_pending_metadata_read on public.order_files for select to authenticated using (
  category='brief' and bucket_id='client-briefs' and status in ('pending','quarantined') and uploader_id=auth.uid() and private.is_client(order_id)
);

create function private.guard_workspace_file() returns trigger language plpgsql set search_path='' as $$
begin
  if old.category='brief' and old.upload_revision is not null then
    if (new.id,new.order_id,new.uploader_id,new.category,new.bucket_id,new.storage_path,new.original_filename,new.size_bytes,new.mime_type,new.visibility,new.upload_revision)
      is distinct from (old.id,old.order_id,old.uploader_id,old.category,old.bucket_id,old.storage_path,old.original_filename,old.size_bytes,old.mime_type,old.visibility,old.upload_revision) then raise exception 'Immutable upload metadata'; end if;
    if old.status in ('ready','deleted') and (new.status,new.content_sha256) is distinct from (old.status,old.content_sha256) then raise exception 'Immutable finalized file'; end if;
    if old.status='quarantined' and new.status not in ('quarantined','deleted') then raise exception 'Quarantined file'; end if;
    if new.status='ready' and (new.content_sha256 ~ '^[a-f0-9]{64}$') is not true then raise exception 'Verified bytes required'; end if;
  end if;
  return new;
end $$;
create trigger guard_workspace_file before update on public.order_files for each row execute function private.guard_workspace_file();

-- Shared order -> brief lock order matches the brief submission/review RPCs.
create function private.file_editable(p_actor uuid,p_order uuid,p_revision integer) returns void
language plpgsql security definer set search_path='' as $$
declare item public.orders; brief public.briefs;
begin
  if not exists(select 1 from auth.users where id=p_actor and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verified client required'; end if;
  select * into item from public.orders where id=p_order for update;
  if not found or item.client_id is distinct from p_actor or item.payment_status<>'paid' or item.work_status in ('cancelled','completed') or item.work_started_at is not null then raise exception 'Ineligible attachment'; end if;
  select * into brief from public.briefs where order_id=p_order for update;
  if not found or (p_revision>=0) is not true or brief.revision is distinct from p_revision or brief.status not in ('incomplete','changes_requested') then raise exception 'Stale or locked brief'; end if;
end $$;

create function public.workspace_prepare_file(p_actor uuid,p_order uuid,p_revision integer,p_id uuid,p_name text,p_size bigint,p_mime text) returns text
language plpgsql security definer set search_path='' as $$
declare result text;
begin
  perform private.file_editable(p_actor,p_order,p_revision);
  if p_id is null or p_name is null or length(btrim(p_name)) not between 1 and 255 or p_name ~ '[[:cntrl:]/\\<>:"|?*]' or
    (p_size between 1 and 10485760) is not true or (p_mime in ('application/pdf','image/jpeg','image/png','image/webp','text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) is not true then raise exception 'Invalid file metadata'; end if;
  result=p_order::text||'/'||p_id::text;
  insert into public.order_files(id,order_id,uploader_id,category,bucket_id,storage_path,original_filename,size_bytes,mime_type,visibility,status,upload_revision)
    values(p_id,p_order,p_actor,'brief','client-briefs',result,p_name,p_size,p_mime,'client','pending',p_revision);
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_actor,'brief_file_prepared','order_files',p_id);
  return result;
end $$;

create function public.workspace_finalize_file(p_actor uuid,p_order uuid,p_revision integer,p_id uuid,p_valid boolean,p_hash text) returns boolean
language plpgsql security definer set search_path='' as $$
declare item public.order_files;
begin
  perform private.file_editable(p_actor,p_order,p_revision);
  select * into item from public.order_files where id=p_id and order_id=p_order for update;
  if not found or item.uploader_id is distinct from p_actor or item.category<>'brief' or item.bucket_id<>'client-briefs' or item.upload_revision is distinct from p_revision or p_valid is null then raise exception 'Invalid upload'; end if;
  if item.status='ready' then return true; end if;
  if item.status<>'pending' then return false; end if;
  if p_valid and (p_hash ~ '^[a-f0-9]{64}$') is not true then raise exception 'Verified bytes required'; end if;
  update public.order_files set status=case when p_valid then 'ready' else 'quarantined' end,content_sha256=case when p_valid then p_hash else null end where id=item.id;
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_actor,case when p_valid then 'brief_file_ready' else 'brief_file_quarantined' end,'order_files',item.id);
  return p_valid;
end $$;

create function public.workspace_discard_file(p_actor uuid,p_order uuid,p_revision integer,p_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare item public.order_files;
begin
  perform private.file_editable(p_actor,p_order,p_revision);
  select * into item from public.order_files where id=p_id and order_id=p_order for update;
  if not found or item.uploader_id is distinct from p_actor or item.category<>'brief' or item.bucket_id<>'client-briefs' then raise exception 'Invalid upload'; end if;
  if item.status='deleted' then return true; end if;
  if item.status not in ('pending','quarantined') then raise exception 'Finalized file retained'; end if;
  -- A stale pending upload can be logically discarded using the CURRENT brief
  -- revision, so a failed/abandoned transfer cannot permanently block submit.
  update public.order_files set status='deleted' where id=item.id;
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_actor,'brief_file_discarded','order_files',item.id);
  return true;
end $$;
revoke all on function private.guard_workspace_file(),private.file_editable(uuid,uuid,integer) from public,anon,authenticated,service_role;
revoke all on function public.workspace_prepare_file(uuid,uuid,integer,uuid,text,bigint,text),public.workspace_finalize_file(uuid,uuid,integer,uuid,boolean,text),public.workspace_discard_file(uuid,uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.workspace_prepare_file(uuid,uuid,integer,uuid,text,bigint,text),public.workspace_finalize_file(uuid,uuid,integer,uuid,boolean,text),public.workspace_discard_file(uuid,uuid,integer,uuid) to service_role;
commit;
