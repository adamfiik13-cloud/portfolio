import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Disposable PostgreSQL and mocked session/server dependencies only. No hosted
// SQL, Storage upload, provider request, real email or payment is performed.
const native=createRequire(import.meta.url),cache=new Map(),db=new PGlite()
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',owner='33333333-3333-4333-8333-333333333333',team='44444444-4444-4444-8444-444444444444',unverified='55555555-5555-4555-8555-555555555555',admin='66666666-6666-4666-8666-666666666666'
let checks=0,context={client:null,user:null,configured:true},rpcCalls=[],queryFailure=false
const check=value=>{assert(value);checks++},equal=(actual,expected)=>{assert.deepEqual(actual,expected);checks++},denied=async(fn,pattern)=>{await assert.rejects(fn,pattern);checks++}
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0],uuid=()=>scalar('select gen_random_uuid()')
const env={APP_ENV:'staging',SUPABASE_STAGING_PROJECT_REF:'stage',SUPABASE_PRODUCTION_PROJECT_REF:'prod',SUPABASE_PROJECT_REF:'stage',SUPABASE_SERVICE_ROLE_KEY:'mock-only',NEXT_PUBLIC_SUPABASE_URL:'https://stage.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'mock-only'}
const saved=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]]));Object.assign(process.env,env)
function client(privileged=false){return {from:table=>{
  assert(['orders','order_snapshots','briefs','brief_revisions','staff_access','profiles','order_files','payment_records'].includes(table))
  let fields='',filters=[],inFilters=[],sorting='',maximum='',resultSingle=false
  const execute=async()=>{
    if(queryFailure)return {data:null,error:{message:'withheld'}}
    assert(/^[a-z_,]+$/.test(fields));assert(filters.every(([field])=>/^[a-z_]+$/.test(field)))
    const args=filters.map(([,v])=>v),clauses=filters.map(([field],i)=>field+'=$'+(i+1))
    for(const [field,values] of inFilters){assert(/^[a-z_]+$/.test(field));args.push(values);clauses.push(field+'=any($'+args.length+'::text[])')}
    // The session mock models the existing RLS filter; real grants/RLS are
    // independently exercised below using authenticated PostgreSQL roles.
    if(!privileged){
      const staff=context.user&&await scalar('select exists(select 1 from staff_access where user_id=$1 and active and role=\'owner\')',[context.user.id])
      if(!staff){
        args.push(context.user?.id??null)
        if(table==='orders')clauses.push('client_id=$'+args.length)
        else if(['order_snapshots','briefs','brief_revisions','order_files','payment_records'].includes(table))clauses.push('exists(select 1 from orders where orders.id='+table+'.order_id and orders.client_id=$'+args.length+')')
        else clauses.push((table==='staff_access'?'user_id':'id')+'=$'+args.length)
      }
    }
    const rows=(await db.query(`select ${fields} from ${table}${clauses.length?' where '+clauses.join(' and '):''}${sorting}${maximum}`,args)).rows
    return {data:resultSingle?rows[0]??null:rows,error:null}
  }
  const q={select:value=>{fields=value;return q},eq:(field,value)=>{filters.push([field,value]);return q},in:(field,values)=>{inFilters.push([field,values]);return q},order:(field,options={})=>{assert(/^[a-z_]+$/.test(field));sorting=' order by '+field+(options.ascending===false?' desc':' asc');return q},limit:value=>{assert(Number.isInteger(value));maximum=' limit '+value;return q},maybeSingle:()=>{resultSingle=true;return execute()},single:()=>{resultSingle=true;return execute()},then:(resolve,reject)=>execute().then(resolve,reject)}
  return q
},rpc:async(name,args)=>{
  assert(['workspace_save_brief','workspace_review_brief','workspace_start_work'].includes(name));rpcCalls.push({name,args})
  try{const value=await scalar(`select public.${name}(${Object.values(args).map((_,i)=>'$'+(i+1)).join(',')})`,Object.values(args));return {data:value instanceof Date?value.toISOString():value,error:null}}
  catch(error){return {data:null,error:{message:error.message==='Stale brief'?'Stale brief':'withheld'}}}
}}}
function load(file){
  let full=path.resolve(file);if(!path.extname(full))full+=fs.existsSync(full+'.ts')?'.ts':'.tsx'
  if(cache.has(full))return cache.get(full).exports
  const mod={exports:{}};cache.set(full,mod)
  const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const require=id=>id==='server-only'?{}:id==='@supabase/supabase-js'?{createClient:()=>client(true)}:id==='@/lib/commerce/server'?{
    commerceContext:async()=>process.env.APP_ENV==='staging'?context:{...context,client:null,user:null},
    ownerContext:async()=>process.env.APP_ENV==='staging'&&context.user&&await scalar("select exists(select 1 from staff_access where user_id=$1 and active and role='owner')",[context.user.id])?context:null,
  }:id==='@/lib/auth/context'?{authContext:async()=>context}:id==='@/lib/supabase/config'?{getSupabaseConfig:()=>({url:process.env.NEXT_PUBLIC_SUPABASE_URL,key:'mock-only'})}:id==='next/cache'?{revalidatePath:()=>{}}:id==='next/navigation'?{redirect:url=>{throw new Error('NEXT_REDIRECT:'+url)}}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(full),id)):native(id)
  new Function('require','module','exports',code)(require,mod,mod.exports);return mod.exports
}
const rules=load('lib/workspace/rules.ts'),server=load('lib/workspace/server.ts'),actions=load('lib/workspace/actions.ts')
const terms=locale=>({service_id:'tracking-basic',package_id:'test-only',service_name:locale==='en'?'Test accepted package':'Paket pengujian',amount_idr:450000,currency:'IDR',scope:['Test scope'],deliverables:['Test output'],requirements:[locale==='en'?'Original agreed URL':'URL asli yang disepakati'],exclusions:['Test exclusion'],estimated_duration:'Test estimate range',revision_rule:{description:'Test revision'},milestones:[{label:'Test work allocation',amount_idr:450000}],cost_disclosure:'Test agreed costs',output_language:locale==='en'?'id':'en',brief_fields:[{id:'website_url',label:locale==='en'?'Website URL':'URL website',instruction:locale==='en'?'Provide public website URL':'Berikan URL website publik',required:true},{id:'optional_context',label:locale==='en'?'Optional context':'Konteks opsional',instruction:locale==='en'?'If relevant':'Jika relevan',required:false}]})
const complete={website_url:'https://example.invalid',optional_context:'Test-only context'},draft={website_url:''}
const save=(actor,id,revision,responses,submit)=>scalar('select workspace_save_brief($1,$2,$3,$4,$5)',[actor,id,revision,responses,submit])
const review=(actor,id,revision,decision,note='')=>scalar('select workspace_review_brief($1,$2,$3,$4,$5)',[actor,id,revision,decision,note])
const start=(actor,id,revision)=>scalar('select workspace_start_work($1,$2,$3)',[actor,id,revision])
try{
  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create schema storage;
    alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;`)
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'))
  await db.exec(`insert into auth.users(id,email,email_confirmed_at)values('${a}','a@example.invalid',now()),('${b}','b@example.invalid',now()),('${owner}','owner@example.invalid',now()),('${team}','team@example.invalid',now()),('${unverified}','unverified@example.invalid',null),('${admin}','admin@example.invalid',now());insert into staff_access(user_id,role)values('${owner}','owner'),('${team}','team'),('${unverified}','owner'),('${admin}','admin');`)
  async function order(locale='en',legacy=false){
    const selected=terms(locale);if(legacy){delete selected.brief_fields;delete selected.output_language}
    const policies=['terms','service','refund','privacy'].map(type=>({policy_type:type,version:'test',locale,effective_date:'2026-10-12',content:'Test accepted policy '+locale,content_sha256:createHash('sha256').update('Test accepted policy '+locale).digest('hex')}))
    return scalar('select commerce_place_order($1,$2,$3,$4,$5,$6,$7,$8)',[a,await uuid(),locale,selected,'a'.repeat(64),policies,true,null])
  }
  async function paid(id){await db.query("insert into payment_records(order_id,provider,provider_reference,amount_idr,status,verified_at) values($1,'test-only',$2,450000,'verified',now())",[id,'test-'+id]);await db.query("update orders set payment_status='paid' where id=$1",[id])}
  const fields=rules.briefFields(terms('en'))
  equal(fields.map(f=>f.id),['website_url','optional_context']);check(fields[0].required&&!fields[1].required)
  check(rules.validResponses(fields,complete,true));check(rules.validResponses(fields,draft,false));check(!rules.validResponses(fields,draft,true))
  for(const invalid of [null,[],{website_url:null},{website_url:123},{website_url:[]},{website_url:'x'.repeat(6001)},{website_url:'valid',unknown:'unapproved'},JSON.parse('{"website_url":"valid","__proto__":"unapproved"}'),{website_url:'   '}])check(!rules.validResponses(fields,invalid,true))
  const oldFields=rules.briefFields({requirements:['Original first requirement','Original second requirement']})
  equal(oldFields.map(f=>f.id),['requirement_1','requirement_2']);check(oldFields.every(f=>f.required))
  const id=await order(),unpaid=await order(),snapshot=await scalar('select selected_package::text from order_snapshots where order_id=$1',[id]),acceptances=await scalar('select count(*)::int from policy_acceptances where order_id=$1',[id])
  await denied(()=>save(a,unpaid,0,complete,false));await denied(()=>start(owner,unpaid,0));await paid(id)
  const competing=await order();await paid(competing)
  const races=await Promise.allSettled(Array.from({length:8},(_,i)=>save(a,competing,0,{...complete,optional_context:'Request '+i},false)))
  equal(races.filter(result=>result.status==='fulfilled').length,1)
  equal(races.filter(result=>result.status==='rejected').length,7)
  equal(await scalar('select revision from briefs where order_id=$1',[competing]),1)
  equal(await scalar('select count(*)::int from brief_revisions where order_id=$1',[competing]),1)
  await denied(()=>save(b,id,0,complete,false));await denied(()=>save(owner,id,0,complete,false));await denied(()=>save(unverified,id,0,complete,false))
  for(const invalid of [null,[],{website_url:0},{website_url:'ok',unknown:'bad'},{website_url:'x'.repeat(6001)}])await denied(()=>save(a,id,0,invalid,false))
  await denied(()=>save(a,id,0,draft,true));await denied(()=>save(a,id,-1,complete,false))
  equal(await save(a,id,0,draft,false),{revision:1,status:'incomplete'})
  await denied(()=>save(a,id,0,complete,true))
  equal(await save(a,id,1,complete,true),{revision:2,status:'submitted'})
  await denied(()=>save(a,id,2,complete,false));await denied(()=>review(team,id,2,'approve'));await denied(()=>review(a,id,2,'approve'))
  await denied(()=>review(admin,id,2,'approve'));await denied(()=>review(unverified,id,2,'approve'))
  await db.query('update staff_access set active=false where user_id=$1',[owner]);await denied(()=>review(owner,id,2,'approve'));await db.query('update staff_access set active=true where user_id=$1',[owner])
  await denied(()=>review(owner,id,2,'changes_requested',''));await denied(()=>review(owner,id,2,'changes_requested','   '));await denied(()=>review(owner,id,2,'changes_requested','x'.repeat(5001)));await denied(()=>review(owner,id,2,'unexpected','note'))
  equal(await review(owner,id,2,'changes_requested','Please clarify the agreed inputs.'),{revision:3,status:'changes_requested'})
  equal(await scalar('select review_note from briefs where order_id=$1',[id]),'Please clarify the agreed inputs.')
  await denied(()=>review(owner,id,2,'approve'))
  equal(await save(a,id,3,{...complete,optional_context:'Clarified test-only context'},true),{revision:4,status:'submitted'})
  await denied(()=>start(owner,id,4))
  equal(await review(owner,id,4,'approve'),{revision:5,status:'approved'})
  equal(await scalar('select count(*)::int from brief_revisions where order_id=$1',[id]),5)
  equal((await db.query('select event from brief_revisions where order_id=$1 order by revision',[id])).rows.map(row=>row.event),['draft_saved','submitted','changes_requested','submitted','approved'])
  await denied(()=>save(a,id,5,complete,false));await denied(()=>start(a,id,5));await denied(()=>start(team,id,5));await denied(()=>start(owner,id,4))
  await db.query("update payment_records set status='pending' where order_id=$1",[id]);await denied(()=>start(owner,id,5));await db.query("update payment_records set status='verified' where order_id=$1",[id])
  const file=await uuid()
  await db.query("insert into order_files(id,order_id,uploader_id,category,bucket_id,storage_path,original_filename,size_bytes,mime_type,visibility,status) values($1,$2,$3,'brief','client-briefs',$4,'test.pdf',10,'application/pdf','client','pending')",[file,id,a,id+'/'+file])
  await denied(()=>start(owner,id,5));await db.query("update order_files set status='quarantined' where id=$1",[file])
  const timestamp=await start(owner,id,5);check(timestamp!==null);equal(await start(owner,id,5),timestamp)
  equal(await scalar('select work_status from orders where id=$1',[id]),'in_progress')
  equal(await scalar('select work_started_at from orders where id=$1',[id]),timestamp)
  equal(await scalar('select selected_package::text from order_snapshots where order_id=$1',[id]),snapshot)
  equal(await scalar('select count(*)::int from policy_acceptances where order_id=$1',[id]),acceptances)
  equal(await scalar('select count(*)::int from payment_records where order_id=$1',[id]),1)
  equal(await scalar('select count(*)::int from payment_notifications where order_id=$1',[id]),0)
  await denied(()=>db.query("update brief_revisions set note='overwrite' where order_id=$1",[id]),/Immutable/)
  await denied(()=>db.query('delete from brief_revisions where order_id=$1',[id]),/Immutable/)
  equal(await scalar("select count(*)::int from audit_events where entity_id=$1 and action='work_started'",[id]),1)
  equal(await scalar("select actor_id from order_status_history where order_id=$1 and dimension='work' and new_status='in_progress'",[id]),owner)

  for(const locale of ['en','id']){
    const legacy=await order(locale,true),retained=await scalar('select selected_package::text from order_snapshots where order_id=$1',[legacy]);await paid(legacy)
    equal(await save(a,legacy,0,{requirement_1:'Complete original agreed input'},true),{revision:1,status:'submitted'})
    equal(await review(owner,legacy,1,'approve'),{revision:2,status:'approved'})
    equal(await scalar('select selected_package::text from order_snapshots where order_id=$1',[legacy]),retained)
    equal(await scalar('select locale from orders where id=$1',[legacy]),locale)
    equal(await scalar('select work_started_at from orders where id=$1',[legacy]),null)
  }

  // Actual session identity is bound server-side; no browser actor/role reaches RPC.
  const serverOrder=await order();await paid(serverOrder)
  equal(await server.workspaceContext('not-a-uuid'),null)
  context={client:client(),user:{id:b},configured:true};await denied(()=>server.saveBrief(serverOrder,0,complete,false))
  context.user={id:a};equal(await server.saveBrief(serverOrder,0,complete,false),{revision:1,status:'incomplete'});equal(rpcCalls.at(-1).args.p_actor,a)
  equal(await server.saveBrief(serverOrder,1,complete,true),{revision:2,status:'submitted'})
  context.user={id:team};await denied(()=>server.reviewBrief(serverOrder,2,'approve',''));await denied(()=>server.startWork(serverOrder,2))
  context.user={id:owner};equal(await server.reviewBrief(serverOrder,2,'approve',''),{revision:3,status:'approved'});equal(rpcCalls.at(-1).args.p_actor,owner)
  const startTimestamp=await server.startWork(serverOrder,3);equal(await server.startWork(serverOrder,3),startTimestamp)
  context.user=null;await denied(()=>server.saveBrief(serverOrder,3,complete,false))
  context.user={id:a};queryFailure=true;await denied(()=>server.saveBrief(serverOrder,3,complete,false));queryFailure=false
  process.env.APP_ENV='production';await denied(()=>server.saveBrief(serverOrder,3,complete,false));process.env.APP_ENV='staging'

  check(typeof actions.briefAction==='function'&&typeof actions.reviewBriefAction==='function'&&typeof actions.startWorkAction==='function')
  const actionOrder=await order();await paid(actionOrder);context.user={id:a}
  const form=(revision,operation='submit')=>{const f=new FormData();f.set('revision',String(revision));f.set('operation',operation);f.set('answer:website_url',complete.website_url);return f}
  const malicious=form(0);malicious.set('actor_id',owner);malicious.set('role','owner');malicious.set('payment_status','paid');malicious.set('approved','on')
  equal(await actions.briefAction('id',actionOrder,{},malicious),{message:'submitted',revision:1});equal(rpcCalls.at(-1).args.p_actor,a)
  equal(await actions.briefAction('en',actionOrder,{},form(0)),{message:'stale'})
  const duplicates=form(1);duplicates.append('answer:website_url','second value');equal(await actions.briefAction('en',actionOrder,{},duplicates),{message:'invalid'})
  const foreign=form(1);foreign.set('answer:unauthorized','value');equal(await actions.briefAction('en',actionOrder,{},foreign),{message:'invalid'})
  const blob=form(1);blob.set('answer:website_url',new Blob(['fake']), 'fake.txt');equal(await actions.briefAction('en',actionOrder,{},blob),{message:'invalid'})
  equal(await actions.briefAction('en',actionOrder,{},form(1,'approve')),{message:'invalid'})
  const rf=(revision,decision,note='')=>{const f=new FormData();f.set('revision',String(revision));f.set('decision',decision);f.set('note',note);return f}
  context.user={id:b};equal(await actions.reviewBriefAction('en',actionOrder,{},rf(1,'approve')),{message:'unavailable'})
  context.user={id:owner};equal(await actions.reviewBriefAction('en',actionOrder,{},rf(1,'changes_requested')),{message:'invalid'})
  equal(await actions.reviewBriefAction('id',actionOrder,{},rf(1,'changes_requested','Please clarify.')),{message:'changes_requested',revision:2})
  context.user={id:a};equal(await actions.briefAction('en',actionOrder,{},form(1)),{message:'stale'})
  equal(await actions.briefAction('en',actionOrder,{},form(2)),{message:'submitted',revision:3})
  context.user={id:owner};equal(await actions.startWorkAction('id',actionOrder,{},rf(3,'approve')),{message:'unavailable'})
  equal(await actions.reviewBriefAction('en',actionOrder,{},rf(3,'approve')),{message:'approved',revision:4})
  equal(await actions.startWorkAction('en',actionOrder,{},rf(4,'approve')),{message:'started'})
  const actionStarted=await scalar('select work_started_at from orders where id=$1',[actionOrder])
  equal(await actions.startWorkAction('id',actionOrder,{},rf(4,'approve')),{message:'started'});equal(await scalar('select work_started_at from orders where id=$1',[actionOrder]),actionStarted)
  await db.exec(`select set_config('request.jwt.claim.sub','${a}',false);set role authenticated;`)
  check(await scalar('select count(*)::int from brief_revisions')>0)
  await denied(()=>save(a,id,5,complete,false),/permission denied/)
  await denied(()=>db.query("update briefs set status='approved'"),/permission denied/)
  await denied(()=>db.query('delete from brief_revisions'),/permission denied/)
  await denied(()=>db.query('truncate brief_revisions'),/permission denied/)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${b}',false);set role authenticated;`);equal(await scalar('select count(*)::int from brief_revisions'),0)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${owner}',false);set role authenticated;`);check(await scalar('select count(*)::int from brief_revisions')>0)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${team}',false);set role authenticated;`);equal(await scalar('select count(*)::int from brief_revisions'),0)
  await db.exec('reset role;set role anon');await denied(()=>db.query('select * from brief_revisions'),/permission denied/);await db.exec('reset role')
  await db.exec('set role service_role');await denied(()=>db.query('truncate brief_revisions'),/permission denied/);await db.exec('reset role')
  console.log(`Workspace: ${checks} checks passed (local PostgreSQL/mocked sessions; mandatory fields, ownership, stale revisions, review/resubmission, immutable history/snapshots, verified-payment work start and stable retries). Competing calls use PGlite's single connection; hosted Storage/concurrency remain operator QA.`)
}finally{await db.close();for(const[k,v]of Object.entries(saved)){if(v===undefined)delete process.env[k];else process.env[k]=v}}
