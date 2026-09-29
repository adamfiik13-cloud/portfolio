import assert from 'node:assert/strict'
import { handleHealth } from '../lib/backend/health-handler.ts'
import { assertProjectIsolation } from '../lib/backend/environment.ts'
import { sanitizeErrorEvent } from '../lib/monitoring/privacy.ts'

let queried=0,reported=0
const secret='local-test-only-not-a-deployment-secret'
const dependencies={secret,check:async()=>{queried++;return true},reportFailure:async()=>{reported++}}
let r=await handleHealth(new Request('https://example.invalid'),dependencies)
assert.equal(r.status,401);assert.equal(queried,0)
r=await handleHealth(new Request('https://example.invalid',{headers:{authorization:'Bearer wrong'}}),dependencies)
assert.equal(r.status,401);assert.equal(queried,0)
r=await handleHealth(new Request('https://example.invalid'),{...dependencies,secret:undefined})
assert.equal(r.status,503);assert.equal(queried,0)
const authorized=()=>new Request('https://example.invalid',{headers:{authorization:'Bearer '+secret}})
r=await handleHealth(authorized(),dependencies)
assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true});assert.equal(r.headers.get('cache-control'),'no-store')
r=await handleHealth(authorized(),{...dependencies,check:async()=>{throw new Error('sensitive provider error')}})
assert.equal(r.status,503);assert.deepEqual(await r.json(),{ok:false});assert.equal(reported,1)
const env={APP_ENV:'staging',SUPABASE_PROJECT_REF:'stage',SUPABASE_STAGING_PROJECT_REF:'stage',SUPABASE_PRODUCTION_PROJECT_REF:'prod'}
assertProjectIsolation('https://stage.supabase.co',env)
assert.throws(()=>assertProjectIsolation('https://prod.supabase.co',env))
assert.throws(()=>assertProjectIsolation('https://stage.supabase.co',{...env,SUPABASE_PRODUCTION_PROJECT_REF:'stage'}))
assert.throws(()=>assertProjectIsolation('http://localhost:54321',{...env,VERCEL:'1',APP_ENV:'local'}))
const clean=sanitizeErrorEvent({message:'secret',request:{headers:{authorization:'secret'}},user:{email:'test@example.invalid'},breadcrumbs:[{message:'secret'}],extra:{file:'secret'},exception:{values:[{value:'secret'}]},environment:'staging'})
assert(!JSON.stringify(clean).includes('secret'));assert(!JSON.stringify(clean).includes('example.invalid'))
assert.equal(clean.environment,'staging')
console.log('PASS: cron authorization/failure handling, environment isolation, Sentry allowlist.')
