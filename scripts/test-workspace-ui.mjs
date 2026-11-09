import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

// Mocked session/data and static rendering only; no hosted writes, uploads, payment or email.
const native = createRequire(import.meta.url), cache = new Map()
let checks = 0, owner = false, userId = '11111111-1111-4111-8111-111111111111', workspace = null
const orderId = '22222222-2222-4222-8222-222222222222', clientId = userId, calls = []
const check = value => { assert(value); checks++ }
const equal = (a, b) => { assert.deepEqual(a, b); checks++ }
const marker = name => ({ __esModule: true, default: () => React.createElement('div', { 'data-test': name }) })
const noAction = async () => ({})
const db = {
  orders: [{ id: orderId, client_id: clientId, locale: 'en', amount_idr: 150000, payment_status: 'paid', work_status: 'draft', refund_status: 'none', created_at: '2026-10-12T00:00:00Z' }],
  order_snapshots: [{ order_id: orderId, service_name: 'Accepted consultation title', selected_package: { terms: null, client: { display_name: 'QA client' } }, policy_version_ids: [] }],
  briefs: [{ order_id: orderId, status: 'incomplete' }], policy_acceptances: [], policy_versions: [],
}
function from(table) {
  let filters = []
  const q = {
    select: () => q, eq: (key, value) => { filters.push([key, value]); return q },
    in: (key, values) => { filters.push([key, values]); return q }, order: () => q, limit: () => q,
    then: resolve => { calls.push({ table, filters }); resolve({ data: (db[table] || []).filter(row => filters.every(([key, value]) => Array.isArray(value) ? value.includes(row[key]) : row[key] === value)), error: null }) },
    single: async () => ({ data: db[table][0], error: null }), maybeSingle: async () => ({ data: db[table]?.[0] || null, error: null }),
  }
  return q
}
const context = () => ({ user: { id: userId }, client: { from }, configured: true })
function load(file) {
  let full = path.resolve(file)
  if (!path.extname(full)) full += fs.existsSync(full + '.ts') ? '.ts' : '.tsx'
  if (full.endsWith('.json')) return native(full)
  if (cache.has(full)) return cache.get(full).exports
  const loadedModule = { exports: {} }; cache.set(full, loadedModule)
  const compiled = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const require = id => {
    if (id === 'server-only' || id.endsWith('.css')) return {}
    if (id === 'next/navigation') return { useRouter: () => ({ refresh: () => {} }), notFound: () => { throw Error('404') }, redirect: () => { throw Error('redirect') } }
    if (id === '@/lib/workspace/actions') return { briefAction: noAction, reviewBriefAction: noAction, startWorkAction: noAction }
    if (id === '@/lib/workspace/server') return { readWorkspace: async (_id, asOwner) => asOwner ? owner ? workspace : null : userId === clientId ? workspace : null }
    if (id === '@/lib/commerce/server') return { commerceContext: async () => context(), ownerContext: async () => owner ? context() : null, policyBundle: () => [] }
    if (id === '@/lib/commerce/actions') return { reviewCompatibilityAction: noAction }
    if (id === '@/lib/payments/server') return { paymentReady: () => true }
    if (id === '@/lib/notifications/server') return { readConfirmationStatus: async () => 'sent' }
    if (id.includes('/PaymentPanel') || id === './PaymentPanel') return marker('payment')
    if (id.includes('/ConfirmationPanel') || id === './ConfirmationPanel') return marker('email')
    if (id === './CommerceForms') return { AcceptanceForm: () => null, OwnerOfferForm: () => null }
    if (id === './CompatibilityForm') return marker('compatibility')
    if (id === '@/components/layout/LanguageSwitcher') return marker('language')
    if (id === '@/components/ui/BrandSignature') return marker('brand')
    if (id === '@/components/layout/PublicLocaleProvider') return { PublicLocaleProvider: ({ children }) => children }
    if (id === '@/components/policies/PolicyPage') return { PolicyBlockContent: () => null }
    return id.startsWith('@/') ? load(id.slice(2)) : id.startsWith('.') ? load(path.resolve(path.dirname(full), id)) : native(id)
  }
  new Function('require', 'module', 'exports', compiled)(require, loadedModule, loadedModule.exports)
  return loadedModule.exports
}
const copy = load('data/workspace.ts'), fields = [{ id: 'accepted_input', label: 'Accepted immutable requirement', instruction: 'Original accepted instruction', required: true }]
const packages = load('data/direct-packages.ts'), terms = packages.directPackageTerms('digital-business-consultation', 'en', 'id')
terms.service_name = 'Accepted consultation title'; terms.brief_fields = fields
db.order_snapshots[0].selected_package.terms = terms
const overview = load('components/workspace/WorkspaceOverview.tsx').default
const briefComponent = load('components/workspace/BriefWorkspace.tsx').default
const detailComponent = load('components/workspace/OrderDetail.tsx').default
const pages = load('components/commerce/CommercePages.tsx')
const order = { ...db.orders[0], payment_verified: true, work_started_at: null }
const initialBrief = { status: 'incomplete', responses: { accepted_input: 'Saved answer' }, revision: 2, review_note: null }
workspace = { order, terms, fields, brief: initialBrief, files: [], history: [], client: { display_name: 'QA client', email: 'test@example.invalid' } }
for (const locale of ['en', 'id']) {
  for (const [payment, brief, work, isOwner, verified, expected] of [
    ['unpaid', 'incomplete', 'draft', false, false, 'pay'], ['pending', 'incomplete', 'draft', true, false, 'ownerPay'],
    ['paid', 'incomplete', 'draft', false, true, 'completeBrief'], ['paid', 'changes_requested', 'draft', false, true, 'amend'],
    ['paid', 'submitted', 'draft', false, true, 'waitReview'], ['paid', 'submitted', 'draft', true, true, 'review'],
    ['paid', 'approved', 'draft', false, true, 'waitStart'], ['paid', 'approved', 'draft', true, true, 'start'],
    ['paid', 'approved', 'draft', true, false, 'waitStart'], ['paid', 'approved', 'in_progress', true, true, 'inProgress'],
    ['paid', 'approved', 'completed', false, true, 'completed'], ['unpaid', 'incomplete', 'cancelled', false, false, 'cancelled'],
  ]) {
    equal(copy.workspaceNextStep(payment, brief, work, isOwner, verified), expected)
    const html = renderToStaticMarkup(React.createElement(overview, { locale, order: { ...order, payment_status: payment, work_status: work, payment_verified: verified }, briefStatus: brief, serviceName: terms.service_name, asOwner: isOwner }))
    check(html.includes(copy.workspaceText(expected, locale)))
    check((html.match(/class="[^"]*bg-red/g) || []).length <= 1)
  }
  for (const status of ['incomplete', 'changes_requested', 'submitted', 'approved']) {
    const currentBrief = { ...initialBrief, status, review_note: status === 'changes_requested' ? 'Please clarify the accepted goal.' : null }
    const html = renderToStaticMarkup(React.createElement(briefComponent, { locale, order, terms, fields, brief: currentBrief, files: [], history: [] }))
    check(html.includes('Accepted immutable requirement') && html.includes('Original accepted instruction'))
    check(html.includes('lang="en"') && html.includes('Bahasa Indonesia'))
    equal(html.includes('name="answer:accepted_input"'), ['incomplete', 'changes_requested'].includes(status))
    check(!html.includes('id="owner-start-work"') && !html.includes('id="owner-brief-review"'))
    if (status === 'changes_requested') {
      const detail = renderToStaticMarkup(React.createElement(detailComponent, { locale, workspace: { ...workspace, brief: currentBrief }, asOwner: false, payment: null, email: null }))
      check(detail.includes('Please clarify the accepted goal.') && detail.indexOf('Please clarify the accepted goal.') < detail.indexOf('<details'))
    }
  }
  const unpaid = renderToStaticMarkup(React.createElement(briefComponent, { locale, order: { ...order, payment_status: 'pending' }, terms, fields, brief: initialBrief, files: [], history: [] }))
  check(!unpaid.includes('name="answer:') && !unpaid.includes('type="file"'))
  const started = renderToStaticMarkup(React.createElement(briefComponent, { locale, order: { ...order, work_started_at: '2026-10-12T01:00:00Z', work_status: 'in_progress' }, terms, fields, brief: initialBrief, files: [], history: [] }))
  check(!started.includes('name="answer:') && !started.includes('type="file"'))
  for (const [status, verified, showReview, showStart] of [['submitted', true, true, false], ['approved', true, false, true], ['approved', false, false, false], ['incomplete', true, false, false]]) {
    const html = renderToStaticMarkup(React.createElement(briefComponent, { locale, order: { ...order, payment_verified: verified }, terms, fields, brief: { ...initialBrief, status }, files: [], history: [], asOwner: true }))
    equal(html.includes('id="owner-brief-review"'), showReview); equal(html.includes('id="owner-start-work"'), showStart)
    check(!html.includes('name="answer:') && !html.includes('type="file"'))
  }
  const attachment = renderToStaticMarkup(React.createElement(briefComponent, { locale, order, terms, fields, brief: initialBrief, files: [
    { id: 'ready', original_filename: 'ready.pdf', size_bytes: 20, mime_type: 'application/pdf', status: 'ready' },
    { id: 'pending', original_filename: 'pending.pdf', size_bytes: 20, mime_type: 'application/pdf', status: 'pending' },
    { id: 'quarantined', original_filename: 'invalid.pdf', size_bytes: 20, mime_type: 'application/pdf', status: 'quarantined' },
  ], history: [] }))
  equal((attachment.match(new RegExp('>' + copy.workspaceText('download', locale) + '<', 'g')) || []).length, 1)
  check(attachment.includes(copy.workspaceText('filePending', locale)) && attachment.includes(copy.workspaceText('fileQuarantined', locale)))
  owner = false; userId = clientId
  const detail = renderToStaticMarkup(await pages.OrdersPage({ locale, id: orderId }))
  check(detail.includes('Accepted consultation title') && detail.includes('data-test="payment"') && detail.includes('data-test="email"'))
  check(detail.includes('id="order-payment"') && detail.includes('id="order-brief"'))
  const listing = renderToStaticMarkup(await pages.OrdersPage({ locale }))
  check(listing.includes('Accepted consultation title') && listing.includes(locale === 'en' ? '/orders/' + orderId : '/id/pesanan/' + orderId))
  owner = true
  const ownerDetail = renderToStaticMarkup(await pages.OrdersPage({ locale, id: orderId, asOwner: true }))
  check(ownerDetail.includes('QA client') && !ownerDetail.includes('data-test="payment"'))
  const ownerListing = renderToStaticMarkup(await pages.OrdersPage({ locale, asOwner: true }))
  check(ownerListing.includes(locale === 'en' ? '/owner/orders/' + orderId : '/id/pemilik/pesanan/' + orderId))
  owner = false
  await assert.rejects(() => pages.OrdersPage({ locale, id: orderId, asOwner: true }), /404/); checks++
  userId = '33333333-3333-4333-8333-333333333333'
  await assert.rejects(() => pages.OrdersPage({ locale, id: orderId }), /404/); checks++
  userId = clientId
}
check(calls.filter(call => call.table === 'orders').some(call => call.filters.some(([key, value]) => key === 'client_id' && value === clientId)))
const uploadSource = fs.readFileSync('components/workspace/AttachmentPanel.tsx', 'utf8')
check(uploadSource.includes('uploadToSignedUrl') && uploadSource.includes('upsert: false'))
check(!uploadSource.includes('console.') && !uploadSource.includes('service_role'))
console.log(`PASS ${checks} workspace UI / navigation checks (mocked data, no hosted calls)`)
