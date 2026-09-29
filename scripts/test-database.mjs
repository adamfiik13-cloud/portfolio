import { PGlite } from '@electric-sql/pglite'
import { readFile, readdir } from 'node:fs/promises'
import assert from 'node:assert/strict'

// Real PostgreSQL in memory; only Supabase-owned auth/storage scaffolding is mocked.
// This does not validate hosted GoTrue, PostgREST, Storage API or provider delivery.
const db = new PGlite()
let checks = 0
const run = sql => db.exec(sql)
const scalar = async sql => Object.values((await db.query(sql)).rows[0])[0]
async function denied(sql, label) {
  await assert.rejects(run(sql), undefined, label)
  checks++
}
const a='11111111-1111-4111-8111-111111111111', b='22222222-2222-4222-8222-222222222222', team='33333333-3333-4333-8333-333333333333', admin='44444444-4444-4444-8444-444444444444'
const o1='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',o2='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', file='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const login = async id => { await run(`reset role; select set_config('request.jwt.claim.sub','${id}',false); set role authenticated;`) }
const root = () => run("reset role; select set_config('request.jwt.claim.sub','',false);")
try {
  await run(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;`)
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()) {
    await run((await readFile('supabase/migrations/'+file,'utf8')).replace(/^\uFEFF/,''))
    console.log('Applied '+file)
  }
  assert.equal(await scalar("select count(*)::int from pg_tables where schemaname='public' and rowsecurity"),17);checks++
  assert.equal(await scalar('select count(*)::int from storage.buckets where public=false'),3);checks++
  await run(`insert into auth.users(id,email,raw_user_meta_data) values('${a}','a@example.invalid','{"role":"owner"}'),('${b}','b@example.invalid','{}'),('${team}','team@example.invalid','{}'),('${admin}','admin@example.invalid','{}');
    insert into public.staff_access(user_id,role) values('${team}','team'),('${admin}','owner');
    insert into public.orders(id,client_id,service_id,locale,amount_idr) values('${o1}','${a}','tracking-basic','en',450000),('${o2}','${b}','tracking-basic','en',450000);
    insert into public.team_assignments(order_id,staff_id,assignment_role) values('${o1}','${team}','delivery');
    insert into public.order_messages(order_id,author_id,body,visibility) values('${o1}','${a}','client message','client'),('${o1}','${admin}','private note','internal'),('${o2}','${b}','other order','client');
    insert into public.order_files(id,order_id,uploader_id,category,bucket_id,storage_path,original_filename,size_bytes,mime_type,visibility,status) values('${file}','${o1}','${a}','brief','client-briefs','${o1}/${file}','brief.pdf',100,'application/pdf','client','ready');
    insert into storage.objects(bucket_id,name) values('client-briefs','${o1}/${file}'),('client-briefs','unknown/path');`)
  await login(a)
  assert.equal(await scalar('select count(*)::int from public.orders'),1);checks++
  assert.equal(await scalar('select count(*)::int from public.profiles'),1);checks++
  assert.equal(await scalar('select count(*)::int from public.staff_access'),0);checks++
  assert.equal(await scalar('select count(*)::int from public.order_messages'),1);checks++
  assert.equal(await scalar('select count(*)::int from storage.objects'),1);checks++
  await run("update public.profiles set display_name='Client',locale='id'")
  for(const sql of [
    "update public.profiles set email='intruder@example.invalid'",
    `insert into public.staff_access(user_id,role) values('${a}','owner')`,
    "update public.orders set payment_status='paid'", "update public.orders set refund_status='refunded'",
    `insert into public.team_assignments(order_id,staff_id,assignment_role) values('${o2}','${team}','delivery')`,
    "update public.briefs set status='approved'", "delete from public.order_snapshots", "delete from public.audit_events",
    "select * from public.system_health",
    `insert into storage.objects(bucket_id,name) values('client-briefs','${o1}/new')`
  ]) await denied(sql,'client must not mutate privileged data')
  await login(b);assert.equal(await scalar('select count(*)::int from storage.objects'),0);checks++
  await login(team);assert.equal(await scalar('select count(*)::int from public.orders'),1);checks++
  assert.equal(await scalar('select count(*)::int from public.order_messages'),2);checks++
  await root();await run(`update public.team_assignments set status='revoked' where staff_id='${team}'`)
  await login(team);assert.equal(await scalar('select count(*)::int from public.orders'),0);checks++
  await login(admin);assert.equal(await scalar('select count(*)::int from public.orders'),2);checks++
  await denied("update public.orders set payment_status='paid'",'admin browser must not bypass server')
  await root();await run('set role anon')
  await denied('select * from public.orders','anonymous business access denied')
  assert.equal(await scalar('select count(*)::int from storage.objects'),0);checks++
  await root();await run('set role service_role')
  await denied(`insert into public.payment_records(order_id,provider,amount_idr) values('${o1}','test',450000)`,'acceptance before payment')
  await denied(`update public.orders set work_status='in_progress' where id='${o1}'`,'cannot start before prerequisites')
  await root()
  const policies=[]
  for(const type of ['terms','service','refund','privacy']){
    const {rows}=await db.query("insert into public.policy_versions(policy_type,version,locale,effective_date,content,content_sha256,published_at) values($1,'1.0','en','2026-09-28','Test-only policy',$2,now()) returning id",[type,'a'.repeat(64)])
    policies.push({type,id:rows[0].id})
  }
  await db.query(`insert into public.order_snapshots(order_id,service_name,agreed_amount_idr,scope,deliverables,requirements,exclusions,revision_rule,estimated_duration,cancellation_refund_terms,policy_version_ids,content_sha256) values($1,'Tracking Basic',450000,'[]','[]','[]','[]','{}','3-5 business days','{}',$2,$3)`,[o1,policies.map(p=>p.id),'b'.repeat(64)])
  await run('set role service_role')
  await denied("update public.order_snapshots set service_name='Changed'",'snapshot immutable even with service role')
  await denied("delete from public.policy_versions",'version immutable')
  await denied("truncate public.audit_events",'service role cannot truncate audit evidence')
  await root()
  for(const policy of policies) await db.query("insert into public.policy_acceptances(order_id,user_id,policy_version_id,policy_type,version,locale,effective_date) values($1,$2,$3,$4,'1.0','en','2026-09-28')",[o1,a,policy.id,policy.type])
  await denied('delete from public.policy_acceptances','acceptance immutable')
  await run(`insert into public.payment_records(order_id,provider,provider_reference,amount_idr,status,verified_at) values('${o1}','test','test-only-reference',450000,'verified',now()); update public.orders set payment_status='paid' where id='${o1}';`)
  await denied(`update public.orders set work_status='in_progress' where id='${o1}'`,'payment alone insufficient')
  await denied(`insert into public.briefs(order_id,status,submitted_at,approved_at,approved_by) values('${o1}','approved',now(),now(),'${team}')`,'team cannot approve mandatory brief')
  await run(`insert into public.briefs(order_id,status,submitted_at,approved_at,approved_by) values('${o1}','approved',now(),now(),'${admin}'); update public.orders set work_status='in_progress' where id='${o1}';`)
  assert.equal(await scalar(`select work_started_at is not null from public.orders where id='${o1}'`),true);checks++
  assert.equal(await scalar(`select count(*)::int from public.order_status_history where order_id='${o1}'`),2);checks++
  await denied(`insert into public.refunds(order_id,payment_id,requested_by,requested_amount_idr,reason) select '${o1}',id,'${a}',450001,'test' from public.payment_records where order_id='${o1}'`,'refund bounded by payment')
  await denied(`update public.orders set amount_idr=1 where id='${o1}'`,'historical commercial terms locked')
  await run(`insert into public.payment_webhook_events(provider,provider_event_id,event_type) values('test','unique','verified')`)
  await denied(`insert into public.payment_webhook_events(provider,provider_event_id,event_type) values('test','unique','verified')`,'webhook idempotency')
  await run(`insert into public.custom_offers(client_id,title,scope,amount_idr,estimated_duration,revision_rule,expires_at,status,accepted_at,order_id,created_by) values('${a}','Test','[]',450000,'test','{}',now()+interval '1 day','accepted',now(),'${o1}','${admin}')`)
  await denied("update public.custom_offers set title='Changed'",'accepted offer immutable')
  await root();await run(`update public.order_files set status='quarantined' where id='${file}'`)
  await login(a);assert.equal(await scalar('select count(*)::int from storage.objects'),0);checks++
  await root();await run('set role service_role')
  assert.equal(await scalar('select healthy from public.system_health where id=1'),true);checks++
  await denied('update public.system_health set healthy=false','heartbeat role is read-only for health')
  console.log(`PASS: ${checks} migration, RLS, integrity and storage checks (local PostgreSQL).`)
} catch (error) { console.error(error.message); process.exitCode=1 } finally { await db.close() }
