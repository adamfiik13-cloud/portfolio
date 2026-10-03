import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import ts from 'typescript'

// Load only repository TS/data modules; no browser, Google or provider network.
const root = process.cwd(), nativeRequire = createRequire(import.meta.url), cache = new Map()
function load(file) {
  let resolved = path.resolve(root, file)
  if (!path.extname(resolved)) resolved += '.ts'
  if (cache.has(resolved)) return cache.get(resolved).exports
  if (resolved.endsWith('.json')) return JSON.parse(fs.readFileSync(resolved, 'utf8'))
  const compiled = { exports: {} }; cache.set(resolved, compiled)
  const code = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
  const require = id => id.startsWith('@/') ? load(id.slice(2)) : id.startsWith('.') ? load(path.resolve(path.dirname(resolved), id)) : nativeRequire(id)
  new Function('require', 'module', 'exports', code)(require, compiled, compiled.exports)
  return compiled.exports
}
const rules = load('lib/analytics/rules.ts')
const { createAnalyticsController } = load('lib/analytics/controller.ts')
const { analyticsPages, analyticsCopy } = load('data/analytics.ts')
const { getPolicyMetadata, policyDefinitions } = load('data/policies/config.ts')
const { policiesEn } = load('data/policies/en.ts'), { policiesId } = load('data/policies/id.ts')
const { CONSENT_KEY, parseConsent, readConsent, saveConsent, publicPage, normalizePath, excludedRoute, gaCookieNames } = rules
let assertions = 0
function check(value) { assert(value); assertions++ }
const store = new Map(), storage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) }
check(readConsent(storage) === null)
for (const invalid of ['', 'true', 'yes', '{}', 'GRANTED', null, undefined]) check(parseConsent(invalid) === null)
for (const value of ['granted', 'denied', 'granted']) { check(saveConsent(storage, value)); check(readConsent(storage) === value) }
assert.deepEqual([...store], [[CONSENT_KEY, 'granted']])
check(readConsent({ getItem() { throw Error('blocked') } }) === null)
check(!saveConsent({ setItem() { throw Error('blocked') } }, 'granted'))
for (const host of ['localhost', '127.0.0.1', 'example.vercel.app', 'adamswork.app.attacker.invalid', 'www.adamswork.app', 'ADAMSWORK.APP', '']) check(!rules.gtmHost(host))
for (const host of ['adamswork.app', 'staging.adamswork.app']) check(rules.gtmHost(host))
for (const id of [undefined, '', 'G-TEST123', 'GTM-test', 'GTM-ABC<script>', ' GTM-TEST123 ']) check(!rules.validGtmId(id))
check(rules.validGtmId('GTM-TEST123'))
check(normalizePath('/services/?token=secret#private') === '/services')
for (const invalid of ['https://adamswork.app/', '//other.invalid/', '/services/%40email', '/services/../account']) check(normalizePath(invalid) === '')
const privateRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/account', '/auth/confirm', '/id/masuk', '/id/daftar', '/id/lupa-password', '/id/atur-ulang-password', '/id/akun', '/id/auth/konfirmasi']
for (const route of privateRoutes) { check(excludedRoute(route + '?token=sensitive#email')); check(!publicPage(route, analyticsPages)); check(!publicPage(route + '/child', analyticsPages)) }
for (const route of ['/api/health', '/unknown', '/services/private-client-name']) check(!publicPage(route, analyticsPages))
assert.deepEqual(Object.keys(publicPage('/?email=private#password', analyticsPages)).sort(), ['content_category', 'content_type', 'locale', 'page_path', 'page_title'])
function fixture(overrides = {}) {
  const calls = []
  const controller = createAnalyticsController({ hostname: 'adamswork.app', gtmId: 'GTM-TEST123', productionEnabled: true, pages: analyticsPages,
    consent: (command, value) => calls.push(['consent', command, value]), load: id => calls.push(['load', id]), push: event => calls.push(['event', event]), clearCookies: () => calls.push(['clear']), reload: () => calls.push(['reload']), ...overrides })
  return { controller, calls }
}
const f = fixture()
f.controller.sync('/', null); f.controller.sync('/', 'denied'); check(f.calls.length === 0)
f.controller.sync('/?token=secret#message', 'granted')
assert.deepEqual(f.calls.slice(0, 3), [['consent', 'default', 'denied'], ['consent', 'update', 'granted'], ['load', 'GTM-TEST123']])
f.controller.sync('/', 'granted'); f.controller.sync('/?other=value', 'granted'); check(f.calls.filter(call => call[0] === 'event').length === 1)
f.controller.sync('/services', 'granted'); f.controller.sync('/', 'granted'); check(f.calls.filter(call => call[0] === 'event').length === 3)
check(f.calls.filter(call => call[0] === 'load').length === 1)
for (const [, event] of f.calls.filter(call => call[0] === 'event')) {
  assert.deepEqual(Object.keys(event).sort(), ['content_category', 'content_type', 'event', 'locale', 'page_path', 'page_title'])
  check(!JSON.stringify(event).includes('secret')); check(!/[?#@]/.test(event.page_path)); check(event.event === 'public_page_view')
}
f.controller.sync('/', 'denied')
assert.deepEqual(f.calls.slice(-3), [['consent', 'update', 'denied'], ['clear'], ['reload']])
const previous = f.calls.length; f.controller.sync('/services', 'granted'); check(f.calls.length === previous)
// A new public document restores the saved choice; private documents never load.
const returned = fixture(); returned.controller.sync('/', readConsent(storage)); check(returned.controller.isLoaded())
for (const route of privateRoutes) {
  const privateDoc = fixture(); privateDoc.controller.sync(route, 'granted'); check(privateDoc.calls.length === 0)
  const navigation = fixture(); navigation.controller.sync('/', 'granted'); navigation.controller.sync(route, 'granted')
  assert.deepEqual(navigation.calls.slice(-3), [['consent', 'update', 'denied'], ['clear'], ['reload']])
  check(navigation.calls.filter(call => call[0] === 'event').length === 1)
}
for (const options of [{ hostname: 'localhost' }, { hostname: 'preview.vercel.app' }, { gtmId: undefined }, { gtmId: 'bad' }]) {
  const gated = fixture(options); gated.controller.sync('/', 'granted'); check(gated.calls.length === 0)
}
for (const options of [{ hostname: 'staging.adamswork.app' }, { hostname: 'adamswork.app', productionEnabled: false }]) {
  const staging = fixture(options); staging.controller.sync('/', 'granted'); staging.controller.sync('/id', 'granted')
  check(staging.calls.filter(call => call[0] === 'load').length === 1)
  check(staging.calls.filter(call => call[0] === 'event').length === 0)
  check(!staging.calls.some(call => call[0] === 'consent' && call[2] === 'granted'))
}
assert.deepEqual(gaCookieNames('_ga=1; _ga_TEST=2; sb-auth=3; _gid=4; _gads=5; session=6; _ga_bad-name=7'), ['_ga', '_ga_TEST'])

// Exercise the real browser adapter with an inert DOM: load order, consent commands,
// singleton, delegated private navigation, history boundary and cookie preservation.
const listeners = new Map(), cookies = new Map([['_ga', '1'], ['_ga_TEST', '2'], ['sb-auth', 'session']]), scripts = []
const fakeLocation = { hostname: 'adamswork.app', pathname: '/', origin: 'https://adamswork.app', href: 'https://adamswork.app/', reloads: 0, destination: '', reload() { this.reloads++ }, assign(url) { this.destination = url } }
globalThis.location = fakeLocation
globalThis.window = { addEventListener: (name, fn) => listeners.set('window:' + name, fn) }
globalThis.history = { pushState: (_data, _unused, url) => { fakeLocation.pathname = new URL(url, fakeLocation.href).pathname }, replaceState: (_data, _unused, url) => { fakeLocation.pathname = new URL(url, fakeLocation.href).pathname } }
globalThis.document = { getElementById: id => scripts.find(script => script.id === id), createElement: () => ({}), head: { appendChild: script => scripts.push(script) }, addEventListener: (name, fn) => listeners.set('document:' + name, fn) }
Object.defineProperty(document, 'cookie', { get: () => [...cookies].map(([name, value]) => name + '=' + value).join('; '), set: value => { if (value.includes('Max-Age=0')) cookies.delete(value.split('=')[0]) } })
class FakeElement { closest() { return this } }
class FakeAnchor extends FakeElement { constructor(href) { super(); this.href = href; this.target = '' } }
globalThis.Element = FakeElement; globalThis.HTMLAnchorElement = FakeAnchor
const priorId = process.env.NEXT_PUBLIC_GTM_ID
process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST123'
const { browserAnalytics } = load('lib/analytics/browser.ts')
const browser = browserAnalytics(true); browser.sync('/', null); check(scripts.length === 0)
browser.sync('/', 'granted'); browser.sync('/', 'granted'); check(scripts.length === 1)
check(browserAnalytics(true) === browser)
check(scripts[0].referrerPolicy === 'no-referrer')
const commands = window.dataLayer.filter(item => item[0] === 'consent')
check(commands[0][1] === 'default' && commands[0][2].analytics_storage === 'denied')
for (const command of commands) for (const field of ['ad_storage', 'ad_user_data', 'ad_personalization']) check(command[2][field] === 'denied')
history.pushState({}, '', '/account?token=sensitive'); check(fakeLocation.pathname === '/'); check(fakeLocation.destination.endsWith('/account?token=sensitive'))
history.replaceState({}, '', '/services'); check(fakeLocation.pathname === '/services')
let stopped = false, prevented = false
listeners.get('document:click')({ target: new FakeAnchor('https://adamswork.app/login'), button: 0, stopImmediatePropagation() { stopped = true }, preventDefault() { prevented = true } })
check(stopped && prevented); check(fakeLocation.destination === 'https://adamswork.app/login')
browser.sync('/services', 'denied'); check(fakeLocation.reloads === 1)
assert.deepEqual([...cookies], [['sb-auth', 'session']])
if (priorId === undefined) delete process.env.NEXT_PUBLIC_GTM_ID; else process.env.NEXT_PUBLIC_GTM_ID = priorId
for (const name of ['window', 'document', 'location', 'history', 'Element', 'HTMLAnchorElement']) delete globalThis[name]

// Policy versioning, equivalent clause structure and unchanged non-privacy content.
const before = execFileSync('git', ['-c', 'safe.directory=' + root.replaceAll('\\', '/'), 'show', '994369dd6e964e807f08a774db75b70a517adf95:data/policies/en.ts'], { encoding: 'utf8' })
const beforeEn = JSON.parse(before.slice(before.indexOf('= {') + 2).trim())
const beforeIdSource = execFileSync('git', ['-c', 'safe.directory=' + root.replaceAll('\\', '/'), 'show', '994369dd6e964e807f08a774db75b70a517adf95:data/policies/id.ts'], { encoding: 'utf8' })
const beforeId = JSON.parse(beforeIdSource.slice(beforeIdSource.indexOf('= {') + 2).trim())
for (const policy of policyDefinitions) {
  const metadata = getPolicyMetadata(policy.id)
  check(metadata.status === 'active')
  check(metadata.version === (policy.id === 'privacy' ? '1.1' : '1.0'))
  check(metadata.effectiveDate === (policy.id === 'privacy' ? '2026-10-04' : '2026-09-28'))
  const en = policiesEn[policy.id], id = policiesId[policy.id]
  assert.deepEqual(en.sections.map(section => section.id), id.sections.map(section => section.id))
  assert.deepEqual(en.sections.map(section => section.blocks.map(block => block.type)), id.sections.map(section => section.blocks.map(block => block.type)))
  if (policy.id !== 'privacy') { assert.deepEqual(en, beforeEn[policy.id]); assert.deepEqual(id, beforeId[policy.id]) }
}
for (const locale of ['en', 'id']) {
  const clause = (locale === 'en' ? policiesEn : policiesId).privacy.sections.find(section => section.id === 'privacy-8')
  check(clause.blocks.some(block => block.type === 'link' && block.href.startsWith('https://policies.google.com/privacy')))
  check(JSON.stringify(clause).includes(CONSENT_KEY)); check(JSON.stringify(clause).includes('Google Analytics 4'))
  check(analyticsCopy.accept[locale].length > 0 && analyticsCopy.reject[locale].length > 0)
}
const ui = fs.readFileSync('components/analytics/AnalyticsConsent.tsx', 'utf8'), footer = fs.readFileSync('components/layout/Footer.tsx', 'utf8')
check(ui.includes('COOKIE_SETTINGS_EVENT') && footer.includes('COOKIE_SETTINGS_EVENT'))
check(ui.includes('panel.current?.focus()') && ui.includes('returnFocus.current?.focus()'))
check(ui.includes('onClick={() => select("granted")}') && ui.includes('onClick={() => select("denied")}'))
const { STAGING_ANALYTICS_CSP } = load('lib/analytics/staging-csp.ts')
for (const host of ['google-analytics.com', 'analytics.google.com', 'doubleclick.net', 'googleadservices.com']) check(!STAGING_ANALYTICS_CSP.includes(host))
check(!STAGING_ANALYTICS_CSP.includes('unsafe-'))
const seo = load('lib/public-metadata.ts'), sitemap = load('app/sitemap.ts').default, robots = load('app/robots.ts').default
const savedEnv = process.env.APP_ENV, savedVercel = process.env.VERCEL_ENV
delete process.env.APP_ENV; delete process.env.VERCEL_ENV
for (const locale of ['en', 'id']) {
  const meta = seo.getPublicMetadata(locale)
  check(meta.robots.index && meta.robots.follow)
  check(meta.alternates.canonical === 'https://adamswork.app' + (locale === 'en' ? '/' : '/id'))
  check(meta.alternates.languages['x-default'] === 'https://adamswork.app/')
}
const urls = sitemap().map(entry => entry.url)
for (const policy of policyDefinitions) for (const locale of ['en', 'id']) check(urls.includes('https://adamswork.app' + policy.paths[locale]))
check(urls.includes('https://adamswork.app/') && urls.includes('https://adamswork.app/id'))
check(robots().sitemap === 'https://adamswork.app/sitemap.xml')
process.env.APP_ENV = 'staging'
check(sitemap().length === 0); check(!robots().sitemap)
for (const locale of ['en', 'id']) { const meta = seo.getPublicMetadata(locale); check(!meta.robots.index && !meta.robots.follow) }
if (savedEnv === undefined) delete process.env.APP_ENV; else process.env.APP_ENV = savedEnv
if (savedVercel === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = savedVercel
console.log(`Analytics/policy/SEO: ${assertions} checks plus structural equality assertions passed; no network calls.`)
