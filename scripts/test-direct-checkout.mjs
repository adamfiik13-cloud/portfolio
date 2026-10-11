import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Disposable PostgreSQL and mocked server dependencies only. No hosted writes,
// provider requests, real email, tokens or credentials.
const native=createRequire(import.meta.url),cache=new Map(),db=new PGlite()
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',owner='33333333-3333-4333-8333-333333333333',team='44444444-4444-4444-8444-444444444444'
let context={user:null,client:null,configured:true},checks=0,rpcCalls=[],orderReadFault=null
const check=value=>{assert(value);checks++}
const equal=(actual,expected)=>{assert.deepEqual(actual,expected);checks++}
const denied=async(fn,pattern)=>{await assert.rejects(fn,pattern);checks++}
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0]
const uuid=()=>scalar('select gen_random_uuid()')
const previousEnv={APP_ENV:process.env.APP_ENV,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY}
process.env.APP_ENV='staging';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only'
function client(){return {from:table=>{
  assert(['staff_access','catalog_compatibility','orders'].includes(table))
  let fields='',filters=[],maximum=''
  const select=async()=>{assert(/^[a-z_,]+$/.test(fields));assert(filters.every(([field])=>/^[a-z_]+$/.test(field)));return (await db.query(`select ${fields} from ${table}${filters.length?' where '+filters.map(([field],i)=>field+'=$'+(i+1)).join(' and '):''}${maximum}`,filters.map(([,value])=>value))).rows}
  const query={select:value=>{fields=value;return query},eq:(field,value)=>{filters.push([field,value]);return query},order:()=>query,limit:async value=>{assert.equal(value,30);maximum=' limit 30';return {data:await select(),error:null}},maybeSingle:async()=>{
    if(table==='orders')assert(filters.some(([field,value])=>field==='client_id'&&value===context.user.id))
    if(table==='orders'&&orderReadFault)return {data:null,error:orderReadFault==='error'?{message:'details withheld'}:null}
    return {data:(await select())[0]??null,error:null}
  }}
  return query
},rpc:async(name,args)=>{
  assert(['commerce_place_catalog_order','catalog_request_compatibility','catalog_review_compatibility'].includes(name))
  rpcCalls.push({name,args})
  try{return {data:await scalar(`select public.${name}(${Object.values(args).map((_,i)=>'$'+(i+1)).join(',')})`,Object.values(args)),error:null}}
  catch{return {data:null,error:{message:'details withheld'}}}
}}}
function AcceptanceForm(){return null}
function load(file){
  let full=path.resolve(file);if(!path.extname(full))full+=fs.existsSync(full+'.ts')?'.ts':'.tsx'
  if(cache.has(full))return cache.get(full).exports
  const mod={exports:{}};cache.set(full,mod)
  const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const require=id=>id==='server-only'?{}:id==='@/lib/auth/context'?{authContext:async()=>context}:id==='@/lib/supabase/config'?{getSupabaseConfig:()=>({url:'https://stage.example.invalid',key:'test-only'})}:id==='@supabase/supabase-js'?{createClient:()=>client()}:id==='next/cache'?{revalidatePath:()=>{}}:id==='next/navigation'?{redirect:url=>{throw new Error('NEXT_REDIRECT:'+url)},notFound:()=>{throw new Error('NEXT_NOT_FOUND')}}:['@/components/ui/BrandSignature','@/components/layout/LanguageSwitcher','./PaymentPanel','./CompatibilityForm','./ConfirmationPanel'].includes(id)?{__esModule:true,default:()=>null}:id==='@/components/layout/PublicLocaleProvider'?{PublicLocaleProvider:()=>null}:id==='@/components/policies/PolicyPage'?{PolicyBlockContent:()=>null}:id==='./CommerceForms'?{AcceptanceForm,OwnerOfferForm:()=>null}:id==='@/lib/payments/server'?{paymentReady:()=>false}:id==='@/lib/notifications/server'?{readConfirmationStatus:async()=>"not_recorded"}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(full),id)):native(id)
  new Function('require','module','exports',code)(require,mod,mod.exports);return mod.exports
}
const catalog=load('data/commerce-catalog.ts'),packages=load('data/direct-packages.ts'),server=load('lib/commerce/server.ts'),actions=load('lib/commerce/actions.ts'),rules=load('lib/commerce/rules.ts'),intent=load('lib/auth/order-intent.ts')
const {CheckoutPage,OrdersPage}=load('components/commerce/CommercePages.tsx')
function elements(value){return Array.isArray(value)?value.flatMap(elements):value&&typeof value==='object'&&value.props?[value,...elements(value.props.children)]:[]}
function textContent(value){return Array.isArray(value)?value.map(textContent).join(''):value&&typeof value==='object'&&value.props?textContent(value.props.children):typeof value==='string'?value:''}
const checkout=(locale,approval)=>CheckoutPage({locale,searchParams:Promise.resolve({service:'seo-foundation',output:'id',approval})})
const expectedPrices={'digital-business-consultation':150000,'marketing-marketplace-audit':200000,'tracking-basic':450000,'business-website':2750000,'seo-audit-roadmap':500000,'seo-foundation':950000,'ads-tracking':650000,'career-consultation':100000,'cv-review':75000,'cv-rewrite-optimization':150000}
const technical=new Set(['tracking-basic','business-website','seo-foundation','ads-tracking'])
const sqlPlace=(clientId,key,locale,terms,agreed=true,fingerprint=server.agreement(terms,locale).fingerprint)=>scalar('select public.commerce_place_catalog_order($1,$2,$3,$4,$5,$6,$7)',[clientId,key,locale,terms,fingerprint,server.policyBundle(locale),agreed])
function form(key,agreement,output='id'){
  const data=new FormData();data.set('key',key);data.set('fingerprint',agreement.fingerprint);data.set('outputLanguage',output);data.set('supportedConditions','on')
  return data
}
try{
  equal(packages.directPackages.map(p=>p.serviceId).sort(),Object.keys(expectedPrices).sort())
  for(const[id,price]of Object.entries(expectedPrices))for(const locale of ['en','id'])for(const output of ['en','id']){
    const selected=catalog.catalogTerms(id,locale,output)
    check(selected.eligible&&selected.missing.length===0&&rules.validTerms(selected.terms))
    equal(selected.terms.amount_idr,price);equal(selected.terms.currency,'IDR');equal(selected.terms.output_language,output)
    equal(selected.terms.specification_version,packages.DIRECT_PACKAGE_VERSION)
    equal(selected.terms.milestones.length,1);equal(selected.terms.milestones[0].amount_idr,price)
    check(selected.terms.tools.length>0&&selected.terms.brief_fields.length>0)
    equal(new Set(selected.terms.brief_fields.map(f=>f.id)).size,selected.terms.brief_fields.length)
    check(selected.terms.brief_fields.every(f=>typeof f.required==='boolean'&&f.label&&f.instruction))
    if(id.includes('consultation')||id==='marketing-marketplace-audit')check(!!selected.terms.scheduling_note)
    const encoded='service:'+id+':'+output
    equal(intent.queryOrderIntent({service:id,output}),encoded)
    equal(intent.intentQuery(encoded),'?service='+id+'&output='+output)
    equal(intent.orderDestination(encoded,locale),(locale==='en'?'/checkout':'/id/pemesanan')+'?service='+id+'&output='+output)
  }
  for(const id of ['landing-page-starter','custom-website','seo-growth','advanced-tracking','meta-ads-starter','meta-ads-growth','google-ads-starter','integrated-ads-management','marketplace-growth-plan'])check(!catalog.catalogTerms(id,'en').eligible)
  for(const value of ['service:tracking-basic:fr','service:tracking-basic:en:evil','service:../orders:en','service:tracking-basic?price=1'])equal(intent.orderDestination(value,'en'),null)
  equal(intent.queryOrderIntent({service:'tracking-basic',output:'fr'}),'service:tracking-basic')
  const formsSource=fs.readFileSync('components/commerce/CommerceForms.tsx','utf8')
  check(/type="checkbox" name="agreement" required/.test(formsSource)&&!formsSource.includes('defaultChecked'))

  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
    create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
    alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;`)
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'))
  await db.exec(`insert into auth.users(id,email,email_confirmed_at) values('${a}','a@example.invalid',now()),('${b}','b@example.invalid',now()),('${owner}','owner@example.invalid',now()),('${team}','team@example.invalid',now());insert into staff_access(user_id,role) values('${owner}','owner'),('${team}','team');`)
  context={user:{id:a},client:client(),configured:true}
  const agreement=await server.catalogAgreement('tracking-basic','en','id'),key=await uuid(),before=rpcCalls.length
  equal(agreement.existingOrderId,null)
  const missing=form(key,agreement);equal(await actions.acceptOrder('en','tracking-basic','',{},missing),{message:'invalid'});equal(rpcCalls.length,before)
  missing.set('agreement','on');missing.delete('outputLanguage');equal(await actions.acceptOrder('en','tracking-basic','',{},missing),{message:'invalid'});equal(rpcCalls.length,before)
  const noTechnical=form(key,agreement);noTechnical.set('agreement','on');noTechnical.delete('supportedConditions')
  equal(await actions.acceptOrder('en','tracking-basic','',{},noTechnical),{message:'invalid'});equal(rpcCalls.length,before)
  const tampered=form(key,agreement);tampered.set('agreement','on');tampered.set('amount_idr','1');tampered.set('price','1');tampered.set('client_id',b);tampered.set('payment_status','paid');tampered.set('role','owner')
  await denied(()=>actions.acceptOrder('en','tracking-basic','',{},tampered),/NEXT_REDIRECT:\/orders\//)
  const firstCall=rpcCalls.at(-1),order=await scalar('select id from orders where creation_key=$1',[key])
  equal(firstCall.name,'commerce_place_catalog_order');equal(firstCall.args.p_client,a);equal(firstCall.args.p_terms.amount_idr,450000);equal(firstCall.args.p_terms.output_language,'id')
  const duplicate=await server.placeOrder({key,locale:'en',serviceId:'tracking-basic',outputLanguage:'id',fingerprint:agreement.fingerprint})
  equal(duplicate,order)
  for(const[table,count]of [['orders',1],['order_snapshots',1],['policy_acceptances',4],['briefs',1],['payment_records',0]])equal(await scalar(`select count(*)::int from ${table}${table==='orders'?' where id=$1':' where order_id=$1'}`,[order]),count)
  const snapshot=await scalar('select selected_package from order_snapshots where order_id=$1',[order])
  equal(snapshot.terms.output_language,'id');equal(snapshot.terms.tools,agreement.terms.tools);equal(snapshot.terms.brief_fields,agreement.terms.brief_fields);equal(snapshot.terms.specification_version,packages.DIRECT_PACKAGE_VERSION)
  equal(await scalar('select payment_status from orders where id=$1',[order]),'unpaid');equal(await scalar('select work_status from orders where id=$1',[order]),'draft');equal(await scalar('select work_started_at from orders where id=$1',[order]),null)
  await denied(()=>db.query('update order_snapshots set selected_package=$1 where order_id=$2',[{...snapshot,terms:{...snapshot.terms,output_language:'en'}},order]),/Immutable/)
  await denied(async()=>server.placeOrder({key:await uuid(),locale:'en',serviceId:'tracking-basic',outputLanguage:'id',fingerprint:server.agreement({...agreement.terms,amount_idr:1,milestones:[{label:'Tampered',amount_idr:1}]},'en').fingerprint}),/Changed agreement/)
  await denied(async()=>server.placeOrder({key:await uuid(),locale:'en',serviceId:'tracking-basic',outputLanguage:'fr',fingerprint:agreement.fingerprint}),/Incomplete terms/)
  await denied(async()=>sqlPlace(a,await uuid(),'en',{...agreement.terms,amount_idr:1,milestones:[{label:'Tampered',amount_idr:1}]}),/Unapproved catalog terms/)
  await denied(async()=>sqlPlace(a,await uuid(),'en',agreement.terms,false),/Explicit acceptance required/)
  for(const changed of [{...agreement.terms,package_id:'custom-offer'},{...agreement.terms,specification_version:'old'},{...agreement.terms,output_language:null},{...agreement.terms,milestones:[{label:'First',amount_idr:200000},{label:'Second',amount_idr:250000}]}])await denied(async()=>sqlPlace(a,await uuid(),'en',changed),/Unapproved catalog terms/)

  // Every approved package is accepted under both contract languages. Foundation
  // needs a genuine owner-reviewed request bound to its target and specification.
  for(const[id,price]of Object.entries(expectedPrices)){
    if(id==='seo-foundation')continue
    for(const locale of ['en','id']){
      const selected=await server.catalogAgreement(id,locale,locale==='en'?'id':'en'),requestKey=await uuid()
      const result=await server.placeOrder({key:requestKey,locale,serviceId:id,outputLanguage:selected.terms.output_language,fingerprint:selected.fingerprint})
      equal(await scalar('select amount_idr::int from orders where id=$1',[result]),price)
      equal(await scalar('select count(*)::int from policy_acceptances where order_id=$1',[result]),4)
      equal(await scalar('select count(*)::int from order_snapshots where order_id=$1',[result]),1)
      if(technical.has(id))check(selected.terms.technical_conditions.length>0)
    }
  }
  equal(await server.catalogAgreement('seo-foundation','en','id'),null)
  await denied(async()=>server.placeOrder({key:await uuid(),locale:'en',serviceId:'seo-foundation',outputLanguage:'id',fingerprint:'a'.repeat(64)}),/Compatibility approval required/)
  for(const[url,platform]of [['https://user:password@example.invalid','wordpress'],['https://example.invalid?secret=example','nextjs'],['https://example.invalid#fragment','wordpress'],['https://example.invalid','unsupported']])await denied(()=>server.requestCompatibility(url,platform))
  const approval=await server.requestCompatibility('https://website.example.invalid','wordpress')
  equal(await server.requestCompatibility('https://website.example.invalid','wordpress'),approval)
  equal((await server.compatibilityRequests()).length,1);equal(await server.catalogAgreement('seo-foundation','en','id',approval),null)
  context.user={id:b};equal((await server.compatibilityRequests()).length,0);equal(await server.catalogAgreement('seo-foundation','en','id',approval),null)
  await denied(()=>server.reviewCompatibility(approval,true),/Unauthorized/)
  await denied(()=>scalar('select catalog_review_compatibility($1,$2,$3)',[b,approval,true]),/Owner required/)
  context.user={id:team};await denied(()=>server.reviewCompatibility(approval,true),/Unauthorized/)
  context.user={id:owner};await server.reviewCompatibility(approval,true)
  equal(await scalar('select reviewed_by from catalog_compatibility where id=$1',[approval]),owner)
  context.user={id:a}
  for(const locale of ['en','id']){
    const prepared=await server.catalogAgreement('seo-foundation',locale,'id',approval);check(!!prepared);equal(prepared.existingOrderId,null);equal(prepared.terms.compatibility_target,{url:'https://website.example.invalid/',platform:'wordpress'})
    const page=await checkout(locale,approval),acceptance=elements(page).filter(node=>node.type===AcceptanceForm)
    equal(acceptance.length,1);equal(acceptance[0].props.approvalId,approval);equal(acceptance[0].props.fingerprint,prepared.fingerprint)
    check(!textContent(page).includes(locale==='en'?'This approval has already been used':'Approval ini sudah digunakan'))
  }
  const foundation=await server.catalogAgreement('seo-foundation','en','id',approval),foundationKey=await uuid()
  for(const changed of [{...foundation.terms,compatibility_target:{url:'https://other.example.invalid/',platform:'wordpress'}},{...foundation.terms,compatibility_target:{...foundation.terms.compatibility_target,platform:'nextjs'}},{...foundation.terms,specification_version:'old'},{...foundation.terms,compatibility_approval_id:undefined}])await denied(async()=>sqlPlace(a,await uuid(),'en',changed),/Owner compatibility approval required|Unapproved catalog terms/)
  await denied(async()=>sqlPlace(b,await uuid(),'en',foundation.terms),/Owner compatibility approval required/)
  const foundationOrder=await server.placeOrder({key:foundationKey,locale:'en',serviceId:'seo-foundation',outputLanguage:'id',approvalId:approval,fingerprint:foundation.fingerprint})
  equal(await server.placeOrder({key:foundationKey,locale:'en',serviceId:'seo-foundation',outputLanguage:'id',approvalId:approval,fingerprint:foundation.fingerprint}),foundationOrder)
  equal(await scalar('select order_id from catalog_compatibility where id=$1',[approval]),foundationOrder)
  for(const locale of ['en','id']){
    const current=await server.catalogAgreement('seo-foundation',locale,'id',approval)
    equal(current.existingOrderId,foundationOrder)
    equal(current.fingerprint,server.agreement(current.terms,locale).fingerprint)
    check(!('existingOrderId' in current.terms))
    const page=await checkout(locale,approval),nodes=elements(page)
    equal(nodes.filter(node=>node.type===AcceptanceForm).length,0)
    check(textContent(page).includes(locale==='en'?'This approval has already been used to create an order.':'Approval ini sudah digunakan untuk membuat pesanan.'))
    const link=nodes.find(node=>node.type==='a'&&textContent(node)===(locale==='en'?'Open existing order':'Buka pesanan yang sudah ada'))
    check(!!link);equal(link.props.href,(locale==='en'?'/orders/':'/id/pesanan/')+foundationOrder)
  }
  const resumed=await server.catalogAgreement('seo-foundation','en','id',approval)
  equal(resumed.fingerprint,foundation.fingerprint);equal(resumed.terms,foundation.terms)
  const actionRetry=form(foundationKey,foundation);actionRetry.set('agreement','on');actionRetry.set('approvalId',approval)
  await denied(()=>actions.acceptOrder('en','seo-foundation','',{},actionRetry),new RegExp('NEXT_REDIRECT:/orders/'+foundationOrder))
  equal(await scalar('select count(*)::int from orders where creation_key=$1',[foundationKey]),1)
  equal(await scalar('select count(*)::int from order_snapshots where order_id=$1',[foundationOrder]),1)
  equal(await scalar('select count(*)::int from policy_acceptances where order_id=$1',[foundationOrder]),4)
  orderReadFault='missing';equal(await server.catalogAgreement('seo-foundation','en','id',approval),null)
  orderReadFault='error';await denied(()=>server.catalogAgreement('seo-foundation','en','id',approval),/Commerce unavailable/);orderReadFault=null
  const ordersBeforeReuse=await scalar('select count(*)::int from orders')
  await denied(async()=>server.placeOrder({key:await uuid(),locale:'en',serviceId:'seo-foundation',outputLanguage:'id',approvalId:approval,fingerprint:foundation.fingerprint}),/Commerce unavailable/)
  const differentKey=form(await uuid(),foundation);differentKey.set('agreement','on');differentKey.set('approvalId',approval)
  equal(await actions.acceptOrder('en','seo-foundation','',{},differentKey),{message:'unavailable'})
  equal(await scalar('select count(*)::int from orders'),ordersBeforeReuse)
  const rejected=await server.requestCompatibility('https://rejected.example.invalid','nextjs')
  context.user={id:owner};await server.reviewCompatibility(rejected,false);context.user={id:a}
  equal(await server.catalogAgreement('seo-foundation','id','en',rejected),null)
  await denied(async()=>sqlPlace(a,await uuid(),'en',{...foundation.terms,compatibility_approval_id:rejected,compatibility_target:{url:'https://rejected.example.invalid/',platform:'nextjs'}}),/Owner compatibility approval required/)
  context.user=null;await denied(async()=>server.placeOrder({key:await uuid(),locale:'en',serviceId:'tracking-basic',fingerprint:agreement.fingerprint}),/Unauthorized/)
  context.user={id:a}
  process.env.APP_ENV='production';check(!(await server.commerceContext()).configured);await denied(()=>server.requestCompatibility('https://site.example.invalid','wordpress'),/Unauthorized/);process.env.APP_ENV='staging'
  // RLS separates client transactions and approvals; browsers cannot invoke any
  // privileged compatibility/order RPC even for their own client ID.
  await db.exec(`select set_config('request.jwt.claim.sub','${b}',false);set role authenticated;`)
  context.user={id:b}
  equal(await scalar('select count(*)::int from orders'),0);equal(await scalar('select count(*)::int from catalog_compatibility'),0)
  for(const locale of ['en','id']){
    equal(await server.catalogAgreement('seo-foundation',locale,'id',approval),null)
    const page=await checkout(locale,approval),nodes=elements(page)
    equal(nodes.filter(node=>node.type===AcceptanceForm).length,0)
    check(!nodes.some(node=>node.type==='a'&&node.props.href===(locale==='en'?'/orders/':'/id/pesanan/')+foundationOrder))
    await denied(()=>OrdersPage({locale,id:foundationOrder}),/NEXT_NOT_FOUND/)
    const foreignRetry=form(foundationKey,foundation);foreignRetry.set('agreement','on');foreignRetry.set('approvalId',approval)
    equal(await actions.acceptOrder(locale,'seo-foundation','',{},foreignRetry),{message:'unavailable'})
  }
  await denied(()=>sqlPlace(a,key,'en',agreement.terms),/permission denied/)
  await denied(()=>scalar('select catalog_request_compatibility($1,$2,$3,$4)',[b,'https://new.example.invalid/','wordpress',packages.DIRECT_PACKAGE_VERSION]),/permission denied/)
  await denied(()=>scalar('select catalog_review_compatibility($1,$2,$3)',[owner,approval,true]),/permission denied/)
  await denied(()=>db.exec("update catalog_compatibility set status='approved'"),/permission denied/)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${a}',false);set role authenticated;`)
  context.user={id:a}
  check(await scalar('select count(*)::int from orders')>0);equal(await scalar('select count(*)::int from catalog_compatibility'),2)
  equal((await server.catalogAgreement('seo-foundation','en','id',approval)).existingOrderId,foundationOrder)
  await db.exec('reset role;set role anon');await denied(()=>sqlPlace(a,key,'en',agreement.terms),/permission denied/);await db.exec('reset role')
  equal(await scalar("select has_function_privilege('service_role','public.commerce_place_catalog_order(uuid,uuid,text,jsonb,text,jsonb,boolean)','execute')"),true)
  console.log(`Direct checkout: ${checks} focused checks passed (approved terms, server prices, explicit acceptance, output-language intent, atomic duplicates, immutable snapshots, owner compatibility/target binding and RLS). Local PGlite only; hosted concurrency/technical review remains operator QA.`)
}finally{
  await db.close()
  for(const[name,value]of Object.entries(previousEnv)){if(value===undefined)delete process.env[name];else process.env[name]=value}
}
