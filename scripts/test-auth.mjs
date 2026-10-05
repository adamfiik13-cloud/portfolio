import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runAuthFlow } from '../lib/auth/flow.ts'
import { validEmail, validPassword, validToken, verifiedUser, authOrigin } from '../lib/auth/rules.ts'
import { authPaths, authMessages } from '../data/auth-content.ts'
import { assertProjectIsolation } from '../lib/backend/environment.ts'

const verified={id:'client-test',email:'test@example.invalid',email_confirmed_at:'2026-10-03',is_anonymous:false,user_metadata:{display_name:'Client',role:'owner'}}
const input={email:'TEST@example.invalid',password:'Correct-Password123',confirmPassword:'Correct-Password123',name:'Client',orderIntent:true,token:'a'.repeat(64),tokenType:'recovery'}
let calls=[]
function client(overrides={}) {
  const ok={data:{user:verified},error:null}
  const auth=Object.fromEntries(['signUp','signInWithPassword','getUser','verifyOtp','updateUser','resetPasswordForEmail','signOut'].map(method=>[method,async value=>{calls.push({method,value});return ok}]))
  return {auth:{...auth,...overrides},from:table=>({update:value=>({eq:async(key,id)=>{calls.push({table,value,key,id});return {error:null}}})})}
}
const run=(kind,locale='en',fields={},overrides={})=>{calls=[];return runAuthFlow(kind,locale,{...input,...fields},client(overrides),'https://staging.adamswork.app')}
assert(validEmail(input.email));assert(!validEmail('bad@'));assert(validPassword(input.password));assert(!validPassword('short'));assert(!validPassword('NoDigitsOrSymbols'));assert(!validToken('short'))
assert(verifiedUser(verified));assert(!verifiedUser({...verified,email_confirmed_at:null}));assert(!verifiedUser({...verified,is_anonymous:true}))
assert.equal((await run('login','en')).destination,'/account')
assert.equal((await run('login','id')).destination,'/id/akun')
assert.equal((await run('login','en',{}, {signInWithPassword:async()=>({data:{user:null},error:{message:'sensitive'}})})).message,'failed')
assert.equal((await run('login','en',{}, {getUser:async()=>({data:{user:null},error:null})})).message,'failed')
assert.equal((await run('login','en',{}, {signInWithPassword:async()=>({data:{user:{...verified,email_confirmed_at:null}},error:null})})).message,'failed')
assert.equal((await run('register','id',{orderIntent:false})).message,'invalid');assert.equal(calls.length,0)
assert.equal((await run('register','id')).message,'checkEmail');assert.equal(calls.at(-1).method,'signOut')
assert.equal(calls[0].value.options.emailRedirectTo,'https://staging.adamswork.app/id/auth/konfirmasi?locale=id');assert.deepEqual(Object.keys(calls[0].value.options.data).sort(),['display_name','locale'])
const absent=await run('register','en',{}, {signUp:async()=>({data:{user:null},error:{message:'already registered'}})})
assert.equal(absent.message,'checkEmail');assert(!JSON.stringify(absent).includes(input.password))
assert.equal((await run('forgot','id',{}, {resetPasswordForEmail:async()=>({error:{message:'not found'}})})).message,'resetSent')
assert.equal((await run('forgot','id',{}, {resetPasswordForEmail:async()=>{throw Error('provider outage')}})).message,'resetSent')
assert.equal((await run('reset','en',{token:''})).message,'invalidLink');assert.equal(calls.length,0)
assert.equal((await run('reset','en',{tokenType:'signup'})).message,'invalidLink');assert.equal(calls.length,0)
assert.equal((await run('reset','en',{confirmPassword:'different'})).message,'invalidPassword');assert.equal(calls.length,0)
assert.equal((await run('reset','en',{}, {verifyOtp:async()=>({data:{user:null},error:{message:'expired'}})})).message,'invalidLink');assert(!calls.some(c=>c.method==='updateUser'))
assert.equal((await run('reset','en',{}, {getUser:async()=>({data:{user:{...verified,id:'other-user'}},error:null})})).message,'invalidLink');assert(!calls.some(c=>c.method==='updateUser'))
assert.equal((await run('reset','id')).destination,'/id/masuk?notice=passwordSaved');assert.deepEqual(calls.map(c=>c.method),['verifyOtp','getUser','updateUser','signOut']);assert.equal(calls.at(-1).value.scope,'global')
assert.equal((await run('reset','en',{tokenType:'invite'})).destination,'/login?notice=passwordSaved')
assert.equal((await run('confirm','id',{tokenType:'signup'})).destination,'/id/akun?notice=verifiedNotice')
assert.deepEqual(calls.at(-1).value,{display_name:'Client',locale:'id'});assert.equal(calls.at(-1).table,'profiles')
for(const paths of Object.values(authPaths)){assert(paths.en && paths.id);assert(paths.id.startsWith('/id/'))}
for(const copy of Object.values(authMessages))assert(copy.en?.trim() && copy.id?.trim())
const env={APP_ENV:'staging',SUPABASE_PROJECT_REF:'stage',SUPABASE_STAGING_PROJECT_REF:'stage',SUPABASE_PRODUCTION_PROJECT_REF:'production'}
assertProjectIsolation('https://stage.supabase.co',env);assert.throws(()=>assertProjectIsolation('https://production.supabase.co',env));assert.throws(()=>assertProjectIsolation('https://stage.supabase.co',{...env,SUPABASE_PRODUCTION_PROJECT_REF:'stage'}))
assert.equal(authOrigin({APP_ENV:'staging'}),'https://staging.adamswork.app');assert.throws(()=>authOrigin({APP_ENV:'staging',NEXT_PUBLIC_SITE_URL:'https://evil.example'}));assert.throws(()=>authOrigin({APP_ENV:'production',NEXT_PUBLIC_SITE_URL:'https://adamswork.app'}))
assert.equal(authOrigin({APP_ENV:'local',NEXT_PUBLIC_SITE_URL:'http://localhost:3000'}),'http://localhost:3000')
const page=await readFile('components/auth/AuthPage.tsx','utf8');assert(page.includes('if (!client || !user) redirect(authPaths.login[locale])'));assert(page.includes('context.user) redirect(orderDestination(orderingIntent, locale) ?? authPaths.account[locale])'));assert(page.includes('index: false, follow: false'))
const callback=await readFile('app/(en)/auth/callback/route.ts','utf8');assert(!callback.includes('searchParams.get("next")'));assert(callback.includes('auth.getUser()'))
console.log('PASS: auth lifecycle, one-time reset capability, verified identity, generic errors, contextual registration, redirects, locale parity, environment isolation and protected-page wiring. Provider calls are stubbed; this is not hosted Auth QA.')
