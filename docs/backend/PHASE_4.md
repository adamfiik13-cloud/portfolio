# Phase 4 — staging commerce foundation

Reuses verified Phase 3B Auth. EN/ID checkout, orders, offers and owner-offer routes share domain logic. Private pages are dynamic, no-store/noindex, outside the analytics public allowlist. No payment provider, email, work countdown, brief submission, messages, files or delivery is activated.

## Operator migration (staging only)

1. Confirm the Supabase project is the existing **staging** project; compare its reference with the configured staging reference. Do not use Production.
2. Take the normal staging database backup. Existing migrations `20260929000100_foundation.sql`, `20260929000200_access.sql` and `20260929000300_storage.sql` must already be applied.
3. In that verified staging project's SQL Editor, execute `supabase/migrations/20261005000100_commerce.sql` once as a complete transaction. Record the migration in the normal operator migration ledger. Do not reset/re-run prior migrations or apply this to production.
4. Existing server-only `SUPABASE_SERVICE_ROLE_KEY` is needed by the atomic commerce mutations. Keep it scoped to staging and never expose it as a public variable. No new variable/provider configuration is introduced.
5. Log in with the existing verified owner. `/owner/offers` (ID `/id/pemilik/penawaran`) is owner-only. Select an existing verified client, enter equivalent EN/ID terms, an explicitly approved total, milestone values summing to that total, cost/tax disclosure and future ISO UTC expiry. Share the intended client's private offer link manually; this phase sends no email.

Until the migration is applied, reads/mutations fail closed with an unavailable message; the Vercel build never applies schema changes. Deployment Ready is not evidence that hosted commerce QA or migration is complete.

## Commercial readiness

Catalog scope/prices/outputs and category inputs are reused. Estimates and revision models reference the existing Service Policy; public catalog copy is unchanged. **No catalog package currently includes approved milestone values plus tax/fee/third-party cost disclosure**, so direct purchase remains disabled for all 19. Starting-price proposals also need agreed final price/scope/duration/revisions; monthly services need approved engagement/recurring billing terms. Inquiry stays available. Owner-approved details can later populate the centralized `data/commerce-catalog.ts` map; no numbers are inferred. Complete custom offers can be accepted now after manual migration/QA.

Snapshots retain original contractual language, server-resolved transaction terms/client identity, four immutable policy contents/hashes/versions and acceptance timestamp. Privacy is 1.1 / 2026-10-04; other policies 1.0 / 2026-09-28. An explicit unchecked agreement precedes atomic order creation. Changed sent offers require a new offer and renewed acceptance. Idempotency keys and offer row locks prevent duplicate orders. Initial states: work `draft`, payment `unpaid`, refund `none`, brief `incomplete`; no payment record or start timestamp. Existing database triggers require verified payment **and** admin-approved complete brief before work.

## Manual QA order

1. After the migration, verify owner access and denial for client/team/non-owner; confirm EN/ID summaries, costs, milestone values and policy versions.
2. Catalog checkout retains inquiry and lists missing terms; login/registration preserves selected service or offer (same-browser verification intent lasts one hour). Cross-browser email verification lands on Account: clients can find their offers there or reopen the original offer link.
3. Create an offer for Client A. Client B cannot list/read/accept it, even with its UUID. Client A reviews both languages; unchecked agreement cannot create an order.
4. Accept and retry/double-submit: one order, one snapshot, four acceptances, unpaid and no work start. Expired/rejected/withdrawn offers cannot be accepted. Later policy changes do not rewrite accepted records; accepted agreement stays in its original language.
5. Confirm own order list/detail, translated status labels, mobile/keyboard/error feedback, staging noindex/nofollow and empty sitemap. Verify no Google measurement on private routes. Online payment remains unavailable; no Phase 5 or production promotion.

Rollback before any accepted staging transaction: revert the application commit if necessary; retain the additive schema and immutable history. Do not delete accepted orders, policy versions or audit records. Hosted migration execution and visual/copy/E2E QA are operator checkpoints.
