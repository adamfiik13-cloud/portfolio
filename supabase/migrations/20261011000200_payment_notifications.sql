-- Apply manually to the verified staging project only, after the catalogue migration.
-- No backfill: existing paid QA orders, snapshots and payment records remain unchanged.
begin;
create table public.payment_notifications (
  order_id uuid not null references public.orders(id) on delete restrict,
  notification_type text not null check(notification_type='payment_confirmation'),
  payment_id uuid not null,
  status text not null default 'pending' check(status in ('pending','sending','sent','retryable','manual_review')),
  attempts integer not null default 0 check(attempts>=0),
  last_error_code text check(last_error_code in ('configuration_unavailable','snapshot_invalid','provider_rejected','provider_uncertain','dedup_window_expired')),
  first_attempt_at timestamptz,
  lease uuid,
  lease_expires_at timestamptz,
  retry_after timestamptz,
  payload jsonb check(payload is null or jsonb_typeof(payload)='object'),
  provider_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(order_id,notification_type),
  foreign key(payment_id,order_id) references public.payment_records(id,order_id) on delete restrict,
  check(status<>'sent' or (provider_id is not null and sent_at is not null)),
  check(status<>'sending' or (lease is not null and lease_expires_at is not null and first_attempt_at is not null and payload is not null))
);
alter table public.payment_notifications enable row level security;
revoke all on public.payment_notifications from public,anon,authenticated,service_role;
grant select on public.payment_notifications to service_role;
grant select(order_id,notification_type,status,attempts,last_error_code,sent_at,created_at,updated_at) on public.payment_notifications to authenticated;
create policy notification_read on public.payment_notifications for select to authenticated using(private.is_client(order_id) or private.is_admin());

create function private.enqueue_payment_confirmation() returns trigger language plpgsql security definer set search_path='' as $$
declare verified uuid;
begin
  if old.payment_status is distinct from 'paid' and new.payment_status='paid' then
    select id into verified from public.payment_records where order_id=new.id and provider='midtrans-sandbox' and environment='sandbox'
      and status='verified' and verified_at is not null and amount_idr=new.amount_idr and currency=new.currency order by verified_at,id limit 1;
    if verified is not null then
      insert into public.payment_notifications(order_id,notification_type,payment_id) values(new.id,'payment_confirmation',verified)
        on conflict(order_id,notification_type) do nothing;
    end if;
  end if;
  return new;
end $$;
create trigger enqueue_payment_confirmation after update of payment_status on public.orders for each row execute function private.enqueue_payment_confirmation();

create function public.payment_notification_claim(p_order uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare n public.payment_notifications; o public.orders; s public.order_snapshots; claim uuid;
begin
  if p_order is null then raise exception 'Invalid notification'; end if;
  select * into n from public.payment_notifications where order_id=p_order and notification_type='payment_confirmation' for update;
  if not found or n.status in ('sent','manual_review') or n.lease_expires_at>now() or n.retry_after>now() then return null; end if;
  select * into o from public.orders where id=p_order;
  if not found or o.payment_status is distinct from 'paid' or not exists(select 1 from public.payment_records where id=n.payment_id and order_id=p_order and
    provider='midtrans-sandbox' and environment='sandbox' and status='verified' and verified_at is not null and amount_idr=o.amount_idr and currency=o.currency) then return null; end if;
  -- Resend retains provider idempotency keys for 24h. Conservatively stop before
  -- expiry; an uncertain/unstored receipt must be reviewed rather than duplicated.
  if n.first_attempt_at is not null and now()>=n.first_attempt_at+interval '23 hours 50 minutes' then
    update public.payment_notifications set status='manual_review',last_error_code='dedup_window_expired',lease=null,lease_expires_at=null,updated_at=now() where order_id=p_order;
    return null;
  end if;
  if n.payload is null then
    select * into s from public.order_snapshots where order_id=p_order;
    if not found or jsonb_typeof(p_payload) is distinct from 'object' or p_payload-array['from','to','reply_to','subject','text']<>'{}'::jsonb or
      p_payload->>'from' is distinct from 'Adam''s Work <no-reply@adamswork.app>' or p_payload->>'reply_to' is distinct from 'adamfiik13@gmail.com' or
      jsonb_typeof(p_payload->'to') is distinct from 'array' or p_payload->'to' is distinct from jsonb_build_array(s.selected_package->'client'->>'email') or
      jsonb_typeof(p_payload->'subject') is distinct from 'string' or length(p_payload->>'subject') not between 1 and 200 or
      jsonb_typeof(p_payload->'text') is distinct from 'string' or length(p_payload->>'text') not between 1 and 600000 then raise exception 'Invalid notification payload'; end if;
  end if;
  claim=gen_random_uuid();
  update public.payment_notifications set status='sending',attempts=attempts+1,lease=claim,lease_expires_at=now()+interval '3 minutes',
    first_attempt_at=coalesce(first_attempt_at,now()),payload=coalesce(payload,p_payload),last_error_code=null,retry_after=null,updated_at=now() where order_id=p_order returning * into n;
  return jsonb_build_object('lease',claim,'payload',n.payload,'idempotency_key','aw-staging-payment-confirmation/'||p_order::text);
end $$;

create function public.payment_notification_finish(p_order uuid,p_lease uuid,p_provider_id text,p_code text) returns boolean language plpgsql security definer set search_path='' as $$
begin
  if p_order is null or p_lease is null or (p_provider_id is null and (p_code is null or p_code not in ('provider_rejected','provider_uncertain'))) or
    (p_provider_id is not null and (p_provider_id !~ '^[a-zA-Z0-9_-]{1,128}$' or p_code is not null)) then raise exception 'Invalid notification result'; end if;
  update public.payment_notifications set status=case when p_provider_id is not null then 'sent' else 'retryable' end,
    provider_id=p_provider_id,sent_at=case when p_provider_id is not null then now() else null end,last_error_code=p_code,lease=null,lease_expires_at=null,
    retry_after=case when p_provider_id is null then now()+interval '1 minute' else null end,updated_at=now()
    where order_id=p_order and notification_type='payment_confirmation' and status='sending' and lease=p_lease;
  return found;
end $$;
create function public.payment_notification_unavailable(p_order uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  update public.payment_notifications set status='retryable',last_error_code='configuration_unavailable',updated_at=now()
    where order_id=p_order and notification_type='payment_confirmation' and status in ('pending','retryable');
end $$;
create function public.payment_notification_invalid(p_order uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  update public.payment_notifications set status='manual_review',last_error_code='snapshot_invalid',updated_at=now()
    where order_id=p_order and notification_type='payment_confirmation' and status in ('pending','retryable');
end $$;
revoke all on function private.enqueue_payment_confirmation() from public,anon,authenticated;
revoke all on function public.payment_notification_claim(uuid,jsonb),public.payment_notification_finish(uuid,uuid,text,text),public.payment_notification_unavailable(uuid),public.payment_notification_invalid(uuid) from public,anon,authenticated;
grant execute on function public.payment_notification_claim(uuid,jsonb),public.payment_notification_finish(uuid,uuid,text,text),public.payment_notification_unavailable(uuid),public.payment_notification_invalid(uuid) to service_role;
commit;
