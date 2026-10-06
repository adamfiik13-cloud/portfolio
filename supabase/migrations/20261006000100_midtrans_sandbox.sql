-- Phase 5 additive Sandbox attempts/reconciliation. Apply manually to staging only.
begin;
alter table public.payment_records
  add column environment text check(environment='sandbox'),
  add column merchant_id text,
  add column attempt_number integer,
  add column attempt_state text check(attempt_state in ('creating','ready','uncertain','terminal')),
  add column snap_token text,
  add column transaction_id text,
  add column provider_status text,
  add column refunded_amount_idr bigint not null default 0 check(refunded_amount_idr>=0 and refunded_amount_idr<=amount_idr),
  add constraint sandbox_attempt_fields check(provider <> 'midtrans-sandbox' or
    (environment is not distinct from 'sandbox' and merchant_id is not null and merchant_id ~ '^[a-zA-Z0-9_-]{1,80}$' and
     attempt_number is not null and attempt_number>0 and attempt_state is not null and provider_reference is not null and provider_reference ~ '^aw-sbx-[a-f0-9-]{36}$'));
create unique index sandbox_active_attempt on public.payment_records(order_id) where provider='midtrans-sandbox' and attempt_state in ('creating','ready','uncertain');
create unique index sandbox_attempt_number on public.payment_records(order_id,attempt_number) where provider='midtrans-sandbox';
-- Preserve existing RLS while preventing browser/owner reads of Snap capability tokens.
revoke select on public.payment_records from authenticated;
grant select(id,order_id,provider,provider_reference,amount_idr,currency,status,verified_at,created_at,updated_at,environment,merchant_id,attempt_number,attempt_state,transaction_id,provider_status,refunded_amount_idr) on public.payment_records to authenticated;

create function private.guard_sandbox_attempt() returns trigger language plpgsql set search_path='' as $$
begin
  if old.provider='midtrans-sandbox' and (new.order_id,new.provider,new.provider_reference,new.amount_idr,new.currency,new.environment,new.merchant_id,new.attempt_number) is distinct from
    (old.order_id,old.provider,old.provider_reference,old.amount_idr,old.currency,old.environment,old.merchant_id,old.attempt_number) then raise exception 'Immutable payment identity'; end if;
  if old.provider='midtrans-sandbox' and old.transaction_id is not null and new.transaction_id is distinct from old.transaction_id then raise exception 'Immutable transaction identity'; end if;
  if old.provider='midtrans-sandbox' and (old.status='verified' and new.status<>'verified' or new.refunded_amount_idr<old.refunded_amount_idr) then raise exception 'Payment state cannot regress'; end if;
  return new;
end $$;
create trigger guard_sandbox_attempt before update on public.payment_records for each row execute function private.guard_sandbox_attempt();

