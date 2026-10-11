-- Phase 5 extension: owner-controlled SEO Foundation pre-payment eligibility.
-- Additive; operator applies only to verified staging after backup.
begin;
create table public.catalog_compatibility (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  service_id text not null check(service_id='seo-foundation'),
  specification_version text not null,
  website_url text not null check(length(website_url) between 8 and 500 and website_url ~ '^https?://'),
  platform text not null check(platform in ('wordpress','nextjs')),
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  reviewed_by uuid references public.staff_access(user_id) on delete restrict,
  reviewed_at timestamptz,
  order_id uuid unique references public.orders(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(client_id,service_id,specification_version,website_url,platform),
  check((status='pending' and reviewed_by is null and reviewed_at is null) or (status<>'pending' and reviewed_by is not null and reviewed_at is not null))
);
alter table public.catalog_compatibility enable row level security;
revoke all on public.catalog_compatibility from anon,authenticated;
grant select on public.catalog_compatibility to authenticated;
grant all on public.catalog_compatibility to service_role;
create policy catalog_compatibility_read on public.catalog_compatibility for select to authenticated using (
  client_id=auth.uid() or exists(select 1 from public.staff_access where user_id=auth.uid() and active and role='owner')
);

create function public.catalog_request_compatibility(p_client uuid,p_url text,p_platform text,p_version text) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  if not exists(select 1 from auth.users where id=p_client and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then raise exception 'Verified client required'; end if;
  if (p_platform in ('wordpress','nextjs')) is not true or p_version is distinct from 'phase5-2026-10-11' or p_url is null or
    length(p_url) not between 8 and 500 or p_url !~ '^https?://[^/@[:space:]?#]+[^[:space:]?#]*$' then raise exception 'Invalid compatibility request'; end if;
  insert into public.catalog_compatibility(client_id,service_id,specification_version,website_url,platform)
    values(p_client,'seo-foundation',p_version,p_url,p_platform)
    on conflict(client_id,service_id,specification_version,website_url,platform) do nothing returning id into result;
  if result is null then select id into result from public.catalog_compatibility where client_id=p_client and service_id='seo-foundation' and specification_version=p_version and website_url=p_url and platform=p_platform; end if;
  return result;
end $$;
create function public.catalog_review_compatibility(p_actor uuid,p_id uuid,p_approved boolean) returns boolean
language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.staff_access s join auth.users u on u.id=s.user_id where s.user_id=p_actor and s.active and s.role='owner' and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)) then raise exception 'Owner required'; end if;
  if p_approved is null then raise exception 'Explicit decision required'; end if;
  update public.catalog_compatibility set status=case when p_approved then 'approved' else 'rejected' end,reviewed_by=p_actor,reviewed_at=now()
    where id=p_id and status='pending' and order_id is null;
  if not found then return false; end if;
  insert into public.audit_events(actor_id,action,entity_type,entity_id) values(p_actor,'catalog_compatibility_reviewed','catalog_compatibility',p_id);
  return true;
end $$;

-- Atomic eligibility recheck before delegating to the existing snapshot/acceptance RPC.
create function public.commerce_place_catalog_order(p_client uuid,p_key uuid,p_locale text,p_terms jsonb,p_hash text,p_policies jsonb,p_agreed boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare approved public.catalog_compatibility; result uuid; expected bigint; service text=p_terms->>'service_id';
begin
  expected=case service when 'digital-business-consultation' then 150000 when 'marketing-marketplace-audit' then 200000 when 'tracking-basic' then 450000
    when 'business-website' then 2750000 when 'seo-audit-roadmap' then 500000 when 'seo-foundation' then 950000 when 'ads-tracking' then 650000
    when 'career-consultation' then 100000 when 'cv-review' then 75000 when 'cv-rewrite-optimization' then 150000 else null end;
  if expected is null or private.commerce_valid_terms(p_terms) is not true or p_terms->>'package_id' is distinct from service||':standard' or
    p_terms->>'specification_version' is distinct from 'phase5-2026-10-11' or (p_terms->>'output_language' in ('en','id')) is not true or
    p_terms->'amount_idr' is distinct from to_jsonb(expected) or jsonb_array_length(p_terms->'milestones')<>1 then raise exception 'Unapproved catalog terms'; end if;
  if service='seo-foundation' then
    if ((p_terms->>'compatibility_approval_id') ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$') is not true then raise exception 'Owner compatibility approval required'; end if;
    select * into approved from public.catalog_compatibility where id=(p_terms->>'compatibility_approval_id')::uuid for update;
    if not found or approved.client_id is distinct from p_client or approved.service_id is distinct from service or approved.status<>'approved' or
      approved.specification_version is distinct from p_terms->>'specification_version' or
      p_terms->'compatibility_target'->>'url' is distinct from approved.website_url or p_terms->'compatibility_target'->>'platform' is distinct from approved.platform then raise exception 'Owner compatibility approval required'; end if;
  end if;
  result=public.commerce_place_order(p_client,p_key,p_locale,p_terms,p_hash,p_policies,p_agreed,null);
  if service='seo-foundation' then
    if approved.order_id is not null and approved.order_id<>result then raise exception 'Approval already used'; end if;
    update public.catalog_compatibility set order_id=result where id=approved.id;
  end if;
  return result;
end $$;
revoke all on function public.catalog_request_compatibility(uuid,text,text,text),public.catalog_review_compatibility(uuid,uuid,boolean),public.commerce_place_catalog_order(uuid,uuid,text,jsonb,text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.catalog_request_compatibility(uuid,text,text,text),public.catalog_review_compatibility(uuid,uuid,boolean),public.commerce_place_catalog_order(uuid,uuid,text,jsonb,text,jsonb,boolean) to service_role;
commit;
