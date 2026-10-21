# Phase 6 — first batch: brief and private attachments

Staging only. Reported starting baseline: `a7a55eef12447a7758674256601e8e6c3dddde56`; preserve newer valid staging work. Production, vendor configuration and historical QA orders are unchanged. Hosted SQL is operator-only; deployment Ready does not prove database/Storage readiness.

## Implemented scope and boundaries

- Shared EN/ID client brief and owner review use the accepted immutable snapshot. Direct packages use its retained `brief_fields`; older custom offers use their agreed `requirements` with stable `requirement_1`, `requirement_2`, … fields. The live catalogue never replaces accepted requirements. Interface language, original contract language and selected output language remain distinct.
- Owning verified clients may save drafts or submit complete briefs only on Paid orders in `incomplete`/`changes_requested`. Submitted/approved responses cannot be silently edited. Required fields, allowed keys and string lengths are checked server-side and again in SQL: at most 40 accepted fields, 6000 characters per answer and 5000 characters per review note. These are technical input limits, not new commercial terms; brief fields never request passwords/API keys.
- Active verified owner reviews submitted briefs, approves complete answers or requests changes with an explicit note. Optimistic revision checks reject stale updates; immutable revision history retains actor, event, answers and review note in protected database rows. Private contents are not sent to logs/Sentry.
- Work start is a separate explicit owner action. SQL locks/rechecks Paid, a matching verified full-amount payment and an approved complete brief, with no pending attachments. It sets `in_progress` and the start timestamp once; a retry preserves that timestamp. SEO compatibility approval and email delivery do not satisfy these prerequisites. Estimates do not become fixed deadlines.
- Private brief attachments use the existing non-public `client-briefs` bucket, UUID order/file paths, 10 MiB limit and approved MIME allowlist (PDF, JPEG, PNG, WebP, plain text/CSV, DOCX and XLSX). Authorized direct upload avoids sending the entire file through a Server Action. The owning uploader and owner may review pending/quarantined metadata, but bytes remain unreadable until server finalization validates actual type/size and marks the file ready. Authorized downloads use a 60-second signed URL. Failed/stale pending uploads can be logically discarded at the current editable brief revision; this does not delete retained object bytes or implement cleanup of abandoned Storage objects. This is format validation, not malware scanning; attachments do not become mandatory beyond the accepted contract.
- The signed upload capability is scoped to one reserved UUID path with `upsert: false`; [Supabase's provider-default upload window is two hours](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl). It does not grant download/read access or expose the service-role credential. Ready-file downloads still require an authorized server check and a separate 60-second signed URL.
- Lists/details show service names and separate payment/brief/work states with a primary next action. Existing original agreements, payment and email remain accessible. No new order messages, delivery/revision workflow, team provisioning/assignment or homepage redesign is included. Payment and email deduplication rules, prices, policies, snapshots and acceptances remain unchanged; no mass backfill.
- Newly rendered confirmation emails now direct clients to the Paid order workspace for brief submission. This is guidance copy only: payment verification, email scheduling/deduplication/retry flow and previously frozen email payloads remain unchanged, as do accepted agreements and snapshots.

## Operator application — staging only

1. From the reviewed `staging` checkout, compare the dashboard project reference and existing CLI link (`supabase/.temp/project-ref`) with the approved isolated **staging** project, distinct from Production. Do not expose secret values. Take the normal pre-change SQL backup and retain an encrypted, integrity-checked archive; include private Storage object bytes when any exist. Preserve the existing QA orders, snapshots, acceptances and payment/email history. Run `npx supabase migration list --linked`: the seven prior versions must match; `20261012000100` and `20261012000200` must be local-only. If history or objects differ, stop; never reapply.
2. In that same staging project's SQL Editor, apply each full reviewed file once, in order: `supabase/migrations/20261012000100_brief_workspace.sql`, then `supabase/migrations/20261012000200_brief_files.sql`, including their `BEGIN`/`COMMIT`. Builds do not run SQL. No previously applied migration is edited.
3. After both transactions succeed, execute the read-only verification query below. All predicates must be true before recording history. If any fail, stop and inspect the actual application result; do not rerun either migration blindly.
4. Only after verified successful application, recheck the unchanged staging CLI link and run:

   ```sh
   npx supabase migration repair 20261012000100 --status applied --linked
   npx supabase migration repair 20261012000200 --status applied --linked
   npx supabase migration list --linked
   ```

   All **nine** Local/Remote versions must match. A text ledger is not CLI migration history. If repair fails, resolve the history discrepancy without reapplying schema SQL.
5. Confirm the existing `client-briefs` bucket remains private with the existing 10 MiB/allowlist settings. No new vendor, bucket, environment variable or production setting is required. Perform the focused operator QA below only after database/Storage readiness.

Read-only workspace verification:

```sql
select
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='briefs' and column_name='revision') as brief_revision_present,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='briefs' and column_name='review_note') as review_note_present,
  (select relrowsecurity from pg_class where oid='public.brief_revisions'::regclass) as revision_rls,
  exists(select 1 from pg_trigger where tgrelid='public.brief_revisions'::regclass and tgname='reject_mutation' and not tgisinternal) as history_immutable,
  not has_table_privilege('authenticated','public.brief_revisions','TRUNCATE') as history_browser_truncate_denied,
  not has_table_privilege('service_role','public.brief_revisions','TRUNCATE') as history_truncate_denied,
  has_function_privilege('service_role','public.workspace_save_brief(uuid,uuid,integer,jsonb,boolean)','EXECUTE') as save_server_allowed,
  not has_function_privilege('authenticated','public.workspace_save_brief(uuid,uuid,integer,jsonb,boolean)','EXECUTE') as save_browser_denied,
  not has_function_privilege('anon','public.workspace_review_brief(uuid,uuid,integer,text,text)','EXECUTE') as review_anonymous_denied,
  not has_function_privilege('authenticated','public.workspace_start_work(uuid,uuid,integer)','EXECUTE') as start_browser_denied,
  has_function_privilege('service_role','public.workspace_start_work(uuid,uuid,integer)','EXECUTE') as start_server_allowed,
  not has_function_privilege('authenticated','private.workspace_valid_responses(uuid,jsonb,boolean)','EXECUTE') as private_validator_denied,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='order_files' and column_name='upload_revision') as upload_revision_present,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='order_files' and column_name='content_sha256') as file_digest_present,
  exists(select 1 from pg_policies where schemaname='public' and tablename='order_files' and policyname='brief_pending_metadata_read') as pending_metadata_policy,
  exists(select 1 from pg_trigger where tgrelid='public.order_files'::regclass and tgname='guard_workspace_file' and not tgisinternal) as file_identity_guard,
  has_function_privilege('service_role','public.workspace_prepare_file(uuid,uuid,integer,uuid,text,bigint,text)','EXECUTE') as upload_server_allowed,
  not has_function_privilege('authenticated','public.workspace_prepare_file(uuid,uuid,integer,uuid,text,bigint,text)','EXECUTE') as upload_browser_denied,
  not has_function_privilege('anon','public.workspace_finalize_file(uuid,uuid,integer,uuid,boolean,text)','EXECUTE') as finalize_anonymous_denied,
  not has_function_privilege('authenticated','public.workspace_discard_file(uuid,uuid,integer,uuid)','EXECUTE') as discard_browser_denied,
  (select not public and file_size_limit=10485760 from storage.buckets where id='client-briefs') as brief_bucket_private_bounded;
```

## Manual hosted QA

- Client A: on an authorized Paid QA order, check original retained EN/ID requirements, output language and next action. Save an incomplete draft; missing mandatory fields must block submission. Submit complete answers; submitted answers cannot be edited. Owner requests changes with a clear note; Client A sees it, corrects/resubmits, and owner approves. Old custom-offer requirements and snapshots must remain unchanged.
- Client B/non-owner: Client A's order/brief/history/attachments remain inaccessible; forged direct actions and upload/finalize/download/start requests must fail. Client cannot approve/start; non-owner staff cannot use owner review/start controls.
- Owner: list/detail identifies service/client/amount and separate states. Unpaid, unverified or unapproved work start fails. Approved SEO compatibility alone must not start work. A complete approved Paid brief permits one start; retry preserves `work_started_at`. Stale draft/review submissions fail without silently replacing newer answers; immutable history shows the correct actor/review/resubmission.
- Attachments: valid allowed files up to 10 MiB, unsupported/false browser MIME and oversize rejection, private UUID paths, pending download denial, finalization and short-lived authorized download. Client B cannot upload/finalize/read another order's files. Verify real Storage upload/download, signed URL expiration and byte validation; local mocks are not proof of hosted Storage behavior or malware scanning.
- Preserve prior Paid orders and policy/payment/email history; do not reset attempts or execute automatic hosted payments/emails. Check EN/ID status/copy, original contract, one primary next CTA, 360 px wrapping, keyboard/focus and interactive targets. Staging stays noindex/nofollow with empty sitemap and private analytics excluded.
- Record operator results separately from automated checks. Hosted concurrency/Storage failure recovery remain pending until specifically demonstrated. Phase 5 option-A email failure/retry checkpoint and unresolved **P5-SNAP-01** remain required before Production; this batch does not establish full payment or Production readiness.

## Automated evidence and limitations

Completed local/mocked validation: **122 workspace checks**, **180 private-file checks** and **155 workspace UI checks** PASS. Regression checks PASS: **42 backend migration/RLS/integrity/storage checks** plus health/environment/Sentry checks, **729 direct-checkout checks**, **180 commerce checks**, **188 payment checks** and **85 confirmation-email checks**. Lint and type-check PASS. The fresh production build with `APP_ENV=staging` completed successfully on 21 October 2026 WITA.

Anonymous local production-server smoke PASS: EN/ID homepages returned HTTP 200 with noindex/nofollow; client and owner order routes redirected to login with private/no-store caching; sitemap was empty and robots advertised no sitemap. Robots intentionally allows crawling so crawlers can read noindex. At the server's canonical localhost origin, a malformed file request returned HTTP 400; a mismatched Origin returned HTTP 403. Neither request reached a database mutation.

These checks use disposable PGlite, mocked sessions/Storage/providers and component assertions; they do not establish authenticated hosted QA, real Storage transfer, inbox delivery or hosted concurrency. No hosted SQL, payment, email or existing QA data is mutated by the automated checks. Deployment Ready is the staging review checkpoint, followed by operator migration and authenticated manual QA. Messaging, delivery, work revisions, team assignment and Phase 7 remain out of scope.
