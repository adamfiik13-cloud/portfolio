import { PGlite } from '@electric-sql/pglite'
import assert from 'node:assert/strict'
import { readFile,readdir } from 'node:fs/promises'
const db=new PGlite()
try {
  await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,deleted_at timestamptz,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
    alter table storage.objects enable row level security;`)
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+file,'utf8'))
  const bootstrap=await readFile('scripts/bootstrap-staging-owner.sql','utf8')
  await assert.rejects(db.exec(bootstrap),/Exactly one existing verified owner account/)
  const owner='11111111-1111-4111-8111-111111111111',client='22222222-2222-4222-8222-222222222222'
  await db.exec(`insert into auth.users(id,email,email_confirmed_at)values('${owner}','adamfiik13@gmail.com',now()),('${client}','client@example.invalid',now());`)
  // Reproduce the failure without deleting any hosted user or weakening constraints.
  await assert.rejects(db.exec(`delete from auth.users where id='${client}'`),error=>['23503','23001'].includes(error.code)&&error.message.includes('profiles_id_fkey'))
  await db.exec(bootstrap);await db.exec(bootstrap)
  assert.equal((await db.query('select count(*)::int as n from public.staff_access')).rows[0].n,1)
  assert.equal((await db.query('select role,active from public.staff_access')).rows[0].role,'owner')
  assert.equal((await db.query('select count(*)::int as n from public.audit_events')).rows[0].n,1)
  await assert.rejects(db.exec(`delete from public.profiles where id='${owner}'`),error=>['23503','23001'].includes(error.code)&&error.message.includes('staff_access_user_id_fkey'))
  console.log('PASS: owner bootstrap is idempotent/verified-user only; Auth deletion blocked by profiles_id_fkey; owner profile deletion blocked by staff_access_user_id_fkey (disposable local PostgreSQL only).')
} catch(error){console.error(error.message);process.exitCode=1} finally {await db.close()}
