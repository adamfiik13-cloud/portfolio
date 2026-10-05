import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Disposable PostgreSQL and mocked provider transport; no hosted/vendor writes.
const root=process.cwd(),nativeRequire=createRequire(import.meta.url),cache=new Map()
let context={client:null,user:null,configured:false},rpcCalls=[]
function load(file) {
  let resolved=path.resolve(root,file);if(!path.extname(resolved))resolved+=fs.existsSync(resolved+'.ts')?'.ts':'.tsx'
  if(cache.has(resolved))return cache.get(resolved).exports
  if(resolved.endsWith('.json'))return JSON.parse(fs.readFileSync(resolved,'utf8'))
  const compiled={exports:{}};cache.set(resolved,compiled)
  const code=ts.transpileModule(fs.readFileSync(resolved,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const require=id=>id==='server-only'?{}:id==='next/navigation'?{notFound:()=>{throw Error('NEXT_NOT_FOUND')},redirect:()=>{throw Error('NEXT_REDIRECT')}}:['@/components/ui/BrandSignature','@/components/layout/LanguageSwitcher'].includes(id)?{__esModule:true,default:()=>null}:id==='@/components/layout/PublicLocaleProvider'?{PublicLocaleProvider:()=>null}:id==='@/components/policies/PolicyPage'?{PolicyBlockContent:()=>null}:id==='./CommerceForms'?{AcceptanceForm:()=>null,OwnerOfferForm:()=>null}:id==='@/lib/auth/context'?{authContext:async()=>context}:id==='@/lib/supabase/config'?{getSupabaseConfig:()=>({url:'https://example.invalid',key:'test'})}:id==='@supabase/supabase-js'?{createClient:()=>({rpc:async(name,args)=>{rpcCalls.push({name,args});return {data:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',error:null}}})}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(resolved),id)):nativeRequire(id)
  new Function('require','module','exports',code)(require,compiled,compiled.exports);return compiled.exports
}
let checks=0
function check(value){assert(value);checks++}
async function rejects(run,pattern){await assert.rejects(run,pattern);checks++}
const {validTerms,validOfferTerms,acceptanceInput}=load('lib/commerce/rules.ts')
const {orderDestination,queryOrderIntent}=load('lib/auth/order-intent.ts')
const {catalogTerms}=load('data/commerce-catalog.ts'),{catalogServices}=load('data/service-catalog.ts')
const {publicPage}=load('lib/analytics/rules.ts'),{analyticsPages}=load('data/analytics.ts')
const server=load('lib/commerce/server.ts')
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',owner='33333333-3333-4333-8333-333333333333',offer='44444444-4444-4444-8444-444444444444',key='55555555-5555-4555-8555-555555555555'
const fixture=locale=>{
  const value=catalogTerms('tracking-basic',locale).terms
  // Independent legacy submitOffer field order, before the hash fix.
  return {service_id:value.service_id,package_id:'custom-offer',service_name:value.service_name,amount_idr:100000,currency:'IDR',scope:value.scope,deliverables:value.deliverables,requirements:value.requirements,exclusions:value.exclusions,estimated_duration:value.estimated_duration,revision_rule:{description:value.revision_rule.description},milestones:[{label:locale==='en'?'Test milestone':'Milestone uji',amount_idr:100000}],cost_disclosure:locale==='en'?'Test-only commercial fixture, not approved public terms':'Fixture komersial khusus uji, bukan ketentuan publik disetujui'}
}
const terms={en:fixture('en'),id:fixture('id')}
check(validOfferTerms(terms));check(!validOfferTerms({...terms,id:{...terms.id,amount_idr:1}}));check(!validTerms({...terms.en,service_id:undefined}));check(!validTerms({...terms.en,milestones:[]}));check(!validTerms({...terms.en,cost_disclosure:''}));check(!validTerms({...terms.en,milestones:[{label:'Test',amount_idr:1}]}))
for(const service of catalogServices)for(const locale of ['en','id']){const c=catalogTerms(service.id,locale);check(!c.eligible&&c.missing.length>0);check(c.terms.estimated_duration.length>0&&c.terms.revision_rule.description.length>0)}
const form=new FormData();form.set('key',key);form.set('fingerprint','a'.repeat(64));check(!acceptanceInput(form));form.set('agreement','on');form.set('client_id',b);form.set('price','1');form.set('payment_status','paid');assert.deepEqual(acceptanceInput(form),{key,fingerprint:'a'.repeat(64)});checks++
for(const bad of ['https://attacker.invalid','//attacker.invalid','service:../account','offer:bad','service:x?next=https://attacker.invalid'])check(orderDestination(bad,'en')===null)
check(orderDestination('service:tracking-basic','id')==='/id/pemesanan?service=tracking-basic');check(orderDestination('offer:'+offer,'en')==='/offers/'+offer);check(queryOrderIntent({service:['bad']})==='')
for(const route of ['/checkout','/orders','/orders/'+key,'/offers/'+offer,'/owner/offers','/id/pemesanan','/id/pesanan','/id/penawaran/'+offer,'/id/pemilik/penawaran'])check(publicPage(route,analyticsPages)===null)
const previousEnv={APP_ENV:process.env.APP_ENV,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY}
process.env.APP_ENV='staging';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only'
await rejects(()=>server.placeOrder({key,locale:'en',offerId:offer,fingerprint:'a'.repeat(64)}),/Unauthorized/)
context={client:{from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{role:'team',active:true},error:null})})})})},user:{id:a},configured:true}
await rejects(()=>server.createOffer({id:offer,clientId:b,terms,expires:'2099-01-01T00:00:00Z'}),/Invalid offer/)
const eqCalls=[]
const selectedOffer={id:offer,client_id:a,status:'sent',expires_at:'2099-01-01T00:00:00Z',order_id:null,transaction_terms:terms,terms_sha256:server.hash(terms),version:1}
context.client={from:()=>{const filters=[];const query={select:()=>query,eq:(field,value)=>{filters.push([field,value]);eqCalls.push([field,value]);return query},maybeSingle:async()=>({data:filters.every(([field,value])=>selectedOffer[field]===value)?selectedOffer:null,error:null})};return query}}
const prepared=server.agreement(terms.en,'en',offer)
await rejects(()=>server.placeOrder({key,locale:'en',offerId:offer,fingerprint:'b'.repeat(64)}),/Changed agreement/)
check(rpcCalls.length===0)
await server.placeOrder({key,locale:'en',offerId:offer,fingerprint:prepared.fingerprint})
check(eqCalls.some(([field,value])=>field==='client_id'&&value===a));check(rpcCalls[0].args.p_client===a);check(rpcCalls[0].args.p_terms.amount_idr===100000);check(rpcCalls[0].args.p_agreed===true)
check(rpcCalls[0].args.p_policies.find(p=>p.policy_type==='privacy').version==='1.1')
check(rpcCalls[0].args.p_policies.filter(p=>p.policy_type!=='privacy').every(p=>p.version==='1.0'))
selectedOffer.status='accepted';await server.placeOrder({key,locale:'en',offerId:offer,fingerprint:prepared.fingerprint});check(rpcCalls.length===2)
await rejects(()=>server.placeOrder({key,locale:'en',serviceId:'tracking-basic',fingerprint:prepared.fingerprint}),/Incomplete terms/)
process.env.APP_ENV='production';check(!(await server.commerceContext()).configured)
for(const [name,value]of Object.entries(previousEnv)){if(value===undefined)delete process.env[name];else process.env[name]=value}