create function public.payments_reserve(p_client uuid,p_order uuid,p_merchant text,p_replace uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders; s public.order_snapshots; a public.payment_records;
begin
  if p_client is null or p_order is null or p_merchant is null or p_merchant !~ '^[a-zA-Z0-9_-]{1,80}$' or
    not exists(select 1 from auth.users where id=p_client and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Unauthorized payment'; end if;
  select * into o from public.orders where id=p_order and client_id=p_client for update;
  if not found or o.payment_status='paid' or o.work_status in ('cancelled','completed') or o.amount_idr<=0 then raise exception 'Ineligible payment'; end if;
  select * into s from public.order_snapshots where order_id=o.id;
  if not found or s.agreed_amount_idr is distinct from o.amount_idr or s.currency is distinct from o.currency or
    private.commerce_valid_terms(s.selected_package->'terms') is not true or
    (s.selected_package->'terms'->>'amount_idr')::bigint is distinct from o.amount_idr or
    (select count(*) from public.policy_acceptances where order_id=o.id and user_id=p_client and locale=o.locale and policy_version_id=any(s.policy_version_ids))<>4 then raise exception 'Complete immutable agreement required'; end if;
  select * into a from public.payment_records where order_id=o.id and provider='midtrans-sandbox' order by attempt_number desc limit 1;
  if found and (a.status='verified' or a.attempt_state in ('creating','ready','uncertain') or p_replace is distinct from a.id) then
    if a.merchant_id is distinct from p_merchant then raise exception 'Merchant mismatch'; end if;
    return jsonb_build_object('attempt',to_jsonb(a),'create',false);
  end if;
  insert into public.payment_records(order_id,provider,provider_reference,amount_idr,currency,environment,merchant_id,attempt_number,attempt_state)
  values(o.id,'midtrans-sandbox','aw-sbx-'||gen_random_uuid()::text,o.amount_idr,o.currency,'sandbox',p_merchant,coalesce(a.attempt_number,0)+1,'creating') returning * into a;
  update public.orders set payment_status='pending' where id=o.id;
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_client,'sandbox_payment_reserved','payment_records',a.id);
  return jsonb_build_object('attempt',to_jsonb(a),'create',true);
end $$;

create function public.payments_token(p_id uuid,p_token text) returns boolean language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
  if p_id is null or (p_token is not null and (length(p_token) not between 16 and 512 or p_token !~ '^[a-zA-Z0-9_-]+$')) then raise exception 'Invalid payment token'; end if;
  select order_id into target from public.payment_records where id=p_id and provider='midtrans-sandbox';
  perform 1 from public.orders where id=target for update;
  update public.payment_records set snap_token=p_token,attempt_state=case when p_token is null then 'uncertain' else 'ready' end
    where id=p_id and provider='midtrans-sandbox' and status='pending' and snap_token is null and attempt_state in ('creating','uncertain');
  return found;
end $$;

create function public.payments_apply(p_reference text,p_merchant text,p_amount bigint,p_currency text,p_transaction text,p_status text,p_fraud text,p_refunded bigint,p_event text) returns text language plpgsql security definer set search_path='' as $$
declare target uuid; o public.orders; a public.payment_records; mapped text; result text; event_id uuid; new_refund bigint;
begin
  if p_reference is null or p_merchant is null or p_amount is null or p_currency is distinct from 'IDR' or
    p_transaction is null or p_transaction !~ '^[a-zA-Z0-9_-]{1,128}$' or p_event is null or p_event !~ '^[a-f0-9]{64}$' or
    p_refunded is null or p_refunded<0 or p_refunded>p_amount or p_status is null or p_fraud is null then raise exception 'Invalid verified status'; end if;
  mapped=case when p_status='settlement' and p_fraud in ('','accept') or p_status='capture' and p_fraud='accept' or p_status in ('refund','partial_refund') then 'verified'
    when p_status='pending' or p_status='capture' and p_fraud in ('','challenge') then 'pending'
    when p_status in ('deny','failure') or p_status='capture' and p_fraud='deny' then 'failed'
    when p_status='expire' then 'expired' when p_status='cancel' then 'cancelled' else null end;
  if mapped is null or (p_status='refund' and p_refunded<>p_amount) or (p_status='partial_refund' and (p_refunded<=0 or p_refunded>=p_amount)) or
    (p_status not in ('refund','partial_refund') and p_refunded<>0) then raise exception 'Unknown or inconsistent status'; end if;
  select order_id into target from public.payment_records where provider='midtrans-sandbox' and provider_reference=p_reference;
  select * into o from public.orders where id=target for update;
  select * into a from public.payment_records where provider='midtrans-sandbox' and provider_reference=p_reference for update;
  if not found or a.environment is distinct from 'sandbox' or a.merchant_id is distinct from p_merchant or a.currency is distinct from p_currency or a.amount_idr is distinct from p_amount or
    (a.transaction_id is not null and a.transaction_id is distinct from p_transaction) then raise exception 'Payment binding mismatch'; end if;
  insert into public.payment_webhook_events(provider,provider_event_id,provider_reference,event_type,payload_sha256,processing_status)
    values('midtrans-sandbox',p_event,p_reference,p_status,p_event,'processing') on conflict(provider,provider_event_id) do nothing returning id into event_id;
  if event_id is null then return a.status; end if;
  result=case when a.status='verified' then 'verified' when a.status in ('failed','expired','cancelled') and mapped='pending' then a.status else mapped end;
  new_refund=greatest(a.refunded_amount_idr,p_refunded);
  update public.payment_records set status=result,transaction_id=p_transaction,
    provider_status=case when result<>mapped then provider_status else p_status end,refunded_amount_idr=new_refund,
    verified_at=case when result='verified' then coalesce(verified_at,now()) else verified_at end,
    attempt_state=case when result='pending' then case when snap_token is null then 'uncertain' else 'ready' end else 'terminal' end,
    snap_token=case when result='pending' then snap_token else null end where id=a.id;
  -- An older attempt cannot regress a paid order or overwrite the latest attempt.
  if result='verified' then
    update public.orders set payment_status='paid',refund_status=case when new_refund=p_amount then 'refunded' when new_refund>0 and refund_status<>'refunded' then 'partial' else refund_status end where id=o.id;
  elsif o.payment_status<>'paid' and a.id=(select id from public.payment_records where order_id=o.id and provider='midtrans-sandbox' order by attempt_number desc limit 1) then
    update public.orders set payment_status=result where id=o.id;
  end if;
  update public.payment_webhook_events set processing_status=case when result<>mapped then 'ignored' else 'processed' end,processed_at=now() where id=event_id;
  insert into public.audit_events(action,entity_type,entity_id,metadata) values('sandbox_payment_reconciled','payment_records',a.id,jsonb_build_object('from_status',a.status,'to_status',result));
  return result;
end $$;
revoke all on function private.guard_sandbox_attempt() from public,anon,authenticated;
revoke all on function public.payments_reserve(uuid,uuid,text,uuid),public.payments_token(uuid,text),public.payments_apply(text,text,bigint,text,text,text,text,bigint,text) from public,anon,authenticated;
grant execute on function public.payments_reserve(uuid,uuid,text,uuid),public.payments_token(uuid,text),public.payments_apply(text,text,bigint,text,text,text,text,bigint,text) to service_role;
commit;
