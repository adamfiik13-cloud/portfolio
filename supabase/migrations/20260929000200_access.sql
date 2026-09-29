begin;
-- Definer helpers avoid recursive RLS on assignments/staff. No caller-supplied user ID.
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.staff_access where user_id=auth.uid() and active and role in ('owner','admin'))
$$;
create function private.is_assigned(target_order uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.team_assignments a join public.staff_access s on s.user_id=a.staff_id
    where a.order_id=target_order and a.staff_id=auth.uid() and a.status='active' and s.active)
$$;
create function private.is_client(target_order uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.orders where id=target_order and client_id=auth.uid())
$$;
create function private.can_read_order(target_order uuid) returns boolean language sql stable security definer set search_path='' as $$
  select private.is_admin() or private.is_assigned(target_order) or private.is_client(target_order)
$$;
revoke all on function private.is_admin(),private.is_assigned(uuid),private.is_client(uuid),private.can_read_order(uuid) from public,anon;
grant execute on function private.is_admin(),private.is_assigned(uuid),private.is_client(uuid),private.can_read_order(uuid) to authenticated;

do $$ declare t text; begin
  foreach t in array array['profiles','staff_access','orders','policy_versions','order_snapshots','briefs','team_assignments','order_messages','order_files','custom_offers','policy_acceptances','payment_records','payment_webhook_events','refunds','order_status_history','audit_events','system_health'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',t);
    execute format('grant select,insert,update,delete on public.%I to service_role',t);
    if t <> 'system_health' then execute format('grant select on public.%I to authenticated',t); end if;
  end loop;
end $$;
-- API users cannot insert/delete profiles or change auth-managed email, IDs, or roles.
grant update(display_name,locale) on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or private.is_admin());
create policy profile_edit on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy staff_read on public.staff_access for select to authenticated using(user_id=auth.uid() or private.is_admin());
create policy order_read on public.orders for select to authenticated using(private.can_read_order(id));
create policy snapshot_read on public.order_snapshots for select to authenticated using(private.can_read_order(order_id));
create policy brief_read on public.briefs for select to authenticated using(private.can_read_order(order_id));
create policy assignment_read on public.team_assignments for select to authenticated using(staff_id=auth.uid() or private.is_admin());
create policy message_read on public.order_messages for select to authenticated using(
  private.is_admin() or private.is_assigned(order_id) or (visibility='client' and private.is_client(order_id))
);
create policy file_read on public.order_files for select to authenticated using(
  private.is_admin() or private.is_assigned(order_id) or (visibility='client' and status='ready' and private.is_client(order_id))
);
create policy offer_read on public.custom_offers for select to authenticated using(private.is_admin() or (client_id=auth.uid() and status <> 'draft'));
create policy acceptance_read on public.policy_acceptances for select to authenticated using(user_id=auth.uid() or private.is_admin());
create policy version_read on public.policy_versions for select to authenticated using(private.is_admin() or exists(
  select 1 from public.policy_acceptances a where a.policy_version_id=policy_versions.id and a.user_id=auth.uid()
));
create policy payment_read on public.payment_records for select to authenticated using(private.is_admin() or private.is_client(order_id));
create policy refund_read on public.refunds for select to authenticated using(private.is_admin() or private.is_client(order_id));
create policy webhook_read on public.payment_webhook_events for select to authenticated using(private.is_admin());
create policy history_read on public.order_status_history for select to authenticated using(private.can_read_order(order_id));
create policy audit_read on public.audit_events for select to authenticated using(private.is_admin());
-- No other write policies. Future server endpoints must verify user + role + order
-- before privileged writes. An owner/admin browser session has no write bypass.
-- system_health has no anon/authenticated access, even for admin browser sessions.
revoke insert,update,delete on public.system_health from service_role;
commit;
