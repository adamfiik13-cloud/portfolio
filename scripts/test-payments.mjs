import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Local PostgreSQL / mocked HTTP only: no hosted queries or payment creation.
const native=createRequire(import.meta.url),cache=new Map(),db=new PGlite()
let checks=0,context={client:null,user:null},transportCalls=[],mode='ok',statusBody=null,databaseCalls=0
const check=value=>{assert(value);checks++}
const equal=(a,b)=>{assert.deepEqual(a,b);checks++}
const denied=async(fn,pattern)=>{await assert.rejects(fn,pattern);checks++}
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',owner='33333333-3333-4333-8333-333333333333'
const env={APP_ENV:'staging',MIDTRANS_ENVIRONMENT:'sandbox',MIDTRANS_MERCHANT_ID:'TEST-MERCHANT',MIDTRANS_CLIENT_KEY:'Mid-client-test-only',MIDTRANS_SERVER_KEY:'Mid-server-test-only',SUPABASE_STAGING_PROJECT_REF:'stage',SUPABASE_PRODUCTION_PROJECT_REF:'prod',SUPABASE_PROJECT_REF:'stage',SUPABASE_SERVICE_ROLE_KEY:'test-only',NEXT_PUBLIC_SUPABASE_URL:'https://stage.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'test-only'}
const savedEnv=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]])),oldFetch=globalThis.fetch
Object.assign(process.env,env)
function queryClient(){return {from:table=>{
  assert(['orders','payment_records'].includes(table));let fields='',filters=[],sort='',maximum=''
  const q={select:value=>{fields=value;return q},eq:(key,value)=>{filters.push([key,value]);return q},order:key=>{assert.equal(key,'attempt_number');sort=' order by attempt_number desc';return q},limit:value=>{assert.equal(value,1);maximum=' limit 1';return q},maybeSingle:async()=>{
    databaseCalls++
    assert(/^[a-z_,]+$/.test(fields));assert(filters.every(([key])=>/^[a-z_]+$/.test(key)))
    if(table==='orders')assert(filters.some(([key,value])=>key==='client_id'&&value===context.user.id))
    const rows=(await db.query(`select ${fields} from ${table} where ${filters.map(([key],i)=>key+'=$'+(i+1)).join(' and ')}${sort}${maximum}`,filters.map(([,v])=>v))).rows
    return {data:rows[0]??null,error:null}
  }};return q
},rpc:async(name,args)=>{
  databaseCalls++
  assert(['payments_reserve','payments_token','payments_apply'].includes(name))
  try{const values=Object.values(args),row=(await db.query(`select public.${name}(${values.map((_,i)=>'$'+(i+1)).join(',')}) as value`,values)).rows[0];return {data:row.value,error:null}}
  catch{return {data:null,error:{message:'details withheld'}}}
}}}
function load(file){
  let full=path.resolve(file);if(!path.extname(full))full+=fs.existsSync(full+'.ts')?'.ts':'.tsx'
  if(cache.has(full))return cache.get(full).exports
  const mod={exports:{}};cache.set(full,mod)
  const compiled=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const require=id=>id==='server-only'?{}:id==='@/lib/notifications/server'?{deliverPaymentConfirmation:async()=>{},schedulePaymentConfirmation:()=>{},readConfirmationStatus:async()=>"not_recorded"}:id==='@/lib/commerce/server'?{commerceContext:async()=>context}:id==='@supabase/supabase-js'?{createClient:()=>queryClient()}:id==='@/lib/auth/context'?{authContext:async()=>context}:id==='@/lib/supabase/config'?{getSupabaseConfig:()=>({url:process.env.NEXT_PUBLIC_SUPABASE_URL,key:'test'})}:id==='next/cache'?{revalidatePath:()=>{}}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(full),id)):native(id)
  new Function('require','module','exports',compiled)(require,mod,mod.exports);return mod.exports
}
globalThis.fetch=async(url,options)=>{
  transportCalls.push({url,options});check(options.cache==='no-store'&&options.redirect==='error'&&!!options.signal)
  assert(/^https:\/\/(app|api)\.sandbox\.midtrans\.com\//.test(url))
  if(url.includes('/snap/v1/transactions')){
    if(mode==='timeout')throw new Error('Mock timeout')
    if(mode==='malformed')return Response.json({bad:true})
    return Response.json({token:'test-only-snap-token-1234567890'})
  }
  if(mode==='notfound')return Response.json({status_code:'404'},{status:404})
  return Response.json(statusBody)
}
const rules=load('lib/payments/rules.ts'),provider=load('lib/payments/provider.ts'),workflow=load('lib/payments/workflow.ts'),server=load('lib/payments/server.ts')
const commerce=load('lib/commerce/server.ts'),catalog=load('data/commerce-catalog.ts')
const api=load('app/api/payments/midtrans/notification/route.ts'),actions=load('lib/payments/actions.ts')
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0]
const raw=(attempt,status='settlement',fraud='accept',refunded)=>({order_id:attempt.provider_reference,merchant_id:env.MIDTRANS_MERCHANT_ID,gross_amount:String(attempt.amount_idr)+'.00',currency:'IDR',transaction_id:'test-transaction-'+attempt.id,transaction_status:status,fraud_status:fraud,...(refunded?{refund_amount:String(refunded)+'.00'}:{})})
const signed=(attempt,status='pending')=>{
  const body={...raw(attempt,status),status_code:'200'}
  body.signature_key=createHash('sha512').update(body.order_id+body.status_code+body.gross_amount+env.MIDTRANS_SERVER_KEY).digest('hex')
  return body
}
const reserve=(order,replace=null)=>scalar('select public.payments_reserve($1,$2,$3,$4)',[a,order,env.MIDTRANS_MERCHANT_ID,replace])
const apply=async(attempt,status='settlement',fraud='accept',refunded)=>{
  const s=rules.verifiedStatus(raw(attempt,status,fraud,refunded),attempt,env.MIDTRANS_MERCHANT_ID)
  return scalar('select public.payments_apply($1,$2,$3,$4,$5,$6,$7,$8,$9)',[s.reference,s.merchant,s.amount,s.currency,s.transaction,s.status,s.fraud,s.refunded,rules.eventKey(s)])
}
try{
  check(server.paymentReady())
  for(const [clientKey,serverKey]of [['Mid-client-test-only','Mid-server-test-only'],['SB-Mid-client-test-only','SB-Mid-server-test-only'],['opaque-client-test-only','opaque-server-test-only']]){
    const config=rules.paymentConfig({...env,MIDTRANS_CLIENT_KEY:clientKey,MIDTRANS_SERVER_KEY:serverKey})
    equal(config.clientKey,clientKey);equal(config.serverKey,serverKey)
  }
  for(const field of ['MIDTRANS_CLIENT_KEY','MIDTRANS_SERVER_KEY'])for(const value of [undefined,null,123,'',' ',' test','test ','test key','test\tkey','test\rkey','test\nkey','test\0key','test\x7fkey','test\u0085key','test\u00a0key','test\u200bkey','test\u202ekey']){
    assert.throws(()=>rules.paymentConfig({...env,[field]:value}),/Sandbox payments unavailable/);checks++
  }
  for(const changed of [{APP_ENV:'production'},{VERCEL_ENV:'production'},{MIDTRANS_ENVIRONMENT:'production'},{MIDTRANS_SERVER_KEY:''},{MIDTRANS_CLIENT_KEY:''},{SUPABASE_PROJECT_REF:'prod'},{SUPABASE_STAGING_PROJECT_REF:'prod'},{SUPABASE_SERVICE_ROLE_KEY:''}]){
    const before=Object.fromEntries(Object.keys(changed).map(k=>[k,process.env[k]]));Object.assign(process.env,changed);check(!server.paymentReady());for(const[k,v]of Object.entries(before)){if(v===undefined)delete process.env[k];else process.env[k]=v}
  }
  const unsignedCalls=transportCalls.length,unsignedDatabaseCalls=databaseCalls
  equal((await api.POST(new Request('https://example.invalid',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}))).status,400)
  equal(transportCalls.length,unsignedCalls)
  equal(databaseCalls,unsignedDatabaseCalls)
  for(const bad of [null,0,'1.50','-1','1000000001.00','1e6','1.000'])assert.throws(()=>rules.idr(bad));checks+=7
  equal(rules.idr('2000000.00'),2000000)
  for(const[status,fraud,result]of [['settlement','','verified'],['capture','accept','verified'],['capture','challenge','pending'],['capture','deny','failed'],['pending','','pending'],['failure','','failed'],['deny','','failed'],['expire','','expired'],['cancel','','cancelled'],['refund','','verified'],['partial_refund','','verified']])equal(rules.statusMapping(status,fraud),result)
  for(const status of ['unknown','authorize','chargeback']){assert.throws(()=>rules.statusMapping(status,''));checks++}
  assert.throws(()=>rules.statusMapping('settlement','deny'));checks++
  const fake={id:a,provider_reference:'aw-sbx-'+a,amount_idr:2000000,currency:'IDR',merchant_id:env.MIDTRANS_MERCHANT_ID,transaction_id:null}
  const valid=signed(fake);check(rules.notification(valid,env.MIDTRANS_SERVER_KEY).reference===fake.provider_reference)
  for(const altered of [{...valid,gross_amount:'1.00'},{...valid,signature_key:'0'.repeat(128)},{...valid,status_code:null},{...valid,order_id:'../other'},{...valid,gross_amount:null}]){assert.throws(()=>rules.notification(altered,env.MIDTRANS_SERVER_KEY));checks++}
  for(const changed of [{gross_amount:'1.00'},{merchant_id:'other'},{currency:'USD'},{order_id:'other'},{transaction_id:null},{transaction_status:'unknown'},{fraud_status:null},{fraud_status:{}},{refund_amount:'1.00',transaction_status:'refund'},{refund_amount:'99999999.00',transaction_status:'partial_refund'}]){assert.throws(()=>rules.verifiedStatus({...raw(fake),...changed},fake,env.MIDTRANS_MERCHANT_ID));checks++}
  await denied(()=>provider.boundedJson(new Response('x'.repeat(65537))),/large/)
  await denied(()=>provider.boundedJson(new Response('{}',{headers:{'Content-Length':'65537'}})),/Invalid/)
  const transport=provider.provider('test-server',globalThis.fetch)
  mode='notfound';equal(await transport.status(fake.provider_reference),null);mode='malformed';await denied(()=>transport.create(fake.provider_reference,2000000),/uncertain/);mode='ok'

  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;`)
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'))
  await db.exec(`insert into auth.users(id,email,email_confirmed_at)values('${a}','a@example.invalid',now()),('${b}','b@example.invalid',now()),('${owner}','owner@example.invalid',now());insert into staff_access(user_id,role)values('${owner}','owner');`)
  async function newOrder(){
    const terms={...catalog.catalogTerms('tracking-basic','en').terms,amount_idr:2000000,milestones:[{label:'Test-only work allocation',amount_idr:2000000}],cost_disclosure:'Test-only costs fixture'}
    const policies=commerce.policyBundle('en'),key=await scalar('select gen_random_uuid()')
    return scalar('select public.commerce_place_order($1,$2,$3,$4,$5,$6,$7,$8)',[a,key,'en',terms,'a'.repeat(64),policies,true,null])
  }
  const order=await newOrder()
  await denied(()=>scalar('select public.payments_reserve($1,$2,$3,$4)',[b,order,env.MIDTRANS_MERCHANT_ID,null]),/Ineligible/)
  const competing=await Promise.all(Array.from({length:12},()=>reserve(order)))
  equal(competing.filter(r=>r.create).length,1);equal(new Set(competing.map(r=>r.attempt.id)).size,1)
  const attempt=competing[0].attempt
  equal(attempt.amount_idr,2000000);equal(attempt.currency,'IDR');check(/^aw-sbx-/.test(attempt.provider_reference))
  equal(await scalar('select count(*)::int from payment_records where order_id=$1',[order]),1)
  await scalar('select payments_token($1,$2)',[attempt.id,'test-only-snap-token-1234567890'])
  equal(await apply(attempt,'capture','challenge'),'pending')
  equal(await scalar('select payment_status from orders where id=$1',[order]),'pending')
  for(const params of [[attempt.provider_reference,'other',2000000,'IDR','test','settlement','accept',0,'b'.repeat(64)],[attempt.provider_reference,env.MIDTRANS_MERCHANT_ID,1,'IDR','test','settlement','accept',0,'b'.repeat(64)],[attempt.provider_reference,env.MIDTRANS_MERCHANT_ID,2000000,'USD','test','settlement','accept',0,'b'.repeat(64)],[attempt.provider_reference,env.MIDTRANS_MERCHANT_ID,2000000,'IDR','test','unknown','accept',0,'b'.repeat(64)],[attempt.provider_reference,env.MIDTRANS_MERCHANT_ID,2000000,'IDR','test','settlement','accept',null,'b'.repeat(64)]])await denied(()=>db.query('select payments_apply($1,$2,$3,$4,$5,$6,$7,$8,$9)',params))
  equal(await apply(attempt),'verified');equal(await apply(attempt),'verified')
  equal(await apply(attempt,'pending'),'verified');equal(await apply(attempt,'expire'),'verified')
  equal(await scalar('select payment_status from orders where id=$1',[order]),'paid')
  equal(await scalar('select work_status from orders where id=$1',[order]),'draft')
  equal(await scalar('select work_started_at from orders where id=$1',[order]),null)
  equal(await scalar('select status from briefs where order_id=$1',[order]),'incomplete')
  await denied(()=>db.query("update orders set work_status='in_progress' where id=$1",[order]),/approved brief/)
  await denied(()=>reserve(order),/Ineligible/)
  equal(await apply(attempt,'partial_refund','accept',500000),'verified')
  equal(await scalar('select refund_status from orders where id=$1',[order]),'partial')
  equal(await apply(attempt,'refund'),'verified');await apply(attempt,'partial_refund','accept',500000)
  equal(await scalar('select refund_status from orders where id=$1',[order]),'refunded')
  equal(await scalar('select payment_status from orders where id=$1',[order]),'paid')
  equal(await scalar('select count(*)::int from refunds'),0)
  check(await scalar('select count(*)::int from audit_events where action=\'sandbox_payment_reconciled\'')>0)
  check(await scalar('select count(*)::int from order_status_history where dimension=\'payment\'')>0)
  equal(await scalar('select count(*)::int from policy_acceptances where order_id=$1',[order]),4)
  equal(await scalar('select count(*)::int from order_snapshots where order_id=$1',[order]),1)

  // Failed attempts are not replaced without a fresh verified terminal response.
  const retryOrder=await newOrder(),first=(await reserve(retryOrder)).attempt
  await scalar('select payments_token($1,$2)',[first.id,null]);mode='notfound'
  const deps={merchant:env.MIDTRANS_MERCHANT_ID,reserve:replace=>reserve(retryOrder,replace),saveToken:(id,token)=>scalar('select payments_token($1,$2)',[id,token]),create:transport.create,status:transport.status,apply:s=>scalar('select payments_apply($1,$2,$3,$4,$5,$6,$7,$8,$9)',[s.reference,s.merchant,s.amount,s.currency,s.transaction,s.status,s.fraud,s.refunded,rules.eventKey(s)])}
  equal(await workflow.initiate(deps),{message:'uncertain'})
  equal(await scalar('select count(*)::int from payment_records where order_id=$1',[retryOrder]),1)
  mode='ok';await apply(first,'expire');statusBody=raw(first,'pending')
  equal(await workflow.initiate(deps),{message:'uncertain'})
  equal(await scalar('select count(*)::int from payment_records where order_id=$1',[retryOrder]),1)
  statusBody=raw(first,'expire');await workflow.initiate(deps)
  equal(await scalar('select count(*)::int from payment_records where order_id=$1',[retryOrder]),2)
  const second=(await reserve(retryOrder)).attempt
  check(second.provider_reference!==first.provider_reference);equal(second.attempt_number,2)
  statusBody=raw(second,'pending');const createdCalls=transportCalls.filter(c=>c.url.includes('/snap/v1/')).length
  const resumed=await workflow.initiate(deps);check(!!resumed.token)
  equal(transportCalls.filter(c=>c.url.includes('/snap/v1/')).length,createdCalls)
  await apply(first,'pending');equal(await scalar('select payment_status from orders where id=$1',[retryOrder]),'pending')
  const uncertainOrder=await newOrder();mode='timeout'
  let starts=0
  const uncertainDeps={...deps,reserve:replace=>reserve(uncertainOrder,replace),create:async(...args)=>{starts++;return transport.create(...args)}}
  equal(await workflow.initiate(uncertainDeps),{message:'uncertain'});mode='notfound'
  equal(await workflow.initiate(uncertainDeps),{message:'uncertain'});equal(starts,1)
  equal(await scalar('select count(*)::int from payment_records where order_id=$1',[uncertainOrder]),1)
  const concurrentOrder=await newOrder();mode='notfound'
  const beforeConcurrent=transportCalls.filter(c=>c.url.includes('/snap/v1/')).length
  const concurrentDeps={...deps,reserve:replace=>reserve(concurrentOrder,replace)}
  const concurrentResults=await Promise.all(Array.from({length:8},()=>workflow.initiate(concurrentDeps)))
  equal(transportCalls.filter(c=>c.url.includes('/snap/v1/')).length-beforeConcurrent,1)
  check(concurrentResults.some(result=>!!result.token))
  equal(await scalar('select count(*)::int from payment_records where order_id=$1',[concurrentOrder]),1)
  await denied(()=>db.query('update payment_records set amount_idr=1 where id=$1',[first.id]),/mismatch|Immutable/)
  await denied(()=>db.query('update payment_records set provider_reference=$1 where id=$2',['aw-sbx-'+b,first.id]),/Immutable/)
  await denied(()=>db.query("update payment_records set status='pending' where id=$1",[attempt.id]),/regress/)

  // Session authorization, forged browser fields and signed webhook + GET Status.
  context={client:queryClient(),user:{id:b}}
  equal(await actions.paymentAction(retryOrder,'pay'),{message:'unavailable'})
  context.user={id:owner};equal(await actions.paymentAction(retryOrder,'pay'),{message:'unavailable'})
  context.user=null;equal(await actions.paymentAction(retryOrder,'check'),{message:'unavailable'})
  context.user={id:a};mode='notfound';equal(await server.checkPayment(uncertainOrder),{message:'unselected'})
  mode='ok';statusBody=raw(second,'settlement');const obsolete=signed(second,'pending')
  const countBefore=transportCalls.length
  let response=await api.POST(new Request('https://example.invalid/api/payments/midtrans/notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...obsolete,signature_key:'0'.repeat(128)})}))
  equal(response.status,400);equal(transportCalls.length,countBefore)
  response=await api.POST(new Request('https://example.invalid/api/payments/midtrans/notification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obsolete)}))
  equal(response.status,200);equal(await scalar('select payment_status from orders where id=$1',[retryOrder]),'paid')
  equal(await server.beginPayment(retryOrder),{message:'verified'})
  // Forged browser amount is ignored: only stored agreement total reaches provider.
  const browserOrder=await newOrder()
  const browserResult=await actions.paymentAction(browserOrder,'pay',{amount_idr:1,client_id:b})
  check(!!browserResult.token&&browserResult.clientKey===env.MIDTRANS_CLIENT_KEY)
  equal(JSON.parse(transportCalls.filter(c=>c.url.includes('/snap/v1/')).at(-1).options.body).transaction_details.gross_amount,2000000)
  equal(transportCalls.filter(c=>c.url.includes('/snap/v1/')).at(-1).options.headers.Authorization,'Basic '+Buffer.from(env.MIDTRANS_SERVER_KEY+':').toString('base64'))
  check(!JSON.stringify(browserResult).includes(env.MIDTRANS_SERVER_KEY))
  equal(await actions.paymentAction(browserOrder,'invalid'),{message:'unavailable'})
  response=await api.POST(new Request('https://example.invalid',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(65537)}));equal(response.status,400)
  process.env.APP_ENV='production';response=await api.POST(new Request('https://example.invalid',{method:'POST',body:'{}'}));equal(response.status,503);process.env.APP_ENV='staging'

  await db.exec(`select set_config('request.jwt.claim.sub','${a}',false);set role authenticated;`)
  check((await db.query('select id,status from payment_records')).rows.length>0)
  await denied(()=>db.query('select snap_token from payment_records'),/permission denied/)
  await denied(()=>reserve(browserOrder),/permission denied/)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${b}',false);set role authenticated;`)
  equal(await scalar('select count(*)::int from payment_records'),0)
  await denied(()=>db.query("update payment_records set status='verified'"),/permission denied/)
  await db.exec('reset role;set role anon');await denied(()=>reserve(browserOrder),/permission denied/);await db.exec('reset role')
  const csp=load('lib/payments/staging-csp.ts').STAGING_PAYMENT_CSP
  check(csp.includes('frame-src \'self\' https://app.sandbox.midtrans.com'))
  check(!csp.includes('google-analytics.com')&&!csp.includes('https://app.midtrans.com')&&!csp.includes('unsafe-eval'))
  const proxy=fs.readFileSync('proxy.ts','utf8');check(!proxy.includes('/api/payments'))
  const privacy=load('lib/monitoring/privacy.ts').sanitizeErrorEvent({message:'raw Snap secret',extra:{token:'secret',signature:'secret',customer:'secret'},request:{data:'secret'},breadcrumbs:[{message:'secret'}]})
  check(!JSON.stringify(privacy).includes('secret'))
  console.log(`Payments: ${checks} checks passed (local DB/mocked provider, authorization, signatures/binding, reservation/retries, state ordering, refunds, incomplete-brief safeguard, isolation/CSP/privacy). Competing requests use PGlite's single connection; hosted delivery/concurrency remains manual QA.`)
}finally{await db.close();globalThis.fetch=oldFetch;for(const[k,v]of Object.entries(savedEnv)){if(v===undefined)delete process.env[k];else process.env[k]=v}}
