import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Local SQL/mocked Resend only. Never access hosted data or send actual email.
const native = createRequire(import.meta.url), cache = new Map(), db = new PGlite()
const a='11111111-1111-4111-8111-111111111111', b='22222222-2222-4222-8222-222222222222', owner='33333333-3333-4333-8333-333333333333'
let checks=0, context={client:null,user:null}, mode='ok', calls=[], deniedReads=false, scheduled=[], scheduleFails=false
const check=value=>{assert(value);checks++}, equal=(actual,expected)=>{assert.deepEqual(actual,expected);checks++}
const rejected=async(fn,pattern)=>{await assert.rejects(fn,pattern);checks++}
const env={APP_ENV:'staging',SUPABASE_STAGING_PROJECT_REF:'stage',SUPABASE_PRODUCTION_PROJECT_REF:'prod',SUPABASE_PROJECT_REF:'stage',SUPABASE_SERVICE_ROLE_KEY:'mock-only',NEXT_PUBLIC_SUPABASE_URL:'https://stage.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'mock-only',RESEND_API_KEY:'mock-resend-only'}
const saved=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]])), oldFetch=globalThis.fetch
Object.assign(process.env,env)
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0]
const event=attempt=>attempt.id.replaceAll('-','').repeat(2)
function client(){return {from:table=>{
  assert(['payment_notifications','orders','order_snapshots','staff_access'].includes(table))
  let fields='', filters=[]
  const q={select:value=>{fields=value;return q},eq:(field,value)=>{filters.push([field,value]);return q},maybeSingle:async()=>{
    assert(/^[a-z_,]+$/.test(fields));assert(filters.every(([field])=>/^[a-z_]+$/.test(field)))
    if(deniedReads)return {data:null,error:{message:'withheld'}}
    const result=await db.query(`select ${fields} from ${table} where ${filters.map(([field],i)=>field+'=$'+(i+1)).join(' and ')}`,filters.map(([,value])=>value))
    return {data:result.rows[0]??null,error:null}
  }};return q
},rpc:async(name,args)=>{
  assert(/^payment_notification_(claim|finish|unavailable|invalid)$/.test(name))
  try{return {data:await scalar(`select public.${name}(${Object.keys(args).map((_,i)=>'$'+(i+1)).join(',')})`,Object.values(args)),error:null}}
  catch{return {data:null,error:{message:'withheld'}}}
}}}
function load(file){
  let full=path.resolve(file);if(!path.extname(full))full+='.ts'
  if(cache.has(full))return cache.get(full).exports
  const mod={exports:{}};cache.set(full,mod)
  const compiled=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
  const require=id=>id==='server-only'?{}:id==='@supabase/supabase-js'?{createClient:client}:id==='@/lib/commerce/server'?{commerceContext:async()=>context}:id==='@/lib/supabase/config'?{getSupabaseConfig:()=>({url:process.env.NEXT_PUBLIC_SUPABASE_URL,key:'mock-only'})}:id==='next/cache'?{revalidatePath:()=>{}}:id==='next/server'?{after:fn=>{if(scheduleFails)throw new Error('Mock unavailable request context');scheduled.push(fn)}}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(full),id)):native(id)
  new Function('require','module','exports',compiled)(require,mod,mod.exports);return mod.exports
}
globalThis.fetch=async(url,options)=>{
  equal(url,'https://api.resend.com/emails');check(options.cache==='no-store'&&options.redirect==='error'&&options.signal)
  equal(options.headers.Authorization,'Bearer mock-resend-only')
  calls.push({key:options.headers['Idempotency-Key'],body:JSON.parse(options.body)})
  if(mode==='timeout')throw new Error('mock private payload should never be logged')
  if(mode==='reject')return Response.json({private:'never persisted'},{status:429})
  if(mode==='malformed')return Response.json({other:'never persisted'})
  if(mode==='oversize')return new Response('x'.repeat(8193))
  return Response.json({id:'test-safe-receipt'})
}
const content=load('lib/notifications/payment-content.ts'), sender=load('lib/notifications/resend.ts'), server=load('lib/notifications/server.ts'), actions=load('lib/notifications/actions.ts')
const terms=(locale='en')=>({service_id:'tracking-basic',package_id:'test-only',service_name:locale==='en'?'Test tracking':'Tracking pengujian',amount_idr:450000,currency:'IDR',scope:['Test scope'],deliverables:['Test output'],requirements:['Legacy agreed input'],exclusions:['Test exclusion'],estimated_duration:'Test duration',revision_rule:{description:'Test revision'},milestones:[{label:'Test work allocation',amount_idr:450000}],cost_disclosure:'Test approved costs',output_language:'id',brief_fields:[{id:'url',label:locale==='en'?'Website URL':'URL website',instruction:locale==='en'?'Share the public URL':'Berikan URL publik',required:true}],scheduling_note:locale==='en'?'Scheduling is manual; payment does not reserve a slot.':'Jadwal dikonfirmasi secara manual; pembayaran tidak memesan slot.'})
try{
  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;`)
  // Apply prior migrations first; create a pre-extension Paid fixture, then verify
  // the new migration never backfills or mutates old QA history.
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')&&f<'20261011000200_payment_notifications.sql').sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'))
  await db.exec(`insert into auth.users(id,email,email_confirmed_at)values('${a}','client@example.invalid',now()),('${b}','other@example.invalid',now()),('${owner}','owner@example.invalid',now());insert into staff_access(user_id,role)values('${owner}','owner');`)
  const policies=['terms','service','refund','privacy'].map(type=>({policy_type:type,version:'test',locale:'en',effective_date:'2026-10-11',content:'Test-only accepted policy',content_sha256:'a'.repeat(64)}))
  async function order(locale='en'){
    const p=policies.map(value=>({...value,locale})), key=await scalar('select gen_random_uuid()')
    return scalar('select commerce_place_order($1,$2,$3,$4,$5,$6,$7,$8)',[a,key,locale,terms(locale),'a'.repeat(64),p,true,null])
  }
  async function settle(id){
    const attempt=(await scalar('select payments_reserve($1,$2,$3,$4)',[a,id,'MOCK-MERCHANT',null])).attempt
    await scalar('select payments_apply($1,$2,$3,$4,$5,$6,$7,$8,$9)',[attempt.provider_reference,'MOCK-MERCHANT',450000,'IDR','mock-'+attempt.id,'settlement','accept',0,event(attempt)])
    return attempt
  }
  const historical=await order();await settle(historical)
  const history=await db.query('select payment_status,work_status,work_started_at from orders where id=$1',[historical])
  await db.exec(fs.readFileSync('supabase/migrations/20261011000200_payment_notifications.sql','utf8'))
  equal(await scalar('select count(*)::int from payment_notifications'),0)
  equal((await db.query('select payment_status,work_status,work_started_at from orders where id=$1',[historical])).rows,history.rows)
  await server.deliverPaymentConfirmation(historical);equal(calls.length,0)

  const id=await order(), attempt=await settle(id)
  equal(await scalar('select count(*)::int from payment_notifications where order_id=$1',[id]),1)
  equal(await scalar('select status from payment_notifications where order_id=$1',[id]),'pending')
  const snapshot=await scalar('select row_to_json(s) from order_snapshots s where order_id=$1',[id])
  const payload=content.paymentConfirmation({id,locale:'en',amount_idr:450000,currency:'IDR'},snapshot)
  equal(payload.from,"Adam's Work <no-reply@adamswork.app>");equal(payload.reply_to,'adamfiik13@gmail.com');equal(payload.to,['client@example.invalid'])
  check(payload.text.includes('Website URL')&&payload.text.includes('Bahasa Indonesia')&&payload.text.includes('Scheduling is manual')&&payload.text.includes('admin approval')&&payload.text.includes('/orders/'+id))
  check(!payload.text.includes('/brief')&&!payload.text.includes('password:'))
  assert.throws(()=>content.paymentConfirmation({id,locale:'en',amount_idr:1,currency:'IDR'},snapshot));checks++
  const legacy=structuredClone(snapshot);delete legacy.selected_package.terms.brief_fields;delete legacy.selected_package.terms.output_language;delete legacy.selected_package.terms.scheduling_note
  check(content.paymentConfirmation({id,locale:'en',amount_idr:450000,currency:'IDR'},legacy).text.includes('Legacy agreed input'))
  check(content.paymentConfirmation({id,locale:'en',amount_idr:450000,currency:'IDR'},legacy).text.includes('Output language: English'))

  server.schedulePaymentConfirmation(id)
  equal(calls.length,0);equal(scheduled.length,1)
  equal(await scalar('select status from payment_notifications where order_id=$1',[id]),'pending')
  await scheduled.shift()()
  equal(await scalar('select status from payment_notifications where order_id=$1',[id]),'sent');equal(calls.length,1)
  equal(calls[0].key,'aw-staging-payment-confirmation/'+id)
  const sentAt=await scalar('select sent_at from payment_notifications where order_id=$1',[id])
  await server.deliverPaymentConfirmation(id);equal(calls.length,1)
  await scalar('select payments_apply($1,$2,$3,$4,$5,$6,$7,$8,$9)',[attempt.provider_reference,'MOCK-MERCHANT',450000,'IDR','mock-'+attempt.id,'settlement','accept',0,event(attempt)])
  await server.deliverPaymentConfirmation(id);equal(calls.length,1);equal(await scalar('select sent_at from payment_notifications where order_id=$1',[id]),sentAt)

  // Failures remain reviewable and never undo authoritative paid/work states.
  const retry=await order('id');await settle(retry);mode='timeout'
  await server.deliverPaymentConfirmation(retry)
  equal(await scalar('select status from payment_notifications where order_id=$1',[retry]),'retryable')
  equal(await scalar('select last_error_code from payment_notifications where order_id=$1',[retry]),'provider_uncertain')
  equal(await scalar('select payment_status from orders where id=$1',[retry]),'paid');equal(await scalar('select work_status from orders where id=$1',[retry]),'draft');equal(await scalar('select work_started_at from orders where id=$1',[retry]),null)
  const failedCall=calls.at(-1)
  check(failedCall.body.text.includes('Pembayaran Sandbox')&&failedCall.body.text.includes('/id/pesanan/'+retry))
  const count=calls.length;await server.deliverPaymentConfirmation(retry);equal(calls.length,count)
  await db.query("update payment_notifications set retry_after=now()-interval '1 minute' where order_id=$1",[retry]);mode='ok'
  await server.deliverPaymentConfirmation(retry)
  equal(calls.at(-1),failedCall);equal(await scalar('select status from payment_notifications where order_id=$1',[retry]),'sent')

  // Lease collisions yield one claim; a lost success receipt retries exactly the
  // frozen payload/key within the provider window, then stops for manual review.
  const leased=await order();await settle(leased)
  const lp=content.paymentConfirmation({id:leased,locale:'en',amount_idr:450000,currency:'IDR'},await scalar('select row_to_json(s) from order_snapshots s where order_id=$1',[leased]))
  const claims=await Promise.all(Array.from({length:8},()=>scalar('select payment_notification_claim($1,$2)',[leased,lp])))
  equal(claims.filter(Boolean).length,1)
  const claim=claims.find(Boolean)
  equal(await scalar('select payment_notification_finish($1,$2,$3,$4)',[leased,b,'wrong-lease',null]),false)
  await db.query("update payment_notifications set lease_expires_at=now()-interval '1 minute' where order_id=$1",[leased])
  const reclaimed=await scalar('select payment_notification_claim($1,$2)',[leased,{...lp,text:'Template changed after first attempt'}])
  equal(reclaimed.payload,lp);equal(reclaimed.idempotency_key,claim.idempotency_key)
  await db.query("update payment_notifications set lease_expires_at=now()-interval '1 minute',first_attempt_at=now()-interval '24 hours' where order_id=$1",[leased])
  equal(await scalar('select payment_notification_claim($1,$2)',[leased,lp]),null)
  equal(await scalar('select status from payment_notifications where order_id=$1',[leased]),'manual_review')
  equal(await scalar('select last_error_code from payment_notifications where order_id=$1',[leased]),'dedup_window_expired')

  const missing=await order();await settle(missing);delete process.env.RESEND_API_KEY
  scheduleFails=true;server.schedulePaymentConfirmation(missing);scheduleFails=false
  equal(await scalar('select status from payment_notifications where order_id=$1',[missing]),'pending')
  await server.deliverPaymentConfirmation(missing)
  equal(await scalar('select last_error_code from payment_notifications where order_id=$1',[missing]),'configuration_unavailable')
  equal(await scalar('select first_attempt_at from payment_notifications where order_id=$1',[missing]),null)
  process.env.RESEND_API_KEY=env.RESEND_API_KEY
  context={client:client(),user:{id:b}}
  const before=calls.length;equal(await server.retryConfirmation(missing),'unavailable');equal(calls.length,before)
  context.user={id:a};equal(await actions.retryConfirmationAction(missing),'sent')
  const own=await order();await settle(own);context.user={id:owner};equal(await actions.retryConfirmationAction(own),'sent')
  const unpaid=await order();equal(await actions.retryConfirmationAction(unpaid),'unavailable')
  context.user=null;equal(await actions.retryConfirmationAction(missing),'unavailable')
  deniedReads=true;context.user={id:a};equal(await server.readConfirmationStatus(id),'unavailable');deniedReads=false
  const isolation=calls.length;process.env.APP_ENV='production';await server.deliverPaymentConfirmation(missing);equal(calls.length,isolation);process.env.APP_ENV='staging'
  for(const modeValue of ['reject','malformed','oversize']){mode=modeValue;equal((await sender.sendConfirmation(payload,'mock-key',env.RESEND_API_KEY)).ok,false)}mode='ok'

  // Real PostgreSQL RLS and column grants, independent from the server mocks.
  await db.exec(`select set_config('request.jwt.claim.sub','${a}',false);set role authenticated;`)
  check(await scalar('select count(*)::int from payment_notifications')>0)
  await rejected(()=>db.query('select payload from payment_notifications'),/permission denied/)
  await rejected(()=>db.query('select lease,provider_id from payment_notifications'),/permission denied/)
  await rejected(()=>db.query("update payment_notifications set status='sent'"),/permission denied/)
  await rejected(()=>scalar('select payment_notification_claim($1,$2)',[id,payload]),/permission denied/)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${b}',false);set role authenticated;`)
  equal(await scalar('select count(*)::int from payment_notifications'),0)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${owner}',false);set role authenticated;`)
  check(await scalar('select count(*)::int from payment_notifications')>0)
  await db.exec('reset role;set role anon');await rejected(()=>db.query('select status from payment_notifications'),/permission denied/);await db.exec('reset role')
  check(!(await scalar('select payload::text from payment_notifications where order_id=$1',[id])).includes(env.RESEND_API_KEY))
  console.log(`Payment confirmation: ${checks} checks passed (local PostgreSQL/mocked Resend; outbox/replay/leases/window, retry authorization, EN/ID immutable content, privacy/RLS, no paid-state regression). Provider delivery and hosted concurrency remain operator QA.`)
}finally{await db.close();globalThis.fetch=oldFetch;for(const[k,v]of Object.entries(saved)){if(v===undefined)delete process.env[k];else process.env[k]=v}}
