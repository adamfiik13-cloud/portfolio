import assert from 'node:assert/strict'
import { randomUUID, createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Reproduce the unapplied baseline and test the correction in disposable PostgreSQL.
// No provider credentials, remote SQL, or hosted migration-history writes.
const baseline='13604386cfd8c8c37da6b0b3ab481326a0ea6615'
const file='supabase/migrations/20261005000100_commerce.sql'
const original=execFileSync('git',['-c','safe.directory='+process.cwd().replaceAll('\\','/'),'show',baseline+':'+file],{encoding:'utf8'})
const compiledModule={exports:{}}
new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/commerce/rules.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(compiledModule,compiledModule.exports)
const {validTerms,validOfferTerms}=compiledModule.exports
const originalModule={exports:{}}
new Function('module','exports',ts.transpileModule(execFileSync('git',['-c','safe.directory='+process.cwd().replaceAll('\\','/'),'show',baseline+':lib/commerce/rules.ts'],{encoding:'utf8'}),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(originalModule,originalModule.exports)
const client='11111111-1111-4111-8111-111111111111',owner='22222222-2222-4222-8222-222222222222'
const terms={service_id:'tracking-basic',package_id:'test-only',service_name:'Test-only terms',amount_idr:100000,currency:'IDR',scope:['Test scope'],deliverables:['Test output'],exclusions:['Test exclusion'],requirements:['Test input'],estimated_duration:'Test estimate',revision_rule:{description:'Test revision'},milestones:[{label:'Test allocation',amount_idr:100000}],cost_disclosure:'Test fixture, not public commercial data'}
const variants={en:terms,id:{...terms,service_name:'Ketentuan khusus uji'}}
const policies=['terms','service','refund','privacy'].map(type=>({policy_type:type,version:'test-1',locale:'en',effective_date:'2026-10-04',content:'Test-only '+type,content_sha256:createHash('sha256').update('Test-only '+type).digest('hex')}))
const fingerprint='a'.repeat(64),clone=value=>structuredClone(value),jsonNull=Symbol('JSON null')
const jsonParam=value=>value===jsonNull?'null':value===null?null:JSON.stringify(value)
const cases=[]
function add(name,override,appValue){cases.push({name,override,...(arguments.length===3?{appValue}:{})})}
for(const [field,wrong]of Object.entries({service_id:42,package_id:42,service_name:42,amount_idr:'100000',currency:42,scope:{},deliverables:{},exclusions:{},requirements:{},estimated_duration:42,revision_rule:[],milestones:{},cost_disclosure:42})) {
  for(const [label,value]of [['missing',undefined],['null',null],['wrong-type',wrong]]) {
    const changed=clone(terms);if(value===undefined)delete changed[field];else changed[field]=value
    add(field+' '+label,{p_terms:changed},changed)
  }
}
for(const field of ['scope','deliverables','exclusions','requirements'])for(const [label,value]of [['empty',[]],['null-item',[null]],['numeric-item',[1]],['blank-item',['  ']],['whitespace-item',['\t\n']]]) {
  const changed={...clone(terms),[field]:value};add(field+' '+label,{p_terms:changed},changed)
}
for(const [name,value]of [['null',null],['array',[]],['string','bad'],['boolean',false]])add('terms root '+name,{p_terms:value},value)
add('terms root JSON null',{p_terms:jsonNull},null)
for(const [name,value]of [['missing-amount',[{label:'Test'}]],['null-amount',[{label:'Test',amount_idr:null}]],['partial-amount',[{label:'Test',amount_idr:100000},{label:'Unallocated'}]],['null-item',[null]],['missing-label',[{amount_idr:100000}]],['blank-label',[{label:' ',amount_idr:100000}]],['string-amount',[{label:'Test',amount_idr:'100000'}]],['negative-amount',[{label:'Test',amount_idr:-1},{label:'Test 2',amount_idr:100001}]],['fractional-amount',[{label:'Test',amount_idr:99999.5},{label:'Test 2',amount_idr:0.5}]],['empty',[]],['wrong-total',[{label:'Test',amount_idr:1}]]]) {
  const changed={...clone(terms),milestones:value};add('milestones '+name,{p_terms:changed},changed)
}
for(const value of [null,'bad','', 'A'.repeat(64)])add('hash '+String(value).slice(0,8),{p_hash:value})
for(const value of [null,'fr','', 'EN'])add('locale '+value,{p_locale:value})
add('agreement null',{p_agreed:null});add('agreement false',{p_agreed:false});add('key null',{p_key:null})
for(const [name,value]of [['null',null],['object',{}],['string','bad'],['empty',[]],['three',policies.slice(0,3)],['null-item',[null,...policies.slice(1)]]])add('policies '+name,{p_policies:value})
add('policies JSON null',{p_policies:jsonNull})
for(const [field,wrong]of Object.entries({policy_type:1,version:1,locale:1,effective_date:1,content:{bad:true},content_sha256:1})) {
  for(const [label,value]of [['missing',undefined],['null',null],['wrong-type',wrong]]) {
    const changed=clone(policies);if(value===undefined)delete changed[0][field];else changed[0][field]=value
    add('policy '+field+' '+label,{p_policies:changed})
  }
}
for(const [name,change]of [['unknown-type',{policy_type:'unknown'}],['locale-mismatch',{locale:'id'}],['invalid-date',{effective_date:'2026-02-30'}],['invalid-hash',{content_sha256:'bad'}],['blank-content',{content:' '}],['blank-version',{version:' '}]]) {
  const changed=clone(policies);Object.assign(changed[0],change);add('policy '+name,{p_policies:changed})
}
add('policy duplicate-type',{p_policies:[policies[0],policies[0],...policies.slice(2)]})

async function setup(sql) {
  const db=new PGlite()
  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
    create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
    alter table storage.objects enable row level security;`)
  for(const prior of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')&&f<'20261005000100').sort())await db.exec(fs.readFileSync('supabase/migrations/'+prior,'utf8'))
  await db.exec(sql)
  await db.exec(`insert into auth.users(id,email,email_confirmed_at)values('${client}','client@example.invalid',now()),('${owner}','owner@example.invalid',now());insert into staff_access(user_id,role)values('${owner}','owner');set role service_role;`)
  return db
}
async function invoke(db,override={}) {
  const input={p_client:client,p_key:randomUUID(),p_locale:'en',p_terms:terms,p_hash:fingerprint,p_policies:policies,p_agreed:true,p_offer:null,...override}
  return db.query('select public.commerce_place_order($1,$2,$3,$4,$5,$6,$7,$8) as id',Object.values(input).map((value,index)=>index===3||index===5?jsonParam(value):value))
}
async function create(db,override={}) {
  const input={p_actor:owner,p_id:randomUUID(),p_client:client,p_terms:variants,p_hash:fingerprint,p_expires:'2099-01-01T00:00:00Z',...override}
  return db.query('select public.commerce_create_offer($1,$2,$3,$4,$5,$6) as id',Object.values(input).map((value,index)=>index===3?jsonParam(value):value))
}
async function outcome(run) {
  try {return {category:'accepted',id:(await run()).rows[0].id}}
  catch(error){return {category:error.code==='P0001'?'RPC':error.code?.startsWith('23')?'constraint':error.code?.startsWith('22')?'type/cast':error.code,code:error.code,message:error.message}}
}
const old=await setup(original),results=new Map(),appResults=new Map()
try {
  for(const item of cases) {
    if('appValue'in item){try{appResults.set(item.name,originalModule.exports.validTerms(item.appValue)?'accepted':'rejected')}catch{appResults.set(item.name,'throws (still blocked)')}}
    results.set(item.name,await outcome(()=>invoke(old,item.override)))
  }
  for(const name of ['currency missing','currency null','package_id missing','scope null-item','milestones missing-amount','milestones partial-amount','policy locale missing'])assert.equal(results.get(name).category,'accepted',name+' baseline regression reproduced')
  assert.equal(results.get('deliverables missing').category,'constraint');assert.equal(results.get('scope wrong-type').category,'type/cast');assert.equal(results.get('agreement false').category,'RPC')
  const key=randomUUID();await invoke(old,{p_key:key});assert.equal((await outcome(()=>invoke(old,{p_key:key,p_hash:null}))).category,'accepted')
  const counts=Object.fromEntries(['accepted','RPC','constraint','type/cast'].map(category=>[category,[...results.values()].filter(r=>r.category===category).length]))
  console.log('Baseline direct RPC cases: '+JSON.stringify(counts))
  for(const name of ['currency missing','milestones partial-amount','milestones null-item','deliverables missing','scope wrong-type','policy locale missing','agreement false'])console.log(`${name}: application=${appResults.get(name)??'server-generated policy / separate action check'}; database=${results.get(name).category}`)
  console.log('Baseline idempotent retry with NULL hash: accepted (RPC comparison bypass).')
  const offerId=randomUUID(),incompleteId=clone(variants);delete incompleteId.id.deliverables
  const nullHashOffer=await outcome(()=>create(old,{p_hash:null})),incompleteOffer=await outcome(()=>create(old,{p_terms:incompleteId}))
  assert.equal(nullHashOffer.category,'accepted');assert.equal(incompleteOffer.category,'accepted')
  await create(old,{p_id:offerId});assert.equal((await outcome(()=>create(old,{p_id:offerId,p_hash:null,p_expires:null}))).category,'accepted')
  assert.equal((await outcome(()=>create(old,{p_expires:null}))).category,'constraint')
  console.log('Baseline offers: NULL hash and incomplete ID terms accepted; NULL expiry rejected only by NOT NULL. Offer retry with NULL hash/expiry accepted.')
} finally {await old.close()}
if(!process.argv.includes('--baseline-only')) {
  const db=await setup(fs.readFileSync(file,'utf8'));let checked=0
  try {
    await db.exec('reset role')
    const operatorSql=fs.readFileSync('docs/backend/PHASE_4.md','utf8').match(/```sql\s*([\s\S]*?)```/)[1]
    const verification=(await db.query(operatorSql)).rows[0]
    for(const value of Object.values(verification)){assert.equal(value,true,'operator post-application verification');checked++}
    await db.exec('set role service_role')
    const counts=async()=>db.query('select (select count(*) from orders)::int orders,(select count(*) from order_snapshots)::int snapshots,(select count(*) from policy_acceptances)::int acceptances,(select count(*) from policy_versions)::int policies,(select count(*) from custom_offers)::int offers,(select count(*) from audit_events)::int audit')
    const before=(await counts()).rows[0]
    for(const item of cases){const result=await outcome(()=>invoke(db,item.override));assert.equal(result.category,'RPC',item.name+': '+JSON.stringify(result));checked++;if('appValue'in item){assert.equal(validTerms(item.appValue),false,item.name+' application rejection');checked++}}
    const offerCases=[{name:'terms null',p_terms:null},{name:'terms wrong-type',p_terms:[]},{name:'ID missing',p_terms:{en:terms}},{name:'ID null',p_terms:{en:terms,id:null}},{name:'ID wrong-type',p_terms:{en:terms,id:1}},{name:'hash null',p_hash:null},{name:'hash invalid',p_hash:'bad'},{name:'expiry null',p_expires:null},{name:'expiry past',p_expires:'2000-01-01T00:00:00Z'},{name:'id null',p_id:null}]
    for(const item of cases.filter(item=>'appValue'in item))for(const locale of ['en','id'])offerCases.push({name:locale+' '+item.name,p_terms:{...variants,[locale]:item.appValue}})
    offerCases.push({name:'package mismatch',p_terms:{...variants,id:{...terms,package_id:'different'}}},{name:'milestone values mismatch',p_terms:{en:{...terms,milestones:[{label:'A',amount_idr:40000},{label:'B',amount_idr:60000}]},id:{...terms,milestones:[{label:'A',amount_idr:50000},{label:'B',amount_idr:50000}]}}})
    for(const {name,...input}of offerCases){const result=await outcome(()=>create(db,input));assert.equal(result.category,'RPC',name+': '+JSON.stringify(result));checked++}
    assert.deepEqual((await counts()).rows[0],before);checked++
    const key=randomUUID(),order=(await invoke(db,{p_key:key})).rows[0].id
    assert.equal((await invoke(db,{p_key:key})).rows[0].id,order);checked++
    for(const override of [{p_hash:null},{p_locale:null},{p_policies:null},{p_hash:'b'.repeat(64)}]){assert.equal((await outcome(()=>invoke(db,{p_key:key,...override}))).category,'RPC');checked++}
    const offerId=randomUUID();await create(db,{p_id:offerId});assert.equal((await create(db,{p_id:offerId})).rows[0].id,offerId);checked++
    const accepted=(await invoke(db,{p_offer:offerId})).rows[0].id
    assert.equal((await invoke(db,{p_offer:offerId})).rows[0].id,accepted);checked++
    for(const override of [{p_hash:null},{p_locale:null},{p_policies:null}]){assert.equal((await outcome(()=>invoke(db,{p_offer:offerId,...override}))).category,'RPC');checked++}
    assert.equal((await outcome(()=>create(db,{p_id:offerId,p_hash:null,p_expires:null}))).category,'RPC');checked++
    const after=(await counts()).rows[0];assert.equal(after.orders,2);assert.equal(after.snapshots,2);assert.equal(after.acceptances,8);checked++
    // Typed UUID/timestamp parameters are rejected by PostgreSQL before the RPC body.
    assert.equal((await outcome(()=>create(db,{p_expires:'not-a-date'}))).category,'type/cast');checked++
    assert.equal((await outcome(()=>invoke(db,{p_key:'not-a-uuid'}))).category,'type/cast');checked++
    assert(validOfferTerms(variants));checked++
    console.log(`Corrected validation: ${checked} checks passed; invalid payloads rejected by RPC before mutation, valid orders/offers and retries preserved. SQL Editor verification query also passed locally.`)
  } finally {await db.close()}
}
