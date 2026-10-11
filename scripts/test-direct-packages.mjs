import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

// Pure content and SSR navigation checks; no network, real accounts, email or payments.
const native = createRequire(import.meta.url), cache = new Map()
let checks = 0
const check = value => { assert(value); checks++ }
const equal = (a, b) => { assert.deepEqual(a, b); checks++ }
function load(file) {
  let full = path.resolve(file)
  if (!path.extname(full)) full += fs.existsSync(full + '.ts') ? '.ts' : '.tsx'
  if (full.endsWith('.json')) return native(full)
  if (cache.has(full)) return cache.get(full).exports
  const loaded = { exports: {} }; cache.set(full, loaded)
  const compiled = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const require = id => id === '@/components/ui/Button' ? { __esModule: true, default: ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children) } : id.startsWith('@/') ? load(id.slice(2)) : id.startsWith('.') ? load(path.resolve(path.dirname(full), id)) : native(id)
  new Function('require', 'module', 'exports', compiled)(require, loaded, loaded.exports)
  return loaded.exports
}
const packages = load('data/direct-packages.ts'), catalog = load('data/service-catalog.ts'), rules = load('lib/commerce/rules.ts')
const detail = load('components/services/DirectPackageDetail.tsx').default
const account = load('components/layout/HeaderAccountLink.tsx')
const expected = {
  'digital-business-consultation': 150000, 'marketing-marketplace-audit': 200000, 'tracking-basic': 450000,
  'business-website': 2750000, 'seo-audit-roadmap': 500000, 'seo-foundation': 950000, 'ads-tracking': 650000,
  'career-consultation': 100000, 'cv-review': 75000, 'cv-rewrite-optimization': 150000,
}
equal(packages.directPackages.length, 10)
equal([...packages.directPackages.map(p => p.serviceId)].sort(), Object.keys(expected).sort())
const previousEnv = process.env.APP_ENV
process.env.APP_ENV = 'staging'
try {
  for (const spec of packages.directPackages) {
    const service = catalog.catalogServices.find(s => s.id === spec.serviceId)
    equal(service.price.amount, expected[spec.serviceId])
    equal(new Set(spec.briefFields.map(f => f.id)).size, spec.briefFields.length)
    for (const locale of ['en', 'id']) {
      check(spec.scope[locale].length && spec.outputs[locale].length && spec.tools[locale].length)
      check(spec.briefFields.every(f => f.label[locale] && f.instruction[locale] && typeof f.required === 'boolean'))
      for (const output of ['en', 'id']) {
        const terms = packages.directPackageTerms(spec.serviceId, locale, output)
        check(rules.validTerms(terms))
        equal(terms.amount_idr, expected[spec.serviceId])
        equal(terms.output_language, output)
        equal(terms.specification_version, 'phase5-2026-10-11')
        equal(terms.milestones.length, 1)
        equal(terms.milestones[0].amount_idr, terms.amount_idr)
        equal(terms.brief_fields.map(f => f.id), spec.briefFields.map(f => f.id))
        check(terms.cost_disclosure.includes('PPN') && terms.cost_disclosure.includes('Faktur Pajak'))
        check(terms.requirements.some(r => r.includes('API key') || r.includes('API keys')))
      }
      const html = renderToStaticMarkup(React.createElement(detail, { locale, service, spec }))
      check(html.includes('name="service" value="' + service.id + '"'))
      check(html.includes(locale === 'en' ? 'action="/checkout"' : 'action="/id/pemesanan"'))
      check(html.includes('name="output"') && html.includes('value="en"') && html.includes('value="id"'))
      check(html.includes(locale === 'en' ? 'Illustrative output structure' : 'Ilustrasi struktur hasil'))
      check(html.includes(locale === 'en' ? 'Midtrans Sandbox' : 'Midtrans Sandbox'))
      check(!html.includes('/upload') && !html.includes('testimony'))
    }
  }
  for (const service of catalog.catalogServices.filter(s => !Object.hasOwn(expected, s.id))) equal(packages.directPackageTerms(service.id, 'en', 'en'), null)
  equal(packages.directPackageTerms('business-website', 'en', 'fr'), null)
  equal(packages.directPackageTerms('business-website', 'fr', 'en'), null)
  equal(packages.findDirectPackage('seo-foundation').compatibilityApproval, true)
  equal(packages.directPackages.filter(p => p.compatibilityApproval).length, 1)
  check(packages.findDirectPackage('business-website').scope.en.some(s => s.includes('WordPress') && s.includes('five')))
  check(packages.findDirectPackage('ads-tracking').scope.en.some(s => s.includes('OR') && s.includes('not both')))
  check(packages.findDirectPackage('career-consultation').exclusions.en.some(s => s.includes('Written reports')))
  for (const locale of ['en', 'id']) {
    equal(account.headerAccountDestination(locale, true), locale === 'en' ? '/orders' : '/id/pesanan')
    equal(account.headerAccountDestination(locale, false), locale === 'en' ? '/login' : '/id/masuk')
    const html = renderToStaticMarkup(React.createElement(account.default, { locale, expanded: true }))
    check(html.includes(locale === 'en' ? 'href="/login"' : 'href="/id/masuk"'))
    check(html.includes(locale === 'en' ? '>Login<' : '>Masuk<'))
    check(!html.includes('/owner') && html.includes('min-h-11'))
  }
  const navbar = fs.readFileSync('components/layout/Navbar.tsx', 'utf8')
  check(navbar.includes('HeaderAccountLink locale={locale}') && navbar.includes('expanded onNavigate'))
  check(navbar.includes('href={link.href}'))
  console.log(`PASS ${checks} direct-package and public-navigation checks (no hosted calls)`)
} finally {
  if (previousEnv === undefined) delete process.env.APP_ENV
  else process.env.APP_ENV = previousEnv
}
