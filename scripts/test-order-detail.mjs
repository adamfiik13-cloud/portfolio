import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

// Local component/controller fixtures only. No hosted session, database or provider calls.
const native=createRequire(import.meta.url),cache=new Map()
let checks=0,runner=null,refreshes=0,actionResult={message:'invalid'}
const check=value=>{assert(value);checks++},equal=(a,b)=>{assert.deepEqual(a,b);checks++}
const fakeReact={...React,useState:initial=>{
  if(!runner)return [typeof initial==='function'?initial():initial,()=>{}]
  const current=runner,index=current.cursor++;if(!(index in current.slots))current.slots[index]=typeof initial==='function'?initial():initial
  return [current.slots[index],value=>{current.slots[index]=typeof value==='function'?value(current.slots[index]):value;current.changed=true}]
},useActionState:(action,initial)=>{
  if(!runner)return [initial,()=>{},false]
  const current=runner,index=current.cursor++;if(!(index in current.slots))current.slots[index]=initial
  return [current.slots[index],async form=>{const result=await action(current.slots[index],form);current.slots[index]=result;return result},false]
},useEffect:effect=>{if(runner)runner.effects.push(effect)},useRef:value=>({current:value}),useTransition:()=>[false,fn=>fn()]}
function load(file){
  let full=path.resolve(file);if(!path.extname(full))full+=fs.existsSync(full+'.ts')?'.ts':'.tsx'
  if(full.endsWith('.json'))return native(full)
  if(cache.has(full))return cache.get(full).exports
  const loaded={exports:{}};cache.set(full,loaded)
  const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const require=id=>id==='server-only'||id.endsWith('.css')?{}:id==='react'?fakeReact:id==='next/navigation'?{useRouter:()=>({refresh:()=>{refreshes++}})}:id==='@/lib/workspace/actions'?{briefAction:async()=>actionResult,reviewBriefAction:async()=>actionResult,startWorkAction:async()=>actionResult}:id==='@/lib/supabase/client'?{createClient:()=>{throw Error('No provider access in UI fixture')}}:id==='@/components/layout/LanguageSwitcher'||id==='@/components/ui/BrandSignature'?{__esModule:true,default:()=>null}:id==='@/components/layout/PublicLocaleProvider'?{PublicLocaleProvider:({children})=>children}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(full),id)):native(id)
  new Function('require','module','exports',code)(require,loaded,loaded.exports);return loaded.exports
}
const all=value=>Array.isArray(value)?value.flatMap(all):value&&typeof value==='object'&&value.props?[value,...all(value.props.children)]:[]
function mount(component){const state={slots:[],cursor:0,effects:[],changed:false};return {render(props){let tree;for(let i=0;i<8;i++){state.cursor=0;state.effects=[];state.changed=false;runner=state;try{tree=component(props)}finally{runner=null}if(!state.changed)return tree}throw Error('Editor did not settle')},effects(){for(const effect of state.effects)effect()}}}
const editor=load('lib/workspace/editor.ts'),forms=load('components/workspace/BriefForms.tsx'),ui=load('data/order-detail.ts'),rules=load('lib/workspace/rules.ts')
const Detail=load('components/workspace/OrderDetail.tsx').default,Refresh=load('components/workspace/OrderRefresh.tsx').default
const id='11111111-1111-4111-8111-111111111111',client='22222222-2222-4222-8222-222222222222'
const fields=[{id:'goal',label:'Agreed goal',instruction:'Original agreed question',required:true}]
const props={locale:'en',contractLocale:'en',orderId:id,revision:1,fields,responses:{goal:'Saved v1'}}
const instance=mount(forms.BriefForm)
let tree=instance.render(props)
equal(all(tree).find(node=>node.props.name==='revision').props.value,1)
tree=instance.render({...props,revision:3,responses:{goal:'Saved v3'}})
equal(all(tree).find(node=>node.props.name==='revision').props.value,3);equal(all(tree).find(node=>node.type==='textarea').props.value,'Saved v3')
all(tree).find(node=>node.type==='textarea').props.onChange({target:{value:'Unsaved local answer'}})
const latest={...props,revision:4,responses:{goal:'Other saved answer'}}
tree=instance.render(latest)
equal(all(tree).find(node=>node.props.name==='revision').props.value,3);equal(all(tree).find(node=>node.type==='textarea').props.value,'Unsaved local answer');equal(all(tree).find(node=>node.type==='fieldset').props.disabled,true)
all(tree).find(node=>node.type==='button'&&node.props.children===ui.orderDetailText('keepDraft','en')).props.onClick()
tree=instance.render(latest)
equal(all(tree).find(node=>node.props.name==='revision').props.value,4);equal(all(tree).find(node=>node.type==='textarea').props.value,'Unsaved local answer');equal(all(tree).find(node=>node.type==='fieldset').props.disabled,false)
const form=new FormData();form.set('revision','4');form.set('operation','save');form.set('answer:goal','Unsaved local answer')
actionResult={message:'invalid'};await tree.props.action(form);tree=instance.render(latest);instance.effects();equal(refreshes,0);equal(all(tree).find(node=>node.type==='textarea').props.value,'Unsaved local answer')
actionResult={message:'stale'};await tree.props.action(form);tree=instance.render(latest);instance.effects();equal(refreshes,0);equal(all(tree).find(node=>node.props.name==='revision').props.value,4)
actionResult={message:'saved',revision:5};await tree.props.action(form);tree=instance.render(latest);instance.effects();equal(refreshes,1);equal(all(tree).find(node=>node.props.name==='revision').props.value,5)
tree=instance.render({...latest,revision:6,responses:{goal:'Fresh server answer'}});equal(all(tree).find(node=>node.type==='textarea').props.value,'Fresh server answer');equal(all(tree).find(node=>node.props.name==='revision').props.value,6)
all(tree).find(node=>node.type==='textarea').props.onChange({target:{value:'Another unsaved answer'}})
const newest={...latest,revision:7,responses:{goal:'Latest confirmed answer'}};tree=instance.render(newest)
all(tree).find(node=>node.type==='button'&&node.props.children===ui.orderDetailText('loadSaved','en')).props.onClick();tree=instance.render(newest);equal(all(tree).find(node=>node.type==='textarea').props.value,'Latest confirmed answer')
check(editor.sameAnswers({a:'1',b:'2'},{b:'2',a:'1'}))
const dirty={...editor.createBriefDraft(2,{goal:'saved'}),answers:{goal:'draft'}};equal(editor.receiveBrief(dirty,3,{goal:'new'},false),dirty);equal(editor.receiveBrief(editor.createBriefDraft(2,{goal:'saved'}),3,{goal:'new'},true).revision,2)
const ownerForm=mount(forms.ReviewBriefForm),ownerProps={locale:'en',orderId:id,revision:2}
tree=ownerForm.render(ownerProps);all(tree).find(node=>node.type==='textarea').props.onChange({target:{value:'Unsaved owner note'}})
tree=ownerForm.render({...ownerProps,revision:4});equal(all(tree).find(node=>node.props.name==='revision').props.value,2);equal(all(tree).find(node=>node.type==='textarea').props.value,'Unsaved owner note');equal(all(tree).find(node=>node.type==='fieldset').props.disabled,true)
all(tree).find(node=>node.type==='button'&&node.props.children===ui.orderDetailText('useReview','en')).props.onClick();tree=ownerForm.render({...ownerProps,revision:4});equal(all(tree).find(node=>node.props.name==='revision').props.value,4);equal(all(tree).find(node=>node.type==='textarea').props.value,'Unsaved owner note')
const terms=load('data/direct-packages.ts').directPackageTerms('digital-business-consultation','en','id');terms.service_name='Accepted consultation service';terms.brief_fields=fields
const base={order:{id,client_id:client,locale:'en',amount_idr:150000,payment_status:'paid',work_status:'draft',refund_status:'none',work_started_at:null,payment_verified:true},terms,fields,brief:{status:'changes_requested',revision:3,responses:{goal:'Previous answer'},review_note:'Please add one main consultation priority.'},files:[{id:'file',original_filename:'previous.pdf',mime_type:'application/pdf',size_bytes:100,status:'ready'}],history:[],client:{display_name:'Test client'}}
for(const locale of ['en','id'])for(const asOwner of [false,true])for(const status of ['incomplete','changes_requested','submitted','approved']){
  const workspace={...base,brief:{...base.brief,status}},html=renderToStaticMarkup(React.createElement(Detail,{locale,workspace,asOwner,payment:React.createElement('span',null,'Sandbox payment fixture'),email:React.createElement('span',null,'Email fixture')},React.createElement('p',null,'Immutable agreement fixture')))
  const step=ui.orderDetailStep(base.order,status,asOwner)
  check(html.replaceAll('&#x27;',"'").replaceAll('&#39;',"'").includes(ui.orderDetailText(step,locale)))
  equal(html.includes('name="answer:goal"'),!asOwner&&['incomplete','changes_requested'].includes(status))
  check(html.includes('Previous answer')&&html.includes('previous.pdf')&&html.includes('Original agreed question'))
  check(html.includes('order-detail-theme')&&html.includes('order-summary')&&html.includes('order-work')&&html.includes('order-extra'))
  if(status==='changes_requested'){check(html.indexOf(base.brief.review_note)<html.indexOf('<details'));equal(html.includes('href="#order-brief"'),!asOwner);if(asOwner)check(!html.includes(ui.orderDetailText('amendHelp',locale)))}
  equal(html.includes('id="owner-brief-review"'),asOwner&&status==='submitted')
  equal(html.includes('id="owner-start-work"'),asOwner&&status==='approved')
  const optional=html.slice(html.indexOf('class="order-extra"'));check(optional.includes('Immutable agreement fixture')&&optional.includes(id)&&optional.includes('Email fixture'))
  check(!html.match(/<h1[^>]*>[^<]*11111111/));check(!/(?:RPC|callback|snapshot|batch implementasi)/i.test(html.replace('Immutable agreement fixture','')))
}
for(const verified of [false,true]){
  const progress={...base.order,work_status:'in_progress',work_started_at:'2026-11-01T00:00:00Z',payment_verified:verified}
  equal(ui.orderDetailStep(progress,'approved',true),'inProgress')
  const html=renderToStaticMarkup(React.createElement(Detail,{locale:'id',workspace:{...base,order:progress,brief:{...base.brief,status:'approved'}},asOwner:true,payment:null,email:null}));check(!html.includes('id="owner-start-work"'))
}
equal(ui.orderDetailStep({...base.order,payment_verified:false},'approved',true),'waitStart')
check(!rules.editableBrief('paid','in_progress','2026-11-01T00:00:00Z','changes_requested'))
const beforeRefresh=refreshes;tree=Refresh({locale:'id'});all(tree).find(node=>node.type==='button').props.onClick();equal(refreshes,beforeRefresh+1)
const css=fs.readFileSync('components/workspace/order-detail.css','utf8');check(css.includes('max-width: 1120px')&&css.includes('304px')&&css.includes('gap: 24px'));check(!/overflow-y:\s*(auto|scroll)|position:\s*fixed/.test(css));check(css.includes('min-height: 44px')&&css.includes('prefers-reduced-motion'))
console.log(`PASS ${checks} order-detail/editor checks: clean revision sync, unsaved draft/conflict choices, confirmed feedback, manual refresh, role-specific EN/ID states, visible active notes, readonly/start gates, retained fields/files and optional details. Local fixtures only; hosted cause/QA remain unverified.`)
