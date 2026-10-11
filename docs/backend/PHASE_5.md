# Phase 5 — Midtrans Sandbox on staging

Implementation baseline: Phase 4 QA closeout `558c3a3fe149f569da693b1d3a11ade97800ceb3`. Sandbox only; production registration/payments remain unapproved. No hosted migration, provider configuration, payment or existing QA-record mutation is performed by this implementation.

## Implementation

- Shared EN/ID order detail adds a clearly labeled Sandbox payment popup and server-side status check. Snap.js loads only after an owning client's payment action returns a usable token. Browser callbacks are informational; they never write payment state.
- Readiness requires `APP_ENV=staging`, non-Production Vercel execution, `MIDTRANS_ENVIRONMENT=sandbox`, the existing merchant/client/server keys, service-role configuration and the exact isolated staging Supabase project. No duplicate `NEXT_PUBLIC` variables. Only the Client Key is returned where Snap.js needs it; the Server Key remains server-only.
- Credentials are opaque, nonempty strings without whitespace or control/format characters. Their original values are used unchanged: no trimming, added prefix or prefix-based environment/authentication inference. Example prefixes in the [official authorization reference](https://docs.midtrans.com/reference/authorization) and [API authorization headers guide](https://docs.midtrans.com/docs/api-authorization-headers) are not credential validation rules. Environment guards and fixed Sandbox API/Snap.js hosts remain authoritative for routing; the configuration gate alone does not prove credential authentication. Limited hosted payment evidence is recorded separately below.
- Next Server Actions verify the authenticated, email-verified client and RLS-scoped order ownership. Origin checks provided by Next.js protect these cookie-authenticated mutations. SQL rechecks the owning client, eligible order, immutable amount/snapshot and four retained acceptances. No browser amount, new order or new agreement participates in payment retries.
- `payments_reserve` serializes on the order row, numbers attempts and creates a unique `aw-sbx-UUID` reference before contacting Midtrans. One requester receives the creation claim. A partial unique index permits one active attempt per order. A usable attempt is reconciled and resumed; replacement requires a freshly reconciled terminal attempt and its exact ID under the same lock.
- Creation timeout, rejection, malformed response or token-save failure remains `creating`/`uncertain`. No automatic repeat creation request or replacement follows. GET Status 404 before method selection is not failure. If creation succeeded but the token could not be retained, or a token expires without a Core status, the attempt stays blocked for operator review; this phase does not implement automatic token recovery, cancellation or abandonment cleanup. Do not manually release it without checking provider state/payability.
- `payments_token` stores the Snap capability on the private payment record. Authenticated column grants exclude `snap_token`, including owner browser sessions; existing row-level read boundaries remain. No token, signature, credential, customer detail or raw provider payload is logged or stored in webhook events/Sentry. Events retain only a digest of normalized verified fields.
- Notification endpoint: **`https://staging.adamswork.app/api/payments/midtrans/notification`**. Public POST JSON, no session/custom authorization header; it is outside the private Proxy matcher. It verifies SHA-512 signature in constant time, then retrieves authoritative status with server credentials. Reference, merchant, IDR currency, exact stored amount and transaction ID must match before SQL mutation. A known transaction ID is preferred for BI SNAP/DANA status lookup; a signed notification can supply the initial ID, still subject to all response-binding checks.
- Provider requests use fixed Sandbox hosts, no redirects/cache, 8-second timeouts and bounded 64-KiB JSON responses. Incoming notification JSON is also limited to 64 KiB with an 8-second stream deadline. Invalid payload/signature/binding returns 400; readiness, unknown provider outcome and transient failures return 503 so delivery can be retried. Success/duplicates return 200. No dashboard is accessed by the agent.
- `payments_apply` locks order then attempt; validates required fields, merchant/amount/currency/transaction identity and state mapping again; atomically records a deduplicated normalized event, payment state, order status history and audit event. Verified payment cannot regress to pending/failure; refund amounts only increase. An older attempt cannot overwrite the latest pending attempt or a paid order. Unknown statuses fail closed for review.
- Only `/orders/:id` and `/id/pesanan/:id` get Sandbox CSP connect/frame allowances. The Snap iframe owns its internal cross-origin resources. The staging GA4 collection block remains; public CSP is unchanged. Private analytics exclusions remain intact. Production execution is disabled even if payment keys are accidentally present.

## State mapping

| Authoritative Midtrans status | Payment record / order payment | Refund / work |
| --- | --- | --- |
| `settlement` (fraud absent/accept), `capture` + fraud accept | `verified` / `paid` | No work start |
| `pending`, `capture` + fraud challenge/absent | `pending` / `pending` | Not verified |
| `deny`, `failure`, `capture` + fraud deny | `failed` / `failed` | No work start |
| `expire` | `expired` / `expired` | No work start |
| `cancel` | `cancelled` / `cancelled` | No work start |
| `partial_refund` with valid cumulative refund amount | Retain verified/paid | Refund `partial`, monotonic |
| `refund` | Retain verified/paid | Refund `refunded`, monotonic |
| Unknown, authorization-only or unsupported chargeback statuses | Reject without state mutation | Operator review |

Payment alone does not change work/brief state. Existing SQL guards still require verified payment **and** an admin-approved complete brief before work can start. Refund reconciliation records provider-reported outcomes only; it never initiates a refund or creates a refund-request workflow. Duplicate/older notifications do not undo paid/refunded evidence. All 19 incomplete catalog packages remain disabled; custom offers need complete approved bilingual terms. Payment remains 100% upfront; milestones are work allocations, not installments.

## Operator application — staging only

Historical application procedure: the operator reports this migration is now applied and all five Local/Remote versions match (see the dated hosted QA record below). Do not rerun the migration or migration repair for this checkpoint.

1. Use the reviewed `staging` checkout. Confirm the Supabase dashboard reference and existing `supabase/.temp/project-ref` are the approved **staging** project, distinct from Production. Do not expose keys/passwords. Take the normal staging SQL backup and retain the existing accepted offer/order/contract/acceptances. Run `npx supabase migration list --linked`: four prior versions must match, and `20261006000100` must be local-only. If the target/history differs or objects already exist, stop; never reapply an applied migration.
2. In that same staging project's SQL Editor, apply the entire reviewed `supabase/migrations/20261006000100_midtrans_sandbox.sql` once, including `BEGIN`/`COMMIT`. No build runs SQL. The migration is additive and does not rewrite existing transactions.
3. After success, verify with read-only SQL; all columns must be true:

   ```sql
   select
     exists(select 1 from information_schema.columns where table_schema='public' and table_name='payment_records' and column_name='snap_token') as token_column,
     exists(select 1 from pg_indexes where schemaname='public' and indexname='sandbox_active_attempt') as active_attempt_index,
     exists(select 1 from pg_indexes where schemaname='public' and indexname='sandbox_attempt_number') as attempt_number_index,
     not has_column_privilege('authenticated','public.payment_records','snap_token','SELECT') as browser_token_denied,
     has_function_privilege('service_role','public.payments_reserve(uuid,uuid,text,uuid)','EXECUTE') as reserve_server_allowed,
     not has_function_privilege('authenticated','public.payments_reserve(uuid,uuid,text,uuid)','EXECUTE') as reserve_browser_denied,
     not has_function_privilege('anon','public.payments_apply(text,text,bigint,text,text,text,text,bigint,text)','EXECUTE') as anonymous_apply_denied,
     has_function_privilege('service_role','public.payments_apply(text,text,bigint,text,text,text,text,bigint,text)','EXECUTE') as apply_server_allowed;
   ```

4. Only after successful application/verification, recheck the unchanged staging CLI link, then run `npx supabase migration repair 20261006000100 --status applied --linked` followed by `npx supabase migration list --linked`. All **five** Local/Remote versions must match. If recording fails, stop and resolve history; do not rerun schema SQL or substitute a text ledger.
5. In the **Midtrans Sandbox** dashboard only, configure Settings → Configuration → Payment Notification URL to `https://staging.adamswork.app/api/payments/midtrans/notification`, save and confirm delivery can reach it without login, authorization headers or redirects. Do not configure recurring/production payments. No new variable is needed beyond the four already saved in Vercel custom staging. Do not share their values in chat. Builds/deployment Ready do not prove provider delivery.

## Manual hosted payment QA checkpoint

- As Client A, open the existing accepted Phase 4 order. Confirm unchanged 2000000 IDR / English contract, original snapshot and four acceptances. Confirm both EN/ID interfaces and Sandbox label. Initiation/resume must not create a new order, contract or policy acceptance.
- As Client B (and a non-owning owner/team account), direct initiation/status check must fail; no payment token or transaction is exposed. Before method selection, status-not-found must not permit a second payable attempt.
- Use only official Sandbox simulators/test credentials. Open Snap, choose a method, exercise pending → settlement/approved capture, and verify notification delivery plus authorized Check payment status. Browser success alone is not PASS. Compare merchant/reference/currency/full amount and database payment/history/audit evidence.
- Exercise duplicate requests/notifications and competing initiation/status requests. Confirm one active attempt, reused token where usable, deduplicated events and no paid → pending regression. Check a timeout/uncertain response with the operator rather than manually resetting/deleting an attempt. Do not treat local tests as proof of hosted delivery/concurrency.
- Confirm paid + brief incomplete leaves work `draft` and `work_started_at` NULL. No brief submission/approval UI or work countdown is introduced here. Inspect EN/ID status, mobile keyboard/focus, private noindex/no-store and absence of analytics. Snap resource/CSP behavior requires hosted browser QA.
- Test terminal failure/expiry/cancellation before a replacement, fraud review not paid, and refund-related status reconciliation if available in Sandbox; do not execute real refunds or initiate a refund through this app. Unsupported statuses need operator review. Hosted refund/payment-method-specific coverage remains pending until explicitly reported.

## Automated evidence and limits

Reported initial local validation: lint, type-check and fresh production build PASS; **143 payment checks**, **179 commerce checks**, **42 backend migration/RLS/storage checks**, plus backend health/isolation/Sentry checks PASS. The final rules/workflow/server source maps match the built source. A local SQL regex-length validation error was corrected in the then-new, unapplied migration before passing DB tests. No already-applied migration was edited. These results did not prove hosted payment QA; the later operator-reported evidence is recorded separately below.

Limited configuration correction after baseline `0ab68310a7b6c630db942b350ad23e131598704c`: the operator reports Sandbox keys without an `SB-` prefix; the previous mandatory prefix check would reject that reported format. Focused regression now covers opaque and example-prefix credentials, unchanged values, missing/empty/whitespace/control rejection and unchanged staging/isolation guards. Correction validation: **188 focused payment checks**, lint, type-check and production build PASS. POST JSON `{}` without credentials/signature should return **400** after configuration readiness passes, before any database query or provider request. This probe does not authenticate either key with Midtrans and does not prove database/payment readiness. If it still returns 503, another configuration gate may be failing; do not infer that prefix was the only cause or apply the migration to fix a configuration gate.

Subsequent read-only Snap diagnosis at baseline `8d0d7e32cb76895c74a8eb3577638c0392878003`: local targeted tests showed that string `status_code: "404"` resumes the saved token without creating another transaction; empty-body 404 and numeric status-code cases fail. Eight EN/ID PaymentPanel mock checks covered successful opening, action-unavailable, loader-error and `snap.pay`-error paths. These tests did not reproduce the hosted incident or establish its root cause. The investigation changed no files and created no commit/deployment; runtime suites were not rerun.

Run `node scripts/test-payments.mjs`, `node scripts/test-commerce.mjs`, and `npm run test:backend` alongside lint/type-check/build after final changes. Tests use disposable local PostgreSQL and mocked provider transport, not the hosted database/merchant. PGlite has one connection: competing requests verify reservation/idempotence paths and uniqueness locally, not real hosted multi-connection races. Provider delivery, real Snap popup resources, hosted timeouts/permissions and Sandbox refund lifecycles require the operator checks above. No production or Phase 6 rollout is authorized.

Official references checked for this implementation: [Snap integration](https://docs.midtrans.com/docs/snap-snap-integration-guide), [Snap.js popup](https://docs.midtrans.com/reference/snap-js), [notification authenticity, retries and Snap status-not-found](https://docs.midtrans.com/docs/https-notification-webhooks), [Get Status API / transaction IDs / refund fields](https://docs.midtrans.com/reference/get-transaction-status), [Supabase migration history repair](https://supabase.com/docs/guides/deployment/database-migrations).

## Manual operator-reported hosted staging QA — 6 Oktober 2026 WITA

Implementation baseline: `8d0d7e32cb76895c74a8eb3577638c0392878003`. The evidence in this section was reported by the operator, not independently executed or verified by Codex. It is separate from the automated/local tests above. This checkpoint update changes documentation only; it does not rerun runtime validation or mutate hosted records/configuration.

### Configuration and migration

- Configuration gate passed after the opaque-credential validation correction. Gate readiness alone is not proof of provider authentication.
- Pre-Phase 5 backup and encrypted archive integrity test: PASS.
- Migration `20261006000100` applied through the staging SQL Editor. All eight verification predicates were true; all five Local/Remote migration versions matched.
- Sandbox notification URL was saved and reachable: `https://staging.adamswork.app/api/payments/midtrans/notification`.

### First payment and replay protection

- Order: `c3e50d58-768f-409c-aea9-7216bc574fb7`; reference: `aw-sbx-633fe97f-0619-435d-afac-619322269e39`.
- BCA Pending → simulator settlement → website Paid without pressing **Check payment status**. Notification: Success, HTTP 200.
- Operator SQL evidence: payment `verified`, amount `2000000 IDR`, `verified_at = 2026-10-06 07:52:17.561721+00`; one payment record, one snapshot, four policy acceptances, one incomplete brief and two recorded events. Work remained `draft`, with `work_started_at = NULL`.
- Identical settlement replay and an older Pending replay after Paid both returned HTTP 200. Status, record/event counts and `verified_at` were unchanged. **Check payment status** after Paid succeeded without regression.
- Client B opening this order received 404; no payment panel was visible. EN/ID interfaces were consistent and the original contract remained English. This page-access check is not evidence of direct-action authorization coverage for every role.

### Cancellation and replacement payment

- Order: `71925352-206a-4da7-a84a-9307ed620ad7`; first reference: `aw-sbx-8f034bd3-fd0a-48bd-bcbc-02e8933a9165`.
- BCA Pending was cancelled through Midtrans Sandbox; the website displayed **Dibatalkan**.
- Replacement reference: `aw-sbx-4293a6f6-f767-48ff-a096-26674eca772c`. The replacement popup opened with amount `2000000 IDR` and BCA VA available. Before payment there were two payment records (one `cancelled`, one `pending`), one snapshot and four acceptances.
- Replacement simulator payment: Success. The website became Paid after refresh without **Check payment status**. Replacement settlement notification: Success, HTTP 200, targeting the correct staging notification URL.
- Final operator SQL evidence: the first reference remained `cancelled`, `verified_at = NULL`; the replacement was `verified`, `verified_at = 2026-10-06 10:31:04.627682+00`. Order `paid`; two payment records, zero pending records, one snapshot, four acceptances and one incomplete brief. Work remained `draft`, `work_started_at = NULL`.

### Final interface QA

- EN/ID statuses were consistent. The second order's original contract remained Indonesian when the interface was English.
- Paid orders had no active button to pay again.
- Order page at mobile width 360 px had no overflow; keyboard navigation and focus: PASS. This does **not** establish that the Snap popup was tested on mobile.

### Undiagnosed initial Snap opening failure

- The second order initially displayed unavailable without a popup. Operator SQL showed a pending payment with a stored token; the token value was not shared.
- Codex's investigation produced no file changes, commit or deployment. Local string-404 resume tests and empty-body/numeric-code failures are documented separately under automated evidence above; the actual provider response during the hosted failure was not known.
- A later attempt opened the popup successfully on the same first reference; the operator reported HTTP 200. DevTools showed **Failed to load response data**, which is not evidence that the server response body was empty.
- Root cause remains unproven. Request/provider/status-lookup disruption or Snap.js/`snap.pay` failure are hypotheses only; no runtime fix was established or deployed for this incident.

### Remaining verification and product boundaries

- This is limited hosted Sandbox evidence, not completion of all Phase 5, all payment methods or production readiness.
- Hosted concurrency, uncertain outcomes, expiry/fraud/refund paths and direct-action authorization for all roles are not fully demonstrated. The replay checks above do not establish concurrent hosted delivery safety.
- Direct purchase, confirmation email, login-header changes and Production implementation were not performed in this documentation task. The 19 incomplete catalog packages remain unavailable for direct purchase; custom offers require complete terms. No production payment rollout or Phase 6 work is authorized.
- Payment remains 100% upfront; milestones are work allocations, not installment payments. Payment alone does not start work or complete/approve a brief.
- No secrets, token values, signatures, raw provider payloads or VA numbers are recorded in this checkpoint.

## Approved extension — ten direct packages, confirmation email and header access

Starting commit: `04f50ceb3a9b5deb0d509cce9f609a4f868b11cc`. This extension is staging only. The 6 October operator record above remains historical evidence, not QA for this new extension. Production and the existing two paid QA orders, snapshots, acceptances and payment history are not changed or backfilled.

### Approved package contract

`data/direct-packages.ts` is the centralized typed EN/ID specification and brief source, version `phase5-2026-10-11`. Stable service IDs, prices and slugs remain catalog-owned. One selected English or Indonesian output language is stored separately from the contract/interface language. Examples are labeled illustrative structures, not client evidence or promised sample files.

| Stable ID | Total IDR | Approved limits, tools and output | Estimate / review |
| --- | ---: | --- | --- |
| `digital-business-consultation` | 150000 | One business/problem; 60-minute Google Meet; one PDF summary, priorities and next actions | PDF within two business days after session; one clarification submission, up to three questions within seven calendar days after summary |
| `marketing-marketplace-audit` | 200000 | One channel OR store; 60-minute Google Meet; one PDF findings/priorities/action plan | Notes within two business days after session; one clarification submission, up to three questions within seven calendar days |
| `tracking-basic` | 450000 | One compatible website, GA4 property and GTM container; up to three events; configuration, event definitions, testing evidence and short checking guide | 3–5 business days; one in-scope adjustment round |
| `business-website` | 2750000 | WordPress, one language, up to five equivalent pages; responsive editor/contact links; metadata/headings/sitemap/robots; GA4/GTM page visits only; published on customer-owned compatible hosting, admin access and editing guide | 10–15 business days; two in-scope revision rounds |
| `seo-audit-roadmap` | 500000 | One website, up to 30 priority URLs and ten keyword themes; browser/sitemap, GSC/GA4 if available; one PDF plus prioritized action spreadsheet, including data limitations | Five business days; one report correction/clarification round |
| `seo-foundation` | 950000 | Compatible WordPress OR Next.js with source/deployment access; up to five target pages; implemented basic SEO, per-page changes and before/after evidence | 7–10 business days; one in-scope correction round; owner compatibility review before order/payment |
| `ads-tracking` | 650000 | One compatible website, GA4 property/GTM container, up to eight events; Meta Pixel OR Google Ads, browser-side only; configuration, tests and guide | 5–7 business days; one in-scope adjustment round |
| `career-consultation` | 100000 | One career direction/position; 45-minute Google Meet; session only | Clarification during session; no report, recording, CV writing or extra session |
| `cv-review` | 75000 | One CV, maximum two pages, one language/position; PDF/DOCX input; one feedback document and priority wording examples | 2–3 business days; one clarification submission, up to three questions within seven calendar days |
| `cv-rewrite-optimization` | 150000 | One CV, maximum two pages, one language/position; factual rewrite; one version in DOCX and PDF with simple formatting | 3–5 business days; one revision based on previously supplied information |

Every package has one work/handover milestone valued at its entire price, not an installment or a blanket no-refund clause. Payment remains 100% upfront. Gateway costs are absorbed without customer surcharge; checkout total equals the catalog package price. Adam's Work is not yet PKP: no PPN is added and a commercial invoice is not a Faktur Pajak. Domain, hosting, premium assets/plugins, subscriptions, third-party services and ad budgets are excluded unless expressly included. Extra purchases/charges require customer approval. Customer accounts/domain/hosting/website remain customer-owned; no performance/employment guarantees. Existing cancellation/refund/reschedule/no-show rules remain applicable.

Website default pages are Home, About, Services, Portfolio/Gallery and Contact; equivalent substitutions cannot increase count/complexity. Next.js business websites require inquiry/custom offer. Landing Page Starter stays outside activation and retains its existing route/workflow. Other nine catalog services remain inquiry/custom-offer work. Tracking does not assume universal website compatibility: authorized browser tag insertion, identifiable existing events and the existing consent implementation are required; unsupported work uses inquiry. The displayed customer eligibility checkbox is not an operator technical review.

### Direct flow and technical eligibility

Public detail → select output language → contextual login/register retaining package/output intent → review server-resolved total, tools, scope, outputs, exclusions, typed brief checklist, duration/revision, milestone, costs and all four policies → explicit unchecked acceptance → atomic unpaid order with one immutable snapshot/four acceptances → existing Sandbox payment. No artificial offer is created. Idempotent retries reuse the order key; browser totals/content cannot override the server specification. Snapshot includes output language, tools, typed brief fields, technical/scheduling conditions and retained policy contents/versions/hashes.

SEO Foundation requires a client-specific compatibility request (public URL without credentials/query/fragment, WordPress or Next.js). In the existing owner offers area, the owner checks the website, safe source/deployment access, five-page scope and change permissions through the agreed channel, then explicitly approves or redirects to custom-offer work. Client self-declaration does not unlock checkout. SQL locks/rechecks the approved target, client and specification version; one approval is linked to one order. This check does not approve the full work brief or start work.

Brief checklists are typed package data and appear before acceptance, in the retained contract and in email. Session briefs include three proposed times in WITA; scheduling is manual and purchase reserves no calendar slot. SEO audit does not require analytics access. Never collect passwords/API keys in ordinary brief fields. Complete brief submission/admin-approval UI, delivery workspace and work countdown remain later tasks. Payment alone leaves work draft with no start timestamp until a complete brief is admin-approved.

### Confirmation email lifecycle

Future first server-verified Paid transitions atomically enqueue `payment_notifications` by order/type, backed by the verified Sandbox payment. No historical paid-order backfill. Server reconciliation schedules processing after the response; explicit client/owner retry and Check payment status can also process pending jobs. Email failure never reverses payment. There is no background cron or automatic continuous retry worker.

Sender is `Adam's Work <no-reply@adamswork.app>`; Reply-To is `adamfiik13@gmail.com`. Content comes from the immutable accepted snapshot: reference/amount/package/output language, brief checklist, manual scheduling where relevant, authenticated order link and the admin-approved-brief prerequisite. It includes no link to an unimplemented upload form. Header shows localized Login or My orders, retaining footer access without exposing owner controls.

The durable outbox records `pending`, `sending`, `sent`, `retryable` or `manual_review`. Only operational columns are visible through RLS; recipient/content/lease/provider receipt remain server-only. Claims serialize with a three-minute lease and frozen first-send payload. Resend uses a stable per-order idempotency key. Failures can retry after one minute; after 23h50 from the first attempt, processing stops for operator review rather than risking a duplicate beyond [Resend's 24-hour idempotency retention](https://resend.com/docs/dashboard/emails/idempotency-keys). `sent` means provider accepted, not independently verified inbox delivery. Missing configuration and provider failures retain only safe error codes. For manual review, inspect provider receipt/delivery evidence before deciding on any separate recovery; do not blindly reset or resend.

### Operator application and verification — staging only

1. Before new hosted checkout/email QA, verify the approved staging Supabase reference and CLI link, distinct from Production. Back up staging SQL and preserve both paid QA orders. `npx supabase migration list --linked` should show five existing Local/Remote matches, with `20261011000100` and `20261011000200` local-only. If history differs or objects already exist, stop; do not reapply.
2. In the same staging SQL Editor, apply the full reviewed `20261011000100_catalog_eligibility.sql`, then `20261011000200_payment_notifications.sql`, each including its transaction. These additive migrations neither edit old migrations nor rewrite historical contracts. Builds do not execute SQL.
3. Read-only verification (all values true):

   ```sql
   select
     (select relrowsecurity from pg_class where oid='public.catalog_compatibility'::regclass) as compatibility_rls,
     (select relrowsecurity from pg_class where oid='public.payment_notifications'::regclass) as notification_rls,
     has_function_privilege('service_role','public.commerce_place_catalog_order(uuid,uuid,text,jsonb,text,jsonb,boolean)','EXECUTE') as catalog_server_allowed,
     not has_function_privilege('authenticated','public.commerce_place_catalog_order(uuid,uuid,text,jsonb,text,jsonb,boolean)','EXECUTE') as catalog_browser_denied,
     not has_function_privilege('authenticated','public.catalog_review_compatibility(uuid,uuid,boolean)','EXECUTE') as approval_browser_denied,
     not has_function_privilege('authenticated','public.payment_notification_claim(uuid,jsonb)','EXECUTE') as email_browser_denied,
     has_column_privilege('authenticated','public.payment_notifications','status','SELECT') as email_status_readable,
     not has_column_privilege('authenticated','public.payment_notifications','payload','SELECT') as email_payload_private,
     not has_column_privilege('authenticated','public.payment_notifications','lease','SELECT') as email_lease_private,
     exists(select 1 from pg_trigger where tgname='enqueue_payment_confirmation' and not tgisinternal) as email_trigger_present,
     not exists(select 1 from public.payment_notifications where order_id in ('c3e50d58-768f-409c-aea9-7216bc574fb7','71925352-206a-4da7-a84a-9307ed620ad7')) as old_qa_not_backfilled;
   ```

4. Only after successful application/verification, record each applied version: `npx supabase migration repair 20261011000100 --status applied --linked`, then the same command for `20261011000200`; run `npx supabase migration list --linked` and verify seven Local/Remote matches. If recording fails, resolve history without rerunning schema SQL.
5. Existing server-side `RESEND_API_KEY` is reused; no new env variable is introduced. Operator verifies its custom-staging scope and sender-domain authorization for `no-reply@adamswork.app` without sharing secret values. Auth SMTP alone is not proof that the application API key is available. No vendor setting or email test was performed by Codex.
6. Deployment Ready alone does not establish migration/configuration readiness. After both migrations, owner/operator performs the focused hosted QA below. Do not activate Production or live payments.

### Extension manual QA checkpoint

- Review all ten EN/ID service details, exact totals/limits/exclusions, selected one-language outputs, manual session scheduling and brief instructions. Confirm Landing Page Starter and non-ten inquiry CTAs remain available. Check visible desktop/mobile Login and authenticated My orders, keyboard/focus and narrow-screen wrapping.
- Contextual login/register/confirmation retains package and output selection. Review checkout total, milestone, requirements and all four policy versions; unchecked acceptance prevents creation. Duplicate submit yields one order, one immutable snapshot and four acceptances. Confirm existing custom offers and accepted historical contracts are unchanged.
- Foundation pending/rejected request blocks ordering/payment; only owner can approve, Client B cannot read/use Client A's approval; approved URL/platform/version is bound in the snapshot. Unsupported technical requirements use inquiry. An approved technical request is not brief approval.
- On a newly authorized Sandbox QA order, verify payment through authoritative provider state; confirm one outbox job/email across webhook replay and Check payment status. Verify sender/reply-to, selected output language, checklist and authenticated link; actual inbox delivery remains operator evidence.
- Simulate email failure only through approved operator testing; Paid/work draft must remain intact, safe failure status must be reviewable, retries must reuse the payload/key, and expired dedup windows must require manual review. Client B/non-owner retries must fail. Do not reset/delete attempts or existing QA orders.
- Staging stays noindex/nofollow with empty sitemap and no GA4 measurement on private routes. Full hosted concurrency, uncertain outcomes, expiry/fraud/refund/method coverage and complete brief/delivery workflow remain separate unverified work.

### Extension automated evidence

Local/mocked checks PASS: 570 direct-package/public-navigation checks, 684 direct-checkout/eligibility checks, 85 notification checks, 180 commerce regression checks and 188 payment checks. These cover server price authority, explicit acceptance, selected output/auth intent, duplicate creation, immutable snapshots, owner compatibility/RLS, existing custom offers, verified-payment replays, email deduplication/failure and unchanged payment/work protection. Lint and type-check PASS; one production build with `APP_ENV=staging` PASS (Next retried static-generation timeouts within that invocation). Local smoke returned HTTP 200 for EN/ID home/catalog, representative details and checkout; staging noindex/nofollow, empty sitemap and no advertised production sitemap PASS. No real email, payment or hosted database mutation was performed. Extension hosted migration and authenticated/email QA remain pending operator action.
