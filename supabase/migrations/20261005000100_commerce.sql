-- Phase 4. Apply manually to verified staging only; never from build/deployment.
begin;
alter table public.orders add column creation_key uuid;
create unique index orders_creation_key_idx on public.orders(client_id,creation_key) where creation_key is not null;
alter table public.custom_offers add column transaction_terms jsonb not null default '{}'::jsonb;
alter table public.custom_offers add column terms_sha256 text check(terms_sha256 ~ '^[a-f0-9]{64}$');

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
  if p_expires<=now() or p_hash !~ '^[a-f0-9]{64}$' or not (p_terms ? 'en' and p_terms ? 'id') or
    p_terms->'en'->>'service_id' is distinct from p_terms->'id'->>'service_id' or
    p_terms->'en'->>'amount_idr' is distinct from p_terms->'id'->>'amount_idr' then raise exception 'Invalid offer'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
  select * into existing from public.custom_offers where id=p_id;
  if found then
    if existing.created_by<>p_actor or existing.client_id<>p_client or existing.terms_sha256<>p_hash or existing.expires_at<>p_expires then raise exception 'Duplicate key mismatch'; end if;
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
  if p_agreed is distinct from true or p_key is null or p_locale not in ('en','id') or p_hash !~ '^[a-f0-9]{64}$' then raise exception 'Explicit acceptance required'; end if;
  if not exists(select 1 from auth.users where id=p_client and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verified client required'; end if;
  if jsonb_array_length(p_policies)<>4 or (p_terms->>'amount_idr')::bigint<=0 or p_terms->>'currency'<>'IDR' or
    jsonb_array_length(p_terms->'scope')=0 or jsonb_array_length(p_terms->'deliverables')=0 or jsonb_array_length(p_terms->'requirements')=0 or
    jsonb_array_length(p_terms->'exclusions')=0 or jsonb_array_length(p_terms->'milestones')=0 or
    coalesce(p_terms->>'estimated_duration','')='' or coalesce(p_terms->'revision_rule'->>'description','')='' or coalesce(p_terms->>'cost_disclosure','')='' or
    (select sum((m->>'amount_idr')::bigint) from jsonb_array_elements(p_terms->'milestones') m)<>(p_terms->>'amount_idr')::bigint then raise exception 'Incomplete transaction terms'; end if;
  if p_offer is not null then
    select * into offer from public.custom_offers where id=p_offer for update;
    if not found or offer.client_id<>p_client or offer.transaction_terms->p_locale<>p_terms then raise exception 'Offer unavailable'; end if;
    if offer.status='accepted' then
      select selected_package->>'acceptance_fingerprint' into previous_hash from public.order_snapshots where order_id=offer.order_id;
      if previous_hash<>p_hash then raise exception 'Duplicate acceptance mismatch'; end if;
      return offer.order_id;
    end if;
    if offer.status<>'sent' or offer.expires_at<=now() then raise exception 'Offer unavailable'; end if;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_client::text||p_key::text,0));
  select o.id,s.selected_package->>'acceptance_fingerprint' into result,previous_hash from public.orders o join public.order_snapshots s on s.order_id=o.id where o.client_id=p_client and o.creation_key=p_key;
  if found then
    if previous_hash<>p_hash then raise exception 'Duplicate key mismatch'; end if;
    return result;
  end if;
  for policy in select * from jsonb_array_elements(p_policies) loop
    if policy->>'locale'<>p_locale or policy->>'policy_type'=any(policy_ids) then raise exception 'Policy locale/types mismatch'; end if;
    policy_ids=array_append(policy_ids,policy->>'policy_type');
    insert into public.policy_versions(policy_type,version,locale,effective_date,content,content_sha256,published_at)
    values(policy->>'policy_type',policy->>'version',p_locale,(policy->>'effective_date')::date,policy->>'content',policy->>'content_sha256',(policy->>'effective_date')::date::timestamptz)
    on conflict(policy_type,version,locale) do nothing;
    select * into stored from public.policy_versions where policy_type=policy->>'policy_type' and version=policy->>'version' and locale=p_locale;
    if stored.content<>policy->>'content' or stored.content_sha256<>policy->>'content_sha256' or stored.effective_date<>(policy->>'effective_date')::date then raise exception 'Policy version content changed'; end if;
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
revoke all on function public.commerce_create_offer(uuid,uuid,uuid,jsonb,text,timestamptz),public.commerce_place_order(uuid,uuid,text,jsonb,text,jsonb,boolean,uuid) from public,anon,authenticated;
grant execute on function public.commerce_create_offer(uuid,uuid,uuid,jsonb,text,timestamptz),public.commerce_place_order(uuid,uuid,text,jsonb,text,jsonb,boolean,uuid) to service_role;
commit;
