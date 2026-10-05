# Phase 4 — staging commerce foundation

Reuses verified Phase 3B Auth. EN/ID checkout, orders, offers and owner-offer routes share domain logic. Private pages are dynamic, no-store/noindex, outside the analytics public allowlist. No payment provider, email, work countdown, brief submission, messages, files or delivery is activated.

## Operator migration (staging only)

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

After staging deployment Ready, Client A must reopen the **same** offer at `/id/penawaran/4f0c998a-49e9-4cd7-9a57-7962f1da2179` and `/offers/4f0c998a-49e9-4cd7-9a57-7962f1da2179`, confirm the bilingual details and pending status, and leave acceptance unchecked. Hosted authenticated QA remains pending: no Client A session was used for this correction. If still 404, report only the route, time and visible result; never share credentials/session cookies.
