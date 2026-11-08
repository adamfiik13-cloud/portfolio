import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

// Public UI and configuration smoke only: no account, provider, database or payment calls.
const native=createRequire(import.meta.url),cache=new Map()
let checks=0,search='',controlled=false,states=[],cursor=0
const check=value=>{assert(value);checks++},equal=(a,b)=>{assert.deepEqual(a,b);checks++}
const hooks={...React,useSyncExternalStore:()=>search,useState:initial=>{
  if(!controlled)return [typeof initial==='function'?initial():initial,()=>{}]
  const index=cursor++;if(states[index]===undefined)states[index]=initial
  return [states[index],value=>{states[index]=value}]
}}
function resolve(file){let full=path.resolve(file);if(!path.extname(full))full+=fs.existsSync(full+'.ts')?'.ts':'.tsx';return full}
function load(file){
  const full=resolve(file)
  if(full.endsWith('.json'))return native(full)
  if(cache.has(full))return cache.get(full).exports
  const loaded={exports:{}};cache.set(full,loaded)
  const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
  const require=id=>id==='server-only'||id.endsWith('.css')?{}:id==='react'?hooks:id==='next/link'?{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)}:['@/components/layout/Navbar','@/components/layout/Footer'].includes(id)?{__esModule:true,default:()=>null}:id==='@/components/layout/PublicLocaleProvider'?{PublicLocaleProvider:({children,paths})=>React.createElement('div',{'data-en':paths.en,'data-id':paths.id},children)}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(full),id)):native(id)
  new Function('require','module','exports',code)(require,loaded,loaded.exports)
  return loaded.exports
}
const catalog=load('data/service-catalog.ts'),packages=load('data/direct-packages.ts'),ordering=load('data/service-ordering.ts'),present=load('components/services/service-presentation.ts'),searching=load('lib/service-search.ts'),copy=load('data/service-copy.ts')
const Detail=load('components/services/ServiceDetail.tsx').default,Browser=load('components/services/CatalogBrowser.tsx').default,localeUI=load('components/services/ServiceLocaleProvider.tsx')
const decode=html=>html.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#x27;',"'").replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>')
const elements=value=>Array.isArray(value)?value.flatMap(elements):value&&typeof value==='object'&&value.props?[value,...elements(value.props.children)]:[]
function clientGraph(file,seen=new Set()){
  const full=resolve(file);if(seen.has(full)||full.endsWith('.json'))return seen
  seen.add(full);const source=fs.readFileSync(full,'utf8')
  check(!source.includes('server-only')&&!source.includes('SUPABASE_SERVICE_ROLE_KEY'))
  check(!/[\\/](?:commerce-catalog|direct-packages)\.[jt]s$|[\\/]policies[\\/](?:en|id)\.[jt]s$/.test(full))
  for(const entry of ts.preProcessFile(source).importedFiles){const id=entry.fileName;if(id.startsWith('@/')||id.startsWith('.'))clientGraph(id.startsWith('@/')?id.slice(2):path.resolve(path.dirname(full),id),seen)}
  return seen
}
const oldEnv=process.env.APP_ENV,oldWindow=globalThis.window
try{
  equal(catalog.catalogServices.length,19)
  clientGraph('components/services/CatalogBrowser.tsx');clientGraph('components/services/ServiceLocaleProvider.tsx')
  for(const locale of ['en','id']){
    const modes=Object.fromEntries(catalog.catalogServices.map(service=>[service.id,present.servicePresentation(service.id,locale).mode]))
    equal(Object.values(modes).filter(mode=>mode==='direct').length,9);equal(Object.values(modes).filter(mode=>mode==='compatibility').length,1);equal(Object.values(modes).filter(mode=>mode==='inquiry').length,9)
    equal(modes['seo-foundation'],'compatibility');equal(modes['landing-page-starter'],'inquiry')
    equal(ordering.filterByOrdering(catalog.catalogServices,modes,'all').length,19);equal(ordering.filterByOrdering(catalog.catalogServices,modes,'direct').length,9);equal(ordering.filterByOrdering(catalog.catalogServices,modes,'discuss').length,10)
    equal(ordering.orderingGroup(undefined),'discuss')
    controlled=true;states=[]
    const render=()=>{cursor=0;return Browser({locale,modes,onlineOrders:true})}
    const markup=()=>renderToStaticMarkup(render())
    let tree=render(),html=markup()
    equal((html.match(/data-service-id=/g)??[]).length,19)
    for(const service of catalog.catalogServices)equal((html.match(new RegExp('data-service-id="'+service.id+'"','g'))??[]).length,1)
    check(html.includes(copy.serviceCopy.orderDirectly[locale])&&html.includes(copy.serviceCopy.discussFirst[locale]));check(html.includes(copy.serviceCopy.career[locale]));check(!html.includes(copy.serviceCopy.featured[locale]))
    for(const article of html.matchAll(/<article[\s\S]*?<\/article>/g)){equal((article[0].match(/<a\s/g)??[]).length,1);check(!/<button|<form/.test(article[0]))}
    let buttons=elements(tree).filter(node=>node.type==='button')
    buttons[1].props.onClick();equal((markup().match(/data-service-id=/g)??[]).length,9)
    tree=render();buttons=elements(tree).filter(node=>node.type==='button');buttons[2].props.onClick();equal((markup().match(/data-service-id=/g)??[]).length,10)
    tree=render();elements(tree).find(node=>node.type==='input').props.onChange({target:{value:'SEO'}})
    let expected=ordering.filterByOrdering(searching.filterServices(catalog.catalogServices,locale,'SEO','all'),modes,'discuss')
    equal((markup().match(/data-service-id=/g)??[]).length,expected.length)
    tree=render();elements(tree).find(node=>node.type==='button'&&node.props.children===catalog.serviceCategories.find(item=>item.id==='career').name[locale]).props.onClick()
    html=markup();equal((html.match(/data-service-id=/g)??[]).length,0);check(html.includes(copy.serviceCopy.empty[locale]))
    tree=render();elements(tree).find(node=>node.type==='button'&&node.props.children===copy.serviceCopy.reset[locale]).props.onClick();equal((markup().match(/data-service-id=/g)??[]).length,19)
    tree=render();elements(tree).find(node=>node.type==='input').props.onChange({target:{value:'does-not-exist-zz'}});check(markup().includes(copy.serviceCopy.empty[locale]))
    controlled=false
    for(const environment of ['staging','production','local']){
      process.env.APP_ENV=environment
      for(const service of catalog.catalogServices){
        const spec=packages.findDirectPackage(service.id),body=renderToStaticMarkup(React.createElement(Detail,{locale,service})),text=decode(body),mode=modes[service.id]
        equal((body.match(/<h1[\s>]/g)??[]).length,1);equal((body.match(/<aside[\s>]/g)??[]).length,1)
        check(body.indexOf('service-intro')<body.indexOf('service-order-panel')&&body.indexOf('service-order-panel')<body.indexOf('service-content'))
        check(text.includes(catalog.servicePrice(service,locale))&&text.includes(copy.serviceCopy.illustrationNotice[locale]))
        for(const value of [...(spec?.outputs[locale]??service.outputs[locale]),...(spec?.scope[locale]??service.scope[locale]),...(spec?.exclusions[locale]??service.exclusions[locale]),...(spec?.tools[locale]??[])])check(text.includes(value))
        if(spec){check(text.includes(packages.directPackageRules.costs[locale]));check(text.includes(spec.duration[locale])&&text.includes(spec.revisions[locale]));check(text.includes(copy.serviceCopy.costSummary[locale])&&text.includes(copy.serviceCopy.costApproval[locale]))}
        const enabled=environment==='staging'&&mode!=='inquiry'
        equal((body.match(/data-service-order-form=/g)??[]).length,enabled?1:0)
        if(enabled){check(body.includes('name="service" value="'+service.id+'"'));check(body.includes('action="'+(locale==='en'?'/checkout':'/id/pemesanan')+'"'));check(body.includes('name="output"'));check(text.includes(copy.serviceCopy[mode==='compatibility'?'requestCompatibility':'reviewPackageOrder'][locale]));check(text.includes(copy.serviceCopy.reviewBeforePayment[locale]))}
        else{check(!body.includes('action="/checkout"')&&!body.includes('action="/id/pemesanan"'));check(text.includes(copy.serviceCopy.discussProject[locale]))}
        check(body.includes('href="'+catalog.serviceInquiry(service,locale).replaceAll('&','&amp;')+'"'))
        if(mode==='compatibility')check(text.includes(copy.serviceCopy.compatibilityRequired[locale]))
        check(body.includes('data-en="'+catalog.servicePath(service,'en')+'"')&&body.includes('data-id="'+catalog.servicePath(service,'id')+'"'))
      }
    }
  }
  const approval='9a8ce333-94d5-4a95-a8d8-70cce2254fca'
  search='?output=en&approval='+approval+'&service=wrong&email=not-for-links'
  let form=localeUI.ServiceOrderForm({locale:'id',serviceId:'seo-foundation',mode:'compatibility'})
  equal(elements(form).find(node=>node.type==='select').props.value,'en');equal(elements(form).find(node=>node.props?.name==='approval').props.value,approval);equal(elements(form).find(node=>node.props?.name==='service').props.value,'seo-foundation')
  let bridge=localeUI.default({locale:'id',paths:{en:'/services/seo-foundation',id:'/id/layanan/fondasi-seo'},preserveIntent:true,children:null})
  for(const locale of ['en','id']){const url=new URL(bridge.props.paths[locale],'https://example.invalid');equal(url.searchParams.get('output'),'en');equal(url.searchParams.get('approval'),approval);check(!url.searchParams.has('email')&&!url.searchParams.has('service'))}
  globalThis.window={location:{href:'https://example.invalid/id/layanan/fondasi-seo'+search},history:{state:{},replaceState:(_state,_unused,url)=>{globalThis.window.location.href=url.href;search=url.search}},dispatchEvent:()=>{}}
  elements(form).find(node=>node.type==='select').props.onChange({target:{value:'id'}})
  form=localeUI.ServiceOrderForm({locale:'en',serviceId:'seo-foundation',mode:'compatibility'});equal(elements(form).find(node=>node.type==='select').props.value,'id');equal(elements(form).find(node=>node.props?.name==='approval').props.value,approval)
  search='?output=fr&approval=not-a-uuid';form=localeUI.ServiceOrderForm({locale:'id',serviceId:'seo-foundation',mode:'compatibility'});equal(elements(form).find(node=>node.type==='select').props.value,'id');check(!elements(form).some(node=>node.props?.name==='approval'))
  bridge=localeUI.default({locale:'id',paths:{en:'/services',id:'/id/layanan'},preserveIntent:false,children:null});equal(bridge.props.paths,{en:'/services',id:'/id/layanan'})
  const css=fs.readFileSync('components/services/services.css','utf8');check(css.includes('grid-template-areas: "intro" "order" "content"'));check(css.includes('position: sticky')&&css.includes('prefers-reduced-motion'));check(!/^\s*(?:body|:root|html)\s*\{/m.test(css))
  const Shell=load('components/services/ServiceShell.tsx').default
  check(!renderToStaticMarkup(React.createElement(Shell,{locale:'en',paths:{en:'/privacy',id:'/id/kebijakan-privasi'}},'Policy')).includes('services-theme'))
  check(renderToStaticMarkup(React.createElement(Shell,{locale:'en',paths:{en:'/services',id:'/id/layanan'},light:true},'Services')).includes('services-theme'))
  console.log(`PASS ${checks} service UI checks: 9 direct / 1 compatibility / 9 inquiry, unique catalog, filters/reset/empty, all EN/ID details, unchanged scope/costs, CTA/environment gates and output/approval intent. Local SSR/mocks only; visual QA remains manual.`)
}finally{if(oldEnv===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=oldEnv;if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow}