const db=new PGlite()
try {
  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
    create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
    alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;`)
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'))
  await db.exec(`insert into auth.users(id,email,email_confirmed_at)values('${a}','a@example.invalid',now()),('${b}','b@example.invalid',now()),('${owner}','owner@example.invalid',now());insert into public.staff_access(user_id,role)values('${owner}','owner');`)
  const create=(actor=owner,id=offer,expiry='2099-01-01T00:00:00Z')=>db.query('select public.commerce_create_offer($1,$2,$3,$4,$5,$6) as id',[actor,id,a,terms,server.hash(terms),expiry])
  const place=(client=a,requestKey=key,agreed=true,fingerprint=prepared.fingerprint,policy=prepared.policies,chosenOffer=offer)=>db.query('select public.commerce_place_order($1,$2,$3,$4,$5,$6,$7,$8) as id',[client,requestKey,'en',terms.en,fingerprint,policy,agreed,chosenOffer])
  await rejects(()=>create(a),/Owner required/)
  await create();await create();check((await db.query('select count(*)::int as n from custom_offers')).rows[0].n===1)
  // Real JSONB round trip of an existing offer: old raw hashing fails despite
  // valid, unchanged content. Read with authenticated RLS, not service role.
  const stored=(await db.query('select transaction_terms,terms_sha256 from custom_offers where id=$1',[offer])).rows[0]
  check(validOfferTerms(stored.transaction_terms))
  check(server.hash(stored.transaction_terms)!==stored.terms_sha256)
  check(server.offerHash(terms)===server.hash(terms))
  check(server.offerHash(stored.transaction_terms)===stored.terms_sha256)
  const savedContext=context,savedEnv=process.env.APP_ENV
  process.env.APP_ENV='staging'
  context={configured:true,user:{id:a},client:{from:table=>{
    assert.equal(table,'custom_offers');const filters=[]
    const query={select:()=>query,eq:(field,value)=>{filters.push([field,value]);return query},neq:()=>query,order:()=>query,limit:async()=>({data:(await db.query('select * from custom_offers where client_id=$1 and status<>\'draft\'',[context.user.id])).rows,error:null}),maybeSingle:async()=>{assert.deepEqual(filters.map(([f])=>f),['id','client_id']);return {data:(await db.query('select * from custom_offers where id=$1 and client_id=$2',filters.map(([,v])=>v))).rows[0]??null,error:null}}};return query
  }}}
  const {OffersPage}=load('components/commerce/CommercePages.tsx')
  for(const [locale,route]of [['en','app/(en)/offers/[id]/page.tsx'],['id','app/id/penawaran/[id]/page.tsx']]){
    await db.exec(`select set_config('request.jwt.claim.sub','${a}',false);set role authenticated;`)
    context.user={id:a}
    const listing=await OffersPage({locale})
    check(listing.props.children.props.children[0].props.children[0].props.href===(locale==='en'?'/offers/':'/id/penawaran/')+offer)
    const page=await load(route).default({params:Promise.resolve({id:offer})})
    check(page.props.locale===locale&&page.props.id===offer)
    const detail=await page.type(page.props)
    check(detail.props.suffix==='/'+offer)
    const current=await server.offerAgreement(offer,locale)
    check(current.canAccept&&current.terms.service_name===terms[locale].service_name)
    assert.deepEqual(current.terms,stored.transaction_terms[locale]);checks++
    await db.exec(`reset role;select set_config('request.jwt.claim.sub','${b}',false);set role authenticated;`)
    context.user={id:b}
    check((await db.query('select * from custom_offers where id=$1',[offer])).rows.length===0)
    check(await server.offerAgreement(offer,locale)===null)
    await rejects(()=>page.type(page.props),/NEXT_NOT_FOUND/)
    await db.exec('reset role')
  }
  // Hash verification still rejects altered values, nested fields, extra fields,
  // missing fields and hashes. No acceptance or mutation was used to open detail.
  context={...savedContext,user:{id:a}}
  const originalTerms=selectedOffer.transaction_terms,originalHash=selectedOffer.terms_sha256
  selectedOffer.transaction_terms=stored.transaction_terms
  for(const altered of [
    {...stored.transaction_terms,en:{...stored.transaction_terms.en,service_name:'Changed'}},
    {...stored.transaction_terms,id:{...stored.transaction_terms.id,revision_rule:{description:'Changed'}}},
    {...stored.transaction_terms,en:{...stored.transaction_terms.en,milestones:[{...stored.transaction_terms.en.milestones[0],label:'Changed'}]}},
    {...stored.transaction_terms,unexpected:'Unhashed content'},
    {...stored.transaction_terms,en:{...stored.transaction_terms.en,revision_rule:{...stored.transaction_terms.en.revision_rule,extra:'Unhashed'}}},
    {...stored.transaction_terms,en:{...stored.transaction_terms.en,scope:null}},
  ]){selectedOffer.transaction_terms=altered;for(const locale of ['en','id'])check(await server.offerAgreement(offer,locale)===null)}
  selectedOffer.transaction_terms=stored.transaction_terms
  for(const badHash of [null,'a'.repeat(64)]){selectedOffer.terms_sha256=badHash;check(await server.offerAgreement(offer,'en')===null)}
  selectedOffer.transaction_terms=originalTerms;selectedOffer.terms_sha256=originalHash
  check((await db.query('select count(*)::int as n from orders')).rows[0].n===0)
  context=savedContext
  if(savedEnv===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=savedEnv
  await rejects(()=>place(b),/Offer unavailable/);await rejects(()=>place(a,key,false),/Explicit acceptance required/)
  check((await db.query('select count(*)::int as n from orders')).rows[0].n===0)
  const created=(await place()).rows[0].id
  check((await place()).rows[0].id===created);check((await place(a,'66666666-6666-4666-8666-666666666666')).rows[0].id===created)
  await rejects(()=>place(a,key,true,'b'.repeat(64)),/Duplicate acceptance mismatch/)
  const o=(await db.query('select * from orders')).rows[0];check(o.client_id===a&&o.work_status==='draft'&&o.payment_status==='unpaid'&&o.refund_status==='none'&&o.work_started_at===null)
  check((await db.query('select count(*)::int as n from policy_acceptances')).rows[0].n===4)
  check((await db.query('select count(*)::int as n from order_snapshots')).rows[0].n===1)
  check((await db.query('select count(*)::int as n from payment_records')).rows[0].n===0)
  check((await db.query('select status from briefs')).rows[0].status==='incomplete')
  await rejects(()=>db.exec(`update orders set payment_status='paid' where id='${created}'`),/Verified payment required/)
  await rejects(()=>db.exec(`update orders set work_status='in_progress' where id='${created}'`),/Payment and approved brief/)
  for(const table of ['order_snapshots','policy_acceptances','policy_versions'])await rejects(()=>db.exec(`update ${table} set id=id`),/Immutable record/)
  await rejects(()=>db.exec(`update custom_offers set title='changed' where id='${offer}'`),/immutable/)
  const offer2='77777777-7777-4777-8777-777777777777';await create(owner,offer2)
  await rejects(()=>db.exec(`update custom_offers set transaction_terms='{}' where id='${offer2}'`),/immutable/)
  const mismatched=prepared.policies.map((p,i)=>i===0?{...p,content:'changed'}:p)
  await rejects(()=>place(a,'88888888-8888-4888-8888-888888888888',true,'c'.repeat(64),mismatched,offer2),/Policy version content changed/)
  check((await db.query('select count(*)::int as n from orders')).rows[0].n===1)
  await db.exec(`update custom_offers set status='expired' where id='${offer2}'`)
  await rejects(()=>place(a,'88888888-8888-4888-8888-888888888888',true,'c'.repeat(64),prepared.policies,offer2),/Offer unavailable/)
  await db.exec(`select set_config('request.jwt.claim.sub','${b}',false);set role authenticated;`)
  check((await db.query('select count(*)::int as n from orders')).rows[0].n===0);check((await db.query('select count(*)::int as n from custom_offers')).rows[0].n===0)
  await rejects(()=>place(),/permission denied/);await rejects(()=>create(),/permission denied/)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${a}',false);set role authenticated;`)
  check((await db.query('select count(*)::int as n from orders')).rows[0].n===1)
  await rejects(()=>db.exec('update orders set amount_idr=1'),/permission denied/)
  await rejects(()=>db.exec('update custom_offers set status=\'accepted\''),/permission denied/)
  console.log(`Commerce: ${checks} focused checks passed (local PostgreSQL, authorization, duplicate handling, immutable terms, policy acceptance, commercial completeness, analytics exclusion).`)
} finally {await db.close()}
