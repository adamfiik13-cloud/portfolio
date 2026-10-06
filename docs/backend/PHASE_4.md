# Phase 4 — staging commerce foundation

Reuses verified Phase 3B Auth. EN/ID checkout, orders, offers and owner-offer routes share domain logic. Private pages are dynamic, no-store/noindex, outside the analytics public allowlist. No payment provider, email, work countdown, brief submission, messages, files or delivery is activated.

## Operator migration (staging only)

Application is complete according to the operator-reported hosted staging QA below (6 October 2026 WITA). Keep this procedure as a reference; do not reapply the migration or repeat history repair for this checkpoint.

1. Use the reviewed `staging` checkout. Confirm the dashboard project is the existing **staging** Supabase project and compare its reference with the approved staging reference. The CLI must already be linked to that same project: from the repository root, compare `(Get-Content -LiteralPath 'supabase/.temp/project-ref' -Raw).Trim()` with that reference, then run `npx supabase migration list --linked`. If the link is absent/wrong or history has an unexpected discrepancy, stop. Never point these commands at Production or print passwords/tokens.
2. Take the normal staging database backup. The CLI Local/Remote columns must match for versions `20260929000100`, `20260929000200`, `20260929000300`; version `20261005000100` must be local-only, and its objects must not already exist. If history says applied or objects exist unexpectedly, stop and investigate rather than re-run this unapplied migration.
3. In that verified staging project's SQL Editor, execute the **entire reviewed** `supabase/migrations/20261005000100_commerce.sql` once, including `BEGIN` and `COMMIT`. Confirm successful completion without errors. Do not reset/re-run prior migrations, use `db push` for this SQL Editor application, or record the version before the transaction succeeds.
4. In the same SQL Editor, verify the committed objects and RPC access with this read-only query. Every column must return `true`; otherwise stop without recording history:

   ```sql
   select
     exists(select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='creation_key') as order_key_present,
     exists(select 1 from information_schema.columns where table_schema='public' and table_name='custom_offers' and column_name='transaction_terms') as offer_terms_present,
     private.commerce_valid_terms('{}'::jsonb) is false as incomplete_terms_rejected,
     private.commerce_valid_policies(null::jsonb,'en') is false as null_policies_rejected,
     to_regprocedure('public.commerce_create_offer(uuid,uuid,uuid,jsonb,text,timestamptz)') is not null as offer_rpc_present,
     to_regprocedure('public.commerce_place_order(uuid,uuid,text,jsonb,text,jsonb,boolean,uuid)') is not null as order_rpc_present,
     has_function_privilege('service_role','public.commerce_place_order(uuid,uuid,text,jsonb,text,jsonb,boolean,uuid)','EXECUTE') as server_rpc_access,
     not has_function_privilege('authenticated','public.commerce_place_order(uuid,uuid,text,jsonb,text,jsonb,boolean,uuid)','EXECUTE') as browser_rpc_denied;
   ```

