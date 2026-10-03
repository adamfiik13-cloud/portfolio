-- OPERATOR ONLY: run solely in adams-work-staging SQL Editor after checking
-- its project identity. This is not a migration and must never run in a build.
-- No Auth user is created, no production UUID is encoded, no role comes from a browser.
do $$
declare owner_id uuid; matches integer;
begin
  select count(*), min(id::text)::uuid into matches, owner_id
  from auth.users
  where lower(email) = 'adamfiik13@gmail.com'
    and email_confirmed_at is not null and coalesce(is_anonymous, false) = false
    and deleted_at is null;
  if matches <> 1 then raise exception 'Exactly one existing verified owner account is required'; end if;
  insert into public.profiles(id, email, display_name, locale)
  select id, email, 'Fikri Adam', 'en' from auth.users where id = owner_id
  on conflict(id) do update set email = excluded.email,
    display_name = case when public.profiles.display_name = '' then excluded.display_name else public.profiles.display_name end
    where public.profiles.email is distinct from excluded.email or public.profiles.display_name = '';
  insert into public.staff_access(user_id, role, active) values(owner_id, 'owner', true)
  on conflict(user_id) do update set role = 'owner', active = true
    where public.staff_access.role <> 'owner' or not public.staff_access.active;
end $$;
