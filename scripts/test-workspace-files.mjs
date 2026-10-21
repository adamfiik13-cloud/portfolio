import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { deflateRawSync } from 'node:zlib'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

// Disposable local PostgreSQL/Storage mocks. No hosted uploads, downloads,
// customer files, provider transactions, email or credential access.
const native=createRequire(import.meta.url),cache=new Map(),db=new PGlite(),objects=new Map(),storageCalls=[]
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',owner='33333333-3333-4333-8333-333333333333',team='44444444-4444-4444-8444-444444444444'
let actor=a,checks=0,privilegedCalls=0,scopedFetch=null,uploadSignFails=false
const env={APP_ENV:'staging',SUPABASE_STAGING_PROJECT_REF:'stage',SUPABASE_PRODUCTION_PROJECT_REF:'prod',SUPABASE_PROJECT_REF:'stage',SUPABASE_SERVICE_ROLE_KEY:'test-only-service-secret',NEXT_PUBLIC_SUPABASE_URL:'https://stage.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'test-only'}
const savedEnv=Object.fromEntries(Object.keys(env).map(key=>[key,process.env[key]])),oldFetch=globalThis.fetch
Object.assign(process.env,env)
const equal=(actual,expected)=>{assert.deepEqual(actual,expected);checks++},check=value=>{assert(value);checks++},denied=async(fn,pattern)=>{await assert.rejects(fn,pattern);checks++}
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0],uuid=()=>scalar('select gen_random_uuid()')
function queryClient(){return {from:table=>{
  assert(['orders','order_files','staff_access'].includes(table));let fields='',filters=[]
  const query={select:value=>{fields=value;return query},eq:(key,value)=>{filters.push([key,value]);return query},maybeSingle:async()=>{
    assert(/^[a-z_,]+$/.test(fields)&&filters.every(([key])=>/^[a-z_]+$/.test(key)))
    return {data:(await db.query(`select ${fields} from ${table}${filters.length?' where '+filters.map(([key],index)=>key+'=$'+(index+1)).join(' and '):''}`,filters.map(([,value])=>value))).rows[0]??null,error:null}
  }};return query
},rpc:async(name,args)=>{
  privilegedCalls++;assert(['workspace_prepare_file','workspace_finalize_file','workspace_discard_file'].includes(name))
  try{return {data:await scalar(`select ${name}(${Object.values(args).map((_,index)=>'$'+(index+1)).join(',')})`,Object.values(args)),error:null}}
  catch{return {data:null,error:{message:'details withheld'}}}
},storage:{from:bucket=>{assert.equal(bucket,'client-briefs');return {
  createSignedUploadUrl:async(storagePath,options)=>{storageCalls.push({op:'prepare',path:storagePath,options});assert.equal(options.upsert,false);return uploadSignFails?{data:null,error:{message:'details withheld'}}:{data:{path:storagePath,token:'test-only-upload-token',signedUrl:'https://stage.supabase.co/storage/v1/object/upload/sign/client-briefs/'+storagePath+'?token=test-only-upload-token'},error:null}},
  download:async storagePath=>{storageCalls.push({op:'validate',path:storagePath});try{const response=await scopedFetch('https://stage.supabase.co/storage/v1/object/client-briefs/'+storagePath);return response.ok?{data:await response.blob(),error:null}:{data:null,error:{message:'details withheld'}}}catch{return {data:null,error:{message:'details withheld'}}}},
  createSignedUrl:async(storagePath,expiry,options)=>{storageCalls.push({op:'download',path:storagePath,expiry,options});return {data:{signedUrl:'https://stage.supabase.co/storage/v1/object/sign/client-briefs/'+storagePath+'?token=test-only-read-token'},error:null}},
}}}}}
const context=()=>({client:queryClient(),user:actor?{id:actor}:null,configured:true})
function load(file){
  let full=path.resolve(file);if(!path.extname(full))full+=fs.existsSync(full+'.ts')?'.ts':'.tsx'
  if(cache.has(full))return cache.get(full).exports
  const mod={exports:{}};cache.set(full,mod)
  const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const require=id=>id==='server-only'?{}:id==='@/lib/commerce/server'?{commerceContext:async()=>context(),ownerContext:async()=>actor&&await scalar('select count(*)::int from staff_access where user_id=$1 and active and role=\'owner\'',[actor])?context():null}:id==='@/lib/auth/context'?{authContext:async()=>context()}:id==='@supabase/supabase-js'?{createClient:(url,key,options)=>{assert.equal(url,env.NEXT_PUBLIC_SUPABASE_URL);assert.equal(key,env.SUPABASE_SERVICE_ROLE_KEY);scopedFetch=options.global?.fetch;return queryClient()}}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(full),id)):native(id)
  new Function('require','module','exports',code)(require,mod,mod.exports);return mod.exports
}
globalThis.fetch=async(input,options)=>{
  equal(options.redirect,'error');equal(options.cache,'no-store');check(!!options.signal)
  const url=new URL(input);equal(url.origin,'https://stage.supabase.co')
  const storagePath=url.pathname.replace('/storage/v1/object/client-briefs/',''),bytes=objects.get(storagePath)
  return bytes?new Response(bytes,{headers:{'Content-Length':String(bytes.length)}}):new Response(null,{status:404})
}
const rules=load('lib/workspace/file-rules.ts'),api=load('app/api/workspace/files/route.ts'),catalog=load('data/commerce-catalog.ts'),commerce=load('lib/commerce/server.ts')
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1}return (crc^0xffffffff)>>>0}
function zip(entries){let offset=0;const locals=[],central=[];for(const[name,body]of entries){const nameBytes=Buffer.from(name),bytes=Buffer.from(body),compressed=deflateRawSync(bytes),crc=crc32(bytes),head=Buffer.alloc(30),record=Buffer.alloc(46);head.writeUInt32LE(0x04034b50);head.writeUInt16LE(20,4);head.writeUInt16LE(8,8);head.writeUInt32LE(crc,14);head.writeUInt32LE(compressed.length,18);head.writeUInt32LE(bytes.length,22);head.writeUInt16LE(nameBytes.length,26);record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(8,10);record.writeUInt32LE(crc,16);record.writeUInt32LE(compressed.length,20);record.writeUInt32LE(bytes.length,24);record.writeUInt16LE(nameBytes.length,28);record.writeUInt32LE(offset,42);locals.push(head,nameBytes,compressed);central.push(record,nameBytes);offset+=head.length+nameBytes.length+compressed.length}const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,directory,end])}
const docParts=word=>{
  const main=word?'word/document.xml':'xl/workbook.xml',type=word?'wordprocessingml.document.main+xml':'spreadsheetml.sheet.main+xml',root=word?'document':'workbook'
  return [['[Content_Types].xml',`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/${main}" ContentType="application/vnd.openxmlformats-officedocument.${type}"/></Types>`],['_rels/.rels',`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="${main}"/></Relationships>`],[main,`<w:${root} xmlns:w="http://schemas.openxmlformats.org/officeDocument/2006/main"><w:body/></w:${root}>`]]
}
const meta=(bytes,filename,mime)=>({original_filename:filename,size_bytes:bytes.length,mime_type:mime})
const request=(body,extra={})=>new Request('https://staging.example.invalid/api/workspace/files',{method:'POST',headers:{Origin:'https://staging.example.invalid','Content-Type':'application/json',...extra},body:JSON.stringify(body)})
const call=async body=>{const response=await api.POST(request(body));equal(response.headers.get('cache-control'),'private, no-store');equal(response.headers.get('x-robots-tag'),'noindex, nofollow');return {status:response.status,body:await response.json()}}
async function newOrder(paid=true){const terms=catalog.catalogTerms('digital-business-consultation','en','id').terms,key=await uuid(),order=await scalar('select commerce_place_catalog_order($1,$2,$3,$4,$5,$6,$7)',[a,key,'en',terms,'a'.repeat(64),commerce.policyBundle('en'),true]);if(paid){const reservation=await scalar('select payments_reserve($1,$2,$3,$4)',[a,order,'TEST-MERCHANT',null]),attempt=reservation.attempt;await scalar('select payments_apply($1,$2,$3,$4,$5,$6,$7,$8,$9)',[attempt.provider_reference,'TEST-MERCHANT',150000,'IDR','test-'+attempt.id,'settlement','accept',0,createHash('sha256').update(attempt.id).digest('hex')])}return order}
async function prepare(orderId,bytes,filename='brief.txt',mime='text/plain',revision=0){const result=await call({op:'prepare',orderId,revision,filename,mime,size:bytes.length});equal(result.status,200);check(result.body.ok);check(!JSON.stringify(result.body).includes(env.SUPABASE_SERVICE_ROLE_KEY));equal(result.body.path,orderId+'/'+result.body.fileId);objects.set(result.body.path,bytes);await db.query('insert into storage.objects(bucket_id,name)values($1,$2)',['client-briefs',result.body.path]);return result.body}
const finish=(orderId,file,revision=0)=>call({op:'finalize',orderId,fileId:file.fileId,revision})
try{
  const sharp=native('sharp'),valid=[['test.pdf','application/pdf',Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n')],['test.txt','text/plain',Buffer.from('Brief factual information.\n')],['test.csv','text/csv',Buffer.from('name,value\n"test, item",1\n')],['test.docx',rules.BRIEF_FILE_MIMES[6],zip(docParts(true))],['test.xlsx',rules.BRIEF_FILE_MIMES[7],zip(docParts(false))]]
  for(const[extension,mime]of [['png','image/png'],['jpeg','image/jpeg'],['webp','image/webp']])valid.push(['test.'+extension,mime,await sharp({create:{width:1,height:1,channels:3,background:'#ffffff'}})[extension==='jpeg'?'jpeg':extension]().toBuffer()])
  for(const[filename,mime,bytes]of valid){check(rules.validBriefFile({filename,size:bytes.length,mime}));equal(rules.validateBriefBytes(bytes,meta(bytes,filename,mime)),mime);await denied(async()=>rules.validateBriefBytes(bytes,{...meta(bytes,filename,mime),size_bytes:bytes.length+1}));}
  for(const changed of [{filename:'../brief.pdf',size:20,mime:'application/pdf'},{filename:'brief\u0000.pdf',size:20,mime:'application/pdf'},{filename:'brief.html',size:20,mime:'application/pdf'},{filename:'brief.pdf',size:0,mime:'application/pdf'},{filename:'brief.pdf',size:rules.MAX_BRIEF_FILE_BYTES+1,mime:'application/pdf'},{filename:'brief.pdf',size:20,mime:'text/html'}])check(!rules.validBriefFile(changed))
  for(const body of [Buffer.from('<html>active</html>'),Buffer.from('#!/bin/sh\necho script'),Buffer.from([0,1,2]),Buffer.from([255,255])])await denied(async()=>rules.validateBriefBytes(body,meta(body,'bad.txt','text/plain')))
  for(const invalid of [zip([['plain.txt','not OOXML']]),zip([...docParts(true),['../escape.txt','bad']]),zip([...docParts(true),['word/vbaProject.bin','macro']]),zip([...docParts(true),['word/large.xml','x'.repeat(16*1024*1024+1)]]),zip(docParts(true).map(([name,body])=>[name,name==='word/document.xml'?'<!DOCTYPE document [<!ENTITY leak SYSTEM "file:///not-read">]><w:document>&leak;</w:document>':body]))])await denied(async()=>rules.validateBriefBytes(invalid,meta(invalid,'bad.docx',rules.BRIEF_FILE_MIMES[6])))
  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;`)
  for(const file of fs.readdirSync('supabase/migrations').filter(file=>file.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'))
  await db.exec(`insert into auth.users(id,email,email_confirmed_at)values('${a}','a@example.invalid',now()),('${b}','b@example.invalid',now()),('${owner}','owner@example.invalid',now()),('${team}','team@example.invalid',now());insert into staff_access(user_id,role)values('${owner}','owner'),('${team}','team');`)
  const unpaid=await newOrder(false),order=await newOrder(),bytes=Buffer.from('A brief attachment without any credentials.')
  equal((await call({op:'prepare',orderId:unpaid,revision:0,filename:'brief.txt',size:bytes.length,mime:'text/plain'})).status,400)
  const before=privilegedCalls
  equal((await api.POST(request({op:'prepare',orderId:order},{Origin:'https://attacker.invalid'}))).status,403)
  equal((await api.POST(new Request('https://staging.example.invalid/api/workspace/files',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}))).status,403)
  equal((await api.POST(request({op:'prepare',orderId:order},{'Content-Length':'9000'}))).status,400)
  equal((await api.POST(request({op:'prepare',orderId:order},{'Content-Type':'text/plain'}))).status,400)
  equal((await api.POST(request({large:'x'.repeat(5000)}))).status,400);equal(privilegedCalls,before)
  actor=b;equal((await call({op:'prepare',orderId:order,revision:0,filename:'brief.txt',size:bytes.length,mime:'text/plain'})).status,400);equal(privilegedCalls,before);actor=a
  const pending=await prepare(order,bytes)
  equal((await call({op:'download',orderId:order,fileId:pending.fileId})).status,400)
  const fields=catalog.catalogTerms('digital-business-consultation','en','id').terms.brief_fields,responses=Object.fromEntries(fields.map(field=>[field.id,'Test-only factual input']))
  await denied(()=>scalar('select workspace_save_brief($1,$2,$3,$4,$5)',[a,order,0,responses,true]),/Pending attachments/)
  await scalar('select workspace_save_brief($1,$2,$3,$4,$5)',[a,order,0,{},false])
  equal((await finish(order,pending)).status,400);equal(await scalar('select status from order_files where id=$1',[pending.fileId]),'pending')
  equal((await call({op:'discard',orderId:order,fileId:pending.fileId,revision:1})).status,200)
  equal(await scalar('select status from order_files where id=$1',[pending.fileId]),'deleted')
  const ready=await prepare(order,bytes,'brief.txt','text/plain',1);equal((await finish(order,ready,1)).status,200);equal((await finish(order,ready,1)).status,200)
  equal(await scalar('select content_sha256 from order_files where id=$1',[ready.fileId]),createHash('sha256').update(bytes).digest('hex'))
  equal((await call({op:'discard',orderId:order,fileId:ready.fileId,revision:1})).status,400)
  equal((await call({op:'download',orderId:order,fileId:ready.fileId})).status,200)
  const sign=storageCalls.filter(call=>call.op==='download').at(-1);equal(sign.expiry,60);equal(sign.options.download,'brief.txt')
  actor=owner;equal((await call({op:'download',orderId:order,fileId:ready.fileId})).status,200)
  actor=team;equal((await call({op:'download',orderId:order,fileId:ready.fileId})).status,400)
  actor=b;const signCount=storageCalls.filter(call=>call.op==='download').length;equal((await call({op:'download',orderId:order,fileId:ready.fileId})).status,400);equal((await finish(order,ready,1)).status,400);equal(storageCalls.filter(call=>call.op==='download').length,signCount);actor=a
  await scalar('select workspace_save_brief($1,$2,$3,$4,$5)',[a,order,1,responses,true])
  equal((await finish(order,ready,1)).status,400);equal((await call({op:'prepare',orderId:order,revision:2,filename:'brief.txt',size:bytes.length,mime:'text/plain'})).status,400)
  const invalidOrder=await newOrder(),invalid=await prepare(invalidOrder,Buffer.from('<html>not a PDF</html>'),'bad.pdf','application/pdf')
  equal((await finish(invalidOrder,invalid)).status,400);equal(await scalar('select status from order_files where id=$1',[invalid.fileId]),'quarantined')
  equal((await call({op:'download',orderId:invalidOrder,fileId:invalid.fileId})).status,400)
  actor=b;equal((await call({op:'discard',orderId:invalidOrder,fileId:invalid.fileId,revision:0})).status,400);actor=a
  equal((await call({op:'discard',orderId:invalidOrder,fileId:invalid.fileId,revision:0})).status,200)
  uploadSignFails=true;const failedBefore=await scalar("select count(*)::int from order_files where status='pending'");equal((await call({op:'prepare',orderId:invalidOrder,revision:0,filename:'brief.txt',size:bytes.length,mime:'text/plain'})).status,400);equal(await scalar("select count(*)::int from order_files where status='pending'"),failedBefore);uploadSignFails=false
  const pendingOrder=await newOrder(),hidden=await prepare(pendingOrder,bytes)
  await db.exec(`select set_config('request.jwt.claim.sub','${a}',false);set role authenticated;`)
  equal(await scalar('select count(*)::int from order_files where id=$1',[hidden.fileId]),1)
  equal(await scalar('select count(*)::int from storage.objects where name=$1',[hidden.path]),0)
  equal(await scalar('select count(*)::int from storage.objects where name=$1',[ready.path]),1)
  await denied(()=>scalar('select workspace_finalize_file($1,$2,$3,$4,$5,$6)',[a,pendingOrder,0,hidden.fileId,true,'a'.repeat(64)]),/permission denied/)
  await denied(()=>db.exec("update order_files set status='ready'"),/permission denied/)
  await db.exec(`reset role;select set_config('request.jwt.claim.sub','${b}',false);set role authenticated;`)
  equal(await scalar('select count(*)::int from order_files'),0);equal(await scalar('select count(*)::int from storage.objects'),0)
  await db.exec('reset role;set role anon');await denied(()=>scalar('select workspace_discard_file($1,$2,$3,$4)',[a,pendingOrder,0,hidden.fileId]),/permission denied/);await db.exec('reset role')
  await denied(()=>db.query('update order_files set mime_type=$1 where id=$2',['application/pdf',ready.fileId]),/Immutable upload/)
  await denied(()=>db.query("update order_files set status='pending' where id=$1",[ready.fileId]),/Immutable finalized/)
  const callsBeforeIsolation=privilegedCalls;process.env.APP_ENV='production';equal((await call({op:'prepare',orderId:pendingOrder,revision:0,filename:'brief.txt',size:bytes.length,mime:'text/plain'})).status,400);equal(privilegedCalls,callsBeforeIsolation);process.env.APP_ENV='staging'
  const audit=await scalar("select count(*)::int from audit_events where action like 'brief_file_%'");check(audit>0)
  const capped=await prepare(pendingOrder,bytes);objects.set(capped.path,Buffer.alloc(rules.MAX_BRIEF_FILE_BYTES+1));equal((await finish(pendingOrder,capped)).status,400)
  check(!fs.readFileSync('lib/workspace/files.ts','utf8').includes('getPublicUrl'))
  console.log(`Workspace files: ${checks} checks passed (local Storage/DB mocks; ownership/RLS, no-overwrite signing, actual size/MIME/OOXML, quarantine, revision locks, discard recovery, CSRF/body caps and 60-second authorized downloads). No malware-scanning or hosted Storage QA claim.`)
}finally{await db.close();globalThis.fetch=oldFetch;for(const[key,value]of Object.entries(savedEnv)){if(value===undefined)delete process.env[key];else process.env[key]=value}}