5. Only after verified successful application, recheck the unchanged CLI link against the same staging reference, then run:

   ```powershell
   npx supabase migration repair 20261005000100 --status applied --linked
   npx supabase migration list --linked
   ```

   Check each command succeeds; if repair fails, stop and resolve history recording without re-running the SQL migration. The Local and Remote columns must now both contain `20261005000100`, with the three previous versions still aligned. This records the version in **`supabase_migrations.schema_migrations`**; a separate text ledger is not a substitute. `migration repair` updates history only, not schema SQL. Retain the reviewed Git commit and verification result in the operator record. See [Supabase migration tracking and repair](https://supabase.com/docs/guides/deployment/database-migrations).
6. Existing server-only `SUPABASE_SERVICE_ROLE_KEY` is needed by the atomic commerce mutations. Keep it scoped to staging and never expose it as a public variable. No new variable/provider configuration is introduced.
7. Log in with the existing verified owner. `/owner/offers` (ID `/id/pemilik/penawaran`) is owner-only. Select an existing verified client, enter equivalent EN/ID terms, an explicitly approved total, milestone values summing to that total, cost/tax disclosure and future ISO UTC expiry. Share the intended client's private offer link manually; this phase sends no email.

Until the migration is applied, reads/mutations fail closed with an unavailable message; the Vercel build never applies schema changes. Deployment Ready is not evidence that hosted commerce QA or migration is complete.

## Commercial readiness

Catalog scope/prices/outputs and category inputs are reused. Estimates and revision models reference the existing Service Policy; public catalog copy is unchanged. **No catalog package currently includes approved milestone values plus tax/fee/third-party cost disclosure**, so direct purchase remains disabled for all 19. Starting-price proposals also need agreed final price/scope/duration/revisions; monthly services need approved engagement/recurring billing terms. Inquiry stays available. Owner-approved details can later populate the centralized `data/commerce-catalog.ts` map; no numbers are inferred. Complete custom offers can be accepted now after manual migration/QA.

Snapshots retain original contractual language, server-resolved transaction terms/client identity, four immutable policy contents/hashes/versions and acceptance timestamp. Privacy is 1.1 / 2026-10-04; other policies 1.0 / 2026-09-28. An explicit unchecked agreement precedes atomic order creation. Changed sent offers require a new offer and renewed acceptance. Idempotency keys and offer row locks prevent duplicate orders. Initial states: work `draft`, payment `unpaid`, refund `none`, brief `incomplete`; no payment record or start timestamp. Existing database triggers require verified payment **and** admin-approved complete brief before work.

RPC validation rejects missing/NULL/wrong-type transaction and policy fields before mutations or idempotent returns. Every milestone requires a positive integer work allocation and the allocations sum to the agreed total; **milestones are not installment payments**. Payment remains 100% upfront. The application also validates terms; database constraints remain a second layer, not a replacement for RPC validation. PostgreSQL rejects malformed typed UUID/timestamp inputs before the RPC body. Focused local reproduction/regression command: `node scripts/test-commerce-validation.mjs`; normal workflow suite: `node scripts/test-commerce.mjs`. Neither command connects to hosted services.

## Manual QA order

1. After the migration, verify owner access and denial for client/team/non-owner; confirm EN/ID summaries, costs, milestone values and policy versions.
2. Catalog checkout retains inquiry and lists missing terms; login/registration preserves selected service or offer (same-browser verification intent lasts one hour). Cross-browser email verification lands on Account: clients can find their offers there or reopen the original offer link.
3. Create an offer for Client A. Client B cannot list/read/accept it, even with its UUID. Client A reviews both languages; unchecked agreement cannot create an order.
4. Accept and retry/double-submit: one order, one snapshot, four acceptances, unpaid and no work start. Expired/rejected/withdrawn offers cannot be accepted. Later policy changes do not rewrite accepted records; accepted agreement stays in its original language.
5. Confirm own order list/detail, translated status labels, mobile/keyboard/error feedback, staging noindex/nofollow and empty sitemap. Verify no Google measurement on private routes. Online payment remains unavailable; no Phase 5 or production promotion.

Rollback before any accepted staging transaction: revert the application commit if necessary; retain the additive schema and immutable history. Do not delete accepted orders, policy versions or audit records. Hosted migration execution and visual/copy/E2E QA are operator checkpoints.

## Offer detail 404 correction — 2026-10-06

Operator reports commerce migration applied and all four Local/Remote versions aligned; do not reapply it. List links and awaited EN/ID route params are correct. Detail rejected otherwise valid terms because `hash(transaction_terms)` used insertion-order-dependent `JSON.stringify`: PostgreSQL JSONB reordered keys, so the stored creation hash differed on read and `offerAgreement` returned null → `notFound()`; the list did not check hashes. Reproduced with real local PostgreSQL storage, not a hosted session.

`offerHash` uses the original owner-form field order (including EN/ID, revisions and milestones) on create/read, preserving existing offer hashes and all values; unknown fields remain included in integrity checks. Session-client reads, recipient filter and RLS are unchanged. No schema, hosted record, acceptance, snapshot or idempotency change. `node scripts/test-commerce.mjs`: 179 focused checks pass, including legacy JSONB round trip, actual EN/ID detail wrappers/list links, recipient access, Client B denial under RLS and detail 404, tamper rejection, acceptance/retries and immutable records. Lint, type-check and fresh production build each passed once after the final code fix.

Hosted authenticated QA was pending when the correction was delivered at `05cc7e5a90c37f96224c45aea155f65e5ab3af8a`; no Client A session was used by the agent. The subsequent operator report below supersedes that pending status for the explicitly reported checks only.

## Hosted staging QA closeout — 6 October 2026 WITA

**Evidence source: manual operator-reported hosted staging QA**, supplied by the owner; not agent-executed hosted checks or automated test results. Implementation baseline: `05cc7e5a90c37f96224c45aea155f65e5ab3af8a`. This closes the checkpoint for the reported coverage below.

- Migration `20261005000100_commerce.sql` successfully applied and recorded through `migration repair`; all four Local/Remote versions match. Seven operator-reported structure/RPC permission checks PASS.
- Owner opened both EN/ID forms and created a custom offer. Client A could not access the owner form. After the JSONB/hash fix, offer detail opened in both EN/ID.
- Without agreement, no order was created; with explicit agreement, order creation succeeded. Offer `4f0c998a-49e9-4cd7-9a57-7962f1da2179` is `accepted` and linked to order `c3e50d58-768f-409c-aea9-7216bc574fb7`. Total: **2000000 IDR**; contractual locale: **`en`**. These are QA transaction facts, not new catalog prices.
- One order exists for the checked creation key, with one snapshot, four policy acceptances, one `incomplete` brief and zero payment records. Terms/Service/Refund v1.0 and Privacy v1.1 were all accepted in `en`.
- Order states: work `draft`, payment `unpaid`, refund `none`, `work_started_at` NULL. Acceptance did not initiate payment or work.
- Verified Client B could not see Client A's transactions in lists; direct offer and order links returned 404.
- Order detail EN/ID matched; the original contract remained English. Mobile at 360 px had no overflow; keyboard/focus PASS.

### Previously reported automated evidence and remaining limits

At the implementation baseline, `node scripts/test-commerce.mjs` passed **179 focused local checks** using disposable PostgreSQL and mocked provider transport. Coverage includes legacy JSONB/hash compatibility, EN/ID offer list links/detail wrappers, recipient reads and Client B denial under RLS, tampered terms/hash rejection, explicit acceptance, sequential idempotent retries, expired-offer rejection, mismatched policy-content rejection, immutable records and initial order states. Lint, type-check and fresh production build also passed at that baseline. None of these runtime checks was repeated for this documentation-only closeout.

Hosted double-submit/concurrency, expired/rejected/withdrawn offers, and policy changes after acceptance **have not been reported as manually tested**. Sequential local retries do not prove hosted concurrency behavior; local expired-offer and immutable-record/content-mismatch checks do not establish hosted coverage of all lifecycle or post-acceptance policy-change scenarios. Manual Client B list/detail denial does not establish a separate hosted acceptance-RPC attempt. Other items in the manual QA checklist without an explicit result above remain unverified for this closeout.

### Product boundary retained

Direct purchase remains disabled for **all 19 services**; custom offers require complete agreed bilingual terms. Milestones remain work allocations and payment remains 100% upfront. Online payment is unavailable and production commerce is not activated. This QA closeout does not authorize production promotion, provider/database changes or Phase 5.
