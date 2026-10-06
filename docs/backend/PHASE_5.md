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
