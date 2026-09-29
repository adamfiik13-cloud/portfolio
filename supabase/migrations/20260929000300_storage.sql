begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
select name,name,false,10485760,array['application/pdf','image/jpeg','image/png','image/webp','text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
from unnest(array['client-briefs','work-files','deliverables']) as name
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create function private.can_read_file(target_bucket text,target_path text) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.order_files f where f.bucket_id=target_bucket and f.storage_path=target_path and f.status='ready'
    and (private.is_admin() or private.is_assigned(f.order_id) or (f.visibility='client' and private.is_client(f.order_id))))
$$;
revoke all on function private.can_read_file(text,text) from public,anon;
grant execute on function private.can_read_file(text,text) to authenticated;
-- Supabase already enables RLS on storage.objects. Unknown paths, pending,
-- quarantined and deleted objects remain unreadable even to normal admin sessions.
create policy order_file_download on storage.objects for select to authenticated using(
  bucket_id in ('client-briefs','work-files','deliverables') and private.can_read_file(bucket_id,name)
);
-- Upload/update/delete deliberately have NO API-user policy in Phase 3A.
-- Future authorized server upload writes metadata, checks actual bytes/MIME,
-- then releases the object. Original filenames are never storage paths.
commit;
