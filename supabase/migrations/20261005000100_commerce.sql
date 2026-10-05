-- Phase 4. Apply manually to verified staging only; never from build/deployment.
begin;
alter table public.orders add column creation_key uuid;
create unique index orders_creation_key_idx on public.orders(client_id,creation_key) where creation_key is not null;
alter table public.custom_offers add column transaction_terms jsonb not null default '{}'::jsonb;
alter table public.custom_offers add column terms_sha256 text check(terms_sha256 ~ '^[a-f0-9]{64}$');

-- Non-STRICT validators always return a boolean, including for SQL/JSON NULL.
-- Check container types before array operations or numeric/date casts.
create function private.commerce_valid_text(value jsonb,max_length integer default 6000)
returns boolean language sql immutable set search_path='' as $$
  select (jsonb_typeof(value)='string' and length(value#>>'{}') between 1 and max_length and (value#>>'{}') ~ '[^[:space:]]') is true
$$;
create function private.commerce_valid_terms(terms jsonb)
returns boolean language plpgsql immutable set search_path='' as $$
declare field text; item jsonb; amount numeric; total numeric=0;
begin
  if jsonb_typeof(terms) is distinct from 'object' then return false; end if;
  if not private.commerce_valid_text(terms->'service_id',100) or
    ((terms->>'service_id') ~ '^[a-z0-9]+(-[a-z0-9]+)*$') is not true then return false; end if;
  foreach field in array array['package_id','service_name','estimated_duration','cost_disclosure'] loop
    if not private.commerce_valid_text(terms->field) then return false; end if;
  end loop;
  if jsonb_typeof(terms->'amount_idr') is distinct from 'number' or terms->>'currency' is distinct from 'IDR' then return false; end if;
  amount=(terms->>'amount_idr')::numeric;
  if amount<=0 or amount>1000000000 or trunc(amount)<>amount then return false; end if;
  foreach field in array array['scope','deliverables','exclusions','requirements'] loop
    if jsonb_typeof(terms->field) is distinct from 'array' then return false; end if;
    if jsonb_array_length(terms->field) not between 1 and 40 then return false; end if;
    for item in select * from jsonb_array_elements(terms->field) loop
      if not private.commerce_valid_text(item) then return false; end if;
    end loop;
  end loop;
  if jsonb_typeof(terms->'revision_rule') is distinct from 'object' or
    not private.commerce_valid_text(terms->'revision_rule'->'description') then return false; end if;
  if jsonb_typeof(terms->'milestones') is distinct from 'array' then return false; end if;
  if jsonb_array_length(terms->'milestones') not between 1 and 20 then return false; end if;
  for item in select * from jsonb_array_elements(terms->'milestones') loop
    if jsonb_typeof(item) is distinct from 'object' or not private.commerce_valid_text(item->'label') or
      jsonb_typeof(item->'amount_idr') is distinct from 'number' then return false; end if;
    amount=(item->>'amount_idr')::numeric;
    if amount<=0 or amount>1000000000 or trunc(amount)<>amount then return false; end if;
    total=total+amount;
  end loop;
  -- Work-value allocations for refunds, never installments: payment stays 100% upfront.
  return (total=(terms->>'amount_idr')::numeric) is true;
end $$;
create function private.commerce_valid_offer_terms(terms jsonb)
returns boolean language plpgsql immutable set search_path='' as $$
declare position integer;
begin
  if jsonb_typeof(terms) is distinct from 'object' or
    not private.commerce_valid_terms(terms->'en') or not private.commerce_valid_terms(terms->'id') then return false; end if;
  if terms->'en'->>'service_id' is distinct from terms->'id'->>'service_id' or
    terms->'en'->>'package_id' is distinct from terms->'id'->>'package_id' or
    terms->'en'->'amount_idr' is distinct from terms->'id'->'amount_idr' or
    jsonb_array_length(terms->'en'->'milestones')<>jsonb_array_length(terms->'id'->'milestones') then return false; end if;
  for position in 0..jsonb_array_length(terms->'en'->'milestones')-1 loop
    if terms->'en'->'milestones'->position->'amount_idr' is distinct from terms->'id'->'milestones'->position->'amount_idr' then return false; end if;
  end loop;
  return true;
end $$;
create function private.commerce_valid_policies(policies jsonb,locale text)
returns boolean language plpgsql immutable set search_path='' as $$
declare policy jsonb; seen text[]='{}'; field text;
begin
  if (locale in ('en','id')) is not true or jsonb_typeof(policies) is distinct from 'array' then return false; end if;
  if jsonb_array_length(policies)<>4 then return false; end if;
  for policy in select * from jsonb_array_elements(policies) loop
    if jsonb_typeof(policy) is distinct from 'object' then return false; end if;
    foreach field in array array['policy_type','version','locale','effective_date','content','content_sha256'] loop
      if not private.commerce_valid_text(policy->field,2147483647) then return false; end if;
    end loop;
    if (policy->>'policy_type' in ('terms','service','refund','privacy')) is not true or
      policy->>'locale' is distinct from locale or policy->>'policy_type'=any(seen) or
      ((policy->>'content_sha256') ~ '^[a-f0-9]{64}$') is not true or
      ((policy->>'effective_date') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$') is not true then return false; end if;
    begin
      perform (policy->>'effective_date')::date;
    exception when invalid_datetime_format or datetime_field_overflow then return false;
    end;
    seen=array_append(seen,policy->>'policy_type');
  end loop;
  return true;
end $$;

create function private.guard_sent_offer() returns trigger language plpgsql set search_path='' as $$
begin
  if old.status in ('sent','accepted') and
    (new.client_id,new.title,new.scope,new.amount_idr,new.currency,new.estimated_duration,new.revision_rule,new.expires_at,new.created_by,new.transaction_terms,new.terms_sha256,new.offer_series_id,new.version)
    is distinct from
    (old.client_id,old.title,old.scope,old.amount_idr,old.currency,old.estimated_duration,old.revision_rule,old.expires_at,old.created_by,old.transaction_terms,old.terms_sha256,old.offer_series_id,old.version)
    then raise exception 'Sent offer terms are immutable; create a new version'; end if;
  return new;
end $$;
create trigger guard_sent_offer before update on public.custom_offers for each row execute function private.guard_sent_offer();

-- Only trusted, server-verified service-role callers can execute these atomic writes.
-- Public browser sessions retain the existing read-only RLS and cannot submit prices.
create function public.commerce_create_offer(p_actor uuid,p_id uuid,p_client uuid,p_terms jsonb,p_hash text,p_expires timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare existing public.custom_offers;
begin
  if not exists(select 1 from public.staff_access s join auth.users u on u.id=s.user_id where s.user_id=p_actor and s.active and s.role='owner' and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)) then raise exception 'Owner required'; end if;
  if not exists(select 1 from auth.users where id=p_client and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verified client required'; end if;
  if p_id is null or p_expires is null or p_expires<=now() or
    (p_hash ~ '^[a-f0-9]{64}$') is not true or private.commerce_valid_offer_terms(p_terms) is not true then raise exception 'Invalid offer'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
  select * into existing from public.custom_offers where id=p_id;
  if found then
    if existing.created_by is distinct from p_actor or existing.client_id is distinct from p_client or existing.terms_sha256 is distinct from p_hash or existing.expires_at is distinct from p_expires then raise exception 'Duplicate key mismatch'; end if;
    return existing.id;
  end if;
  insert into public.custom_offers(id,client_id,title,scope,amount_idr,estimated_duration,revision_rule,expires_at,status,created_by,transaction_terms,terms_sha256)
  values(p_id,p_client,p_terms->'en'->>'service_name',p_terms->'en'->'scope',(p_terms->'en'->>'amount_idr')::bigint,p_terms->'en'->>'estimated_duration',p_terms->'en'->'revision_rule',p_expires,'sent',p_actor,p_terms,p_hash);
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_actor,'offer_created','custom_offers',p_id);
  return p_id;
end $$;

create function public.commerce_place_order(p_client uuid,p_key uuid,p_locale text,p_terms jsonb,p_hash text,p_policies jsonb,p_agreed boolean,p_offer uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; previous_hash text; offer public.custom_offers; policy jsonb; version_id uuid; ids uuid[]='{}'; policy_ids text[]='{}'; stored public.policy_versions;
begin
  if p_agreed is distinct from true or p_key is null or (p_locale in ('en','id')) is not true or (p_hash ~ '^[a-f0-9]{64}$') is not true then raise exception 'Explicit acceptance required'; end if;
  if not exists(select 1 from auth.users where id=p_client and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verified client required'; end if;
  if private.commerce_valid_terms(p_terms) is not true then raise exception 'Incomplete transaction terms'; end if;
  if private.commerce_valid_policies(p_policies,p_locale) is not true then raise exception 'Invalid policy payload'; end if;
  if p_offer is not null then
    select * into offer from public.custom_offers where id=p_offer for update;
    if not found or offer.client_id is distinct from p_client or offer.transaction_terms->p_locale is distinct from p_terms then raise exception 'Offer unavailable'; end if;
    if offer.status='accepted' then
      select selected_package->>'acceptance_fingerprint' into previous_hash from public.order_snapshots where order_id=offer.order_id;
      if previous_hash is distinct from p_hash then raise exception 'Duplicate acceptance mismatch'; end if;
      return offer.order_id;
    end if;
    if offer.status<>'sent' or offer.expires_at<=now() then raise exception 'Offer unavailable'; end if;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_client::text||p_key::text,0));
  select o.id,s.selected_package->>'acceptance_fingerprint' into result,previous_hash from public.orders o join public.order_snapshots s on s.order_id=o.id where o.client_id=p_client and o.creation_key=p_key;
  if found then
    if previous_hash is distinct from p_hash then raise exception 'Duplicate key mismatch'; end if;
    return result;
  end if;
  for policy in select * from jsonb_array_elements(p_policies) loop
    if policy->>'locale' is distinct from p_locale or policy->>'policy_type'=any(policy_ids) then raise exception 'Policy locale/types mismatch'; end if;
    policy_ids=array_append(policy_ids,policy->>'policy_type');
    insert into public.policy_versions(policy_type,version,locale,effective_date,content,content_sha256,published_at)
    values(policy->>'policy_type',policy->>'version',p_locale,(policy->>'effective_date')::date,policy->>'content',policy->>'content_sha256',(policy->>'effective_date')::date::timestamptz)
    on conflict(policy_type,version,locale) do nothing;
    select * into stored from public.policy_versions where policy_type=policy->>'policy_type' and version=policy->>'version' and locale=p_locale;
    if stored.content is distinct from policy->>'content' or stored.content_sha256 is distinct from policy->>'content_sha256' or stored.effective_date is distinct from (policy->>'effective_date')::date then raise exception 'Policy version content changed'; end if;
    version_id=stored.id; ids=array_append(ids,version_id);
  end loop;
  insert into public.orders(client_id,service_id,locale,amount_idr,creation_key) values(p_client,p_terms->>'service_id',p_locale,(p_terms->>'amount_idr')::bigint,p_key) returning id into result;
  insert into public.order_snapshots(order_id,service_name,selected_package,agreed_amount_idr,scope,deliverables,requirements,exclusions,milestones,revision_rule,estimated_duration,cancellation_refund_terms,ownership_terms,confidentiality_terms,policy_version_ids,content_sha256)
  values(result,p_terms->>'service_name',jsonb_build_object('terms',p_terms,'acceptance_fingerprint',p_hash,'offer_id',p_offer,'client', (select jsonb_build_object('id',id,'display_name',display_name,'email',email) from public.profiles where id=p_client)),
    (p_terms->>'amount_idr')::bigint,p_terms->'scope',p_terms->'deliverables',p_terms->'requirements',p_terms->'exclusions',p_terms->'milestones',p_terms->'revision_rule',p_terms->>'estimated_duration',
    jsonb_build_object('policy_type','refund','content',p_policies),jsonb_build_object('policy_type','terms','content',p_policies),jsonb_build_object('policy_type','terms','content',p_policies),ids,p_hash);
  insert into public.policy_acceptances(order_id,user_id,policy_version_id,policy_type,version,locale,effective_date)
  select result,p_client,id,policy_type,version,locale,effective_date from public.policy_versions where id=any(ids);
  insert into public.briefs(order_id,required_inputs) values(result,p_terms->'requirements');
  if p_offer is not null then update public.custom_offers set status='accepted',accepted_at=now(),order_id=result where id=p_offer; end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_client,'order_agreement_accepted','orders',result);
  return result;
end $$;
revoke all on function private.guard_sent_offer() from public,anon,authenticated;
revoke all on function private.commerce_valid_text(jsonb,integer),private.commerce_valid_terms(jsonb),private.commerce_valid_offer_terms(jsonb),private.commerce_valid_policies(jsonb,text) from public,anon,authenticated,service_role;
revoke all on function public.commerce_create_offer(uuid,uuid,uuid,jsonb,text,timestamptz),public.commerce_place_order(uuid,uuid,text,jsonb,text,jsonb,boolean,uuid) from public,anon,authenticated;
grant execute on function public.commerce_create_offer(uuid,uuid,uuid,jsonb,text,timestamptz),public.commerce_place_order(uuid,uuid,text,jsonb,text,jsonb,boolean,uuid) to service_role;
commit;
