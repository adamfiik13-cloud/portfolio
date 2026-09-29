# Phase 3A backend foundation

## Boundaries and status

Supabase (PostgreSQL/Auth/private Storage, Singapore `ap-southeast-1`), Resend (Auth SMTP and later transactional mail), Sentry (server errors), and the existing Next.js/Vercel project are approved. Use separate **staging and production Supabase projects**. Target Free plans/no additional vendor cost for the first three months, subject to current quotas; do not enable paid overages/subscriptions. Review upgrades before real data becomes commercially significant. This is not a promise of free capacity, backups, availability, or email deliverability.

No live project, credential, database, SMTP or Sentry delivery was configured by this repository change. No public registration, auth UI, orders API, checkout, payment integration, email sender, or client/admin UI is enabled. Midtrans is deferred; Adam’s Work must never store payment-card data. Existing public services and policies remain static and unchanged.

## 1. Manual vendor/environment checklist

1. Create two Supabase Free projects in **Singapore**. Record distinct refs; choose strong unique DB passwords in a password manager. Confirm plan/organization limits before creation and do not upgrade automatically.
2. In BOTH dashboards disable public signup and anonymous sign-in. `supabase/config.toml` applies to local development; it does not configure hosted projects. Staff invitations and owner bootstrap are manual trusted administration only. Never derive a role from user-editable Auth metadata. The auth trigger creates a client profile only.
3. Set each project's Auth Site URL to its exact app origin (staging or production); use only exact approved callback paths when auth is implemented, never broad production wildcard redirects. Do not enable production registration in this phase.
4. Install Docker for the full local Supabase stack if needed. `npm run db:start` uses local-only ports and disabled signup. Node 22+ is recommended; Node 24 was used for the embedded PostgreSQL tests. Full hosted Auth/Storage behavior still needs a staging integration test.
5. Operator shell: set `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` and the intended `SUPABASE_PROJECT_REF` securely. Run `node scripts/check-backend-environment.mjs` before linking. Then `npx supabase link --project-ref $env:SUPABASE_PROJECT_REF`, `npx supabase migration list`, `npx supabase db push --dry-run`; inspect the pending three migrations, then `npx supabase db push`. Do not apply to production without separate approval. Do not put passwords on command lines or print environment values. No migration runs in Next/Vercel builds.
6. Vercel **Custom Environment staging only**: set `APP_ENV=staging`, `NEXT_PUBLIC_SITE_URL=https://staging.adamswork.app`, the staging URL/publishable key, staging `SUPABASE_PROJECT_REF`, BOTH distinct `SUPABASE_STAGING_PROJECT_REF` and `SUPABASE_PRODUCTION_PROJECT_REF`, staging-only `SUPABASE_SERVICE_ROLE_KEY`, and a unique random `CRON_SECRET` of at least 32 characters. Later Production gets its own corresponding values and independent secrets. Preserve the existing unset Production APP_ENV SEO behavior (backend identifies VERCEL_ENV=production), or use APP_ENV=production when explicitly approved. Local-only uses APP_ENV=local, loopback Supabase URL, no VERCEL value. All other local/preview remote connections must target staging.
7. Keys/URLs remain blank in `.env.example`. The publishable key is public by design and depends on RLS. The service-role key bypasses RLS; it is server-only and used solely by the narrowly scoped health reader, never exported as a generic admin client. CLI/database credentials are not Vercel build requirements.
8. Resend: verify `adamswork.app` DNS records supplied by its dashboard (SPF/DKIM; review DMARC). Configure **custom SMTP in Supabase Auth**, host `smtp.resend.com`, port 465, username `resend`, password a restricted Resend API key, sender email `notifications@adamswork.app`, sender name `Adam’s Work`. Use distinct staging/production keys and restrict staging recipients to the test team. Supabase's default SMTP is not acceptable for production. Disable open/click tracking for authentication links. Supabase's SMTP settings do not necessarily expose Reply-To: verify received headers during the later auth integration; future custom auth/transactional sends must use `adamfiik13@gmail.com` as Reply-To. No email is sent here and no Resend SDK is needed yet.
9. Sentry: create/configure the Free project(s), set server-only `SENTRY_DSN` independently per Vercel environment, disable paid features/overages and review quotas. Events carry `staging`, `production`, or `development`. Only Node server errors/health failures are collected; no browser replay, tracing, profiling, source-map uploads or email/file content. The SDK v11 `dataCollection` options disable all sensitive collection and `beforeSend` retains only safe identifiers/timestamp/environment plus a fixed error message. Raw errors/stack traces/URLs/headers/user fields are intentionally discarded. Reduced diagnostic detail is deliberate.
10. After staging credentials and migrations exist, redeploy staging; verify authorized health=200, wrong secret=401, no secret/config=503, safe Sentry failure event, and isolation. Do not claim SMTP/Auth/Storage success until tested with real staging credentials.

## 2. Database/access matrix

Three ordered SQL migrations create 17 business tables (all RLS enabled), private helper functions and three private buckets. The public catalog remains in `data/service-catalog.ts`; orders store stable service IDs and immutable snapshots. Amounts use integer Rupiah, currency IDR; timestamps use timestamptz/UTC.

| Resource | Client | Active assigned team | Owner/admin session | Trusted server |
| --- | --- | --- | --- | --- |
| profiles | Own read; display name/locale update only | Own only | Read all | Auth-trigger identity sync |
| staff_access | Own record if staff, no role mutation | Own only | Read all | Provision/revoke after authorization |
| orders, snapshots, briefs, status history | Own read | Assigned orders read | Read all | Validate mutation, record actor |
| messages | Own order, client-visible only | Assigned orders incl. internal | Read all | Authorized create/change |
| files | Own order, ready and client-visible | Assigned metadata; ready downloads | All metadata; ready downloads | Validate/upload/quarantine/release |
| assignments | No unrelated records | Own assignments | Read all | Authorized staff assignment |
| custom offers | Own, excluding drafts | None | Read all | Create version; accepted version immutable |
| policy acceptances/versions | Own accepted policies | No others' acceptance | Read all | Record verified consent |
| payments/refunds | Own read | None | Read all | Verified provider workflow later |
| webhook events/audit | None | None | Read only | Sanitized append/processing |
| system_health | None | None | None through user session | Read singleton only |

There are **no API-user writes** to operational tables, even from owner/admin sessions. This is intentional foundation scope: future server endpoints must authenticate the user, check authoritative roles and order ownership/active assignment, validate transitions and record the real actor before service-role mutations. Client brief/message/upload/offer acceptance UI needs a separately reviewed write API; do not simply add broad RLS write policies. Current admin/team reads must not be exposed in UI without phase authorization.

Auth-created profiles never inherit metadata roles. SECURITY DEFINER helpers use a fixed empty search_path and current auth.uid, with narrowly granted execution; the private schema is not exposed by PostgREST. Authenticated users cannot edit email, roles, prices, approvals, payment/refund state, assignments, audit or snapshots. Revoking a staff account or assignment immediately removes assignment-based reads.

Snapshots, policy versions, acceptances, audit and status history reject UPDATE/DELETE even for service_role. Accepted custom offers cannot be edited/deleted; a new offer version/addendum creates a new immutable snapshot. Each order snapshot references four locale-matching immutable policy versions; acceptance must match the order owner and those versions. Payment records require all four acceptances first and the order's exact amount. Work start requires a verified payment plus an admin-approved mandatory brief. Paid/refund/work statuses are separate; later handlers must reconcile provider transitions transactionally. These guards do not implement a payment workflow. Provider webhook references are unique for idempotency; only event type/reference/digest and processing timestamps are stored, never raw card/payment payloads.

Order status changes are automatically appended to history; staff/assignment mutations generate safe audit records. Service-role background activity may have null auth.uid; later server mutation APIs must supply separate trustworthy actor/reason audit evidence (do not trust a client-submitted actor). Audit JSON keys are restricted. Profile deletion is deliberately restricted to prevent accidental loss of transaction evidence; future approved retention/deletion workflows must be explicit.

## 3. Private Storage

Migration `20260929000300_storage.sql` creates `client-briefs`, `work-files`, `deliverables` with `public=false`, 10 MiB technical per-file cap, and PDF/JPEG/PNG/WebP/plain text/CSV/DOCX/XLSX MIME allowlist. No SVG, HTML, scripts, executables or archives. These are conservative backend limits, not new public service promises.

Object names are exactly `<order UUID>/<file UUID>` with original name retained only as metadata. Metadata enforces matching bucket/category and size/type. No public URLs are stored. Downloads require a matching `ready` metadata record and the same owner/admin/active-assignment authorization; internal files are hidden from clients. Unknown, pending, quarantined or deleted objects cannot be downloaded through an authenticated session. No authenticated insert/update/delete Storage policies exist yet.

Future server uploads must validate actual bytes and size (not trust the reported MIME/name), check authorization, create pending metadata, upload, scan/review as required, then release. Use authenticated Storage downloads or authorized signed URLs with a short expiry (e.g. 60 seconds). Service-role signed URLs bypass RLS: authorize first. Revocation does not invalidate a previously issued signed URL until expiry. Never use getPublicUrl for these buckets.

## 4. Health check and scheduling

`GET /api/cron/supabase-health` compares `Authorization: Bearer <CRON_SECRET>` in constant time, rejects unconfigured/short secrets, never logs request/provider errors, returns only `{ok:boolean}`, disables caching and uses X-Robots-Tag noindex. The server reads only `system_health(id=1).healthy`, with a 5-second query timeout; no customer writes or analytics traffic. Failures emit a fixed safe Sentry message when configured. Retry is safe because the operation is read-only.

`vercel.json`: `15 0,8,16 * * *` UTC = **08:15, 16:15, 00:15 WITA** (UTC 16:15 is the following WITA date). Vercel injects CRON_SECRET into scheduled requests. Three daily runs require the existing Vercel Pro plan; Hobby is daily-only. **Vercel Cron invokes Production deployments, not Custom Environment staging.** The config is prepared on staging but no production deployment is authorized here; staging requires a manual authorized request for verification. A separate staging scheduler or any production-to-staging forwarding must be approved later; none was added. A scheduled heartbeat is temporary inactivity mitigation, not an availability or Free-plan anti-pause guarantee.

## 5. Backup/recovery runbook (operator-only; not executed)

Rule: back up before every major schema change, after meaningful production transactions, and weekly once real client data exists. Keep encrypted copies outside the repository and separate from the vendor; verify restore capability, not just dump success. Never put backups in public assets. `.gitignore` excludes `backups/`, `*.dump`, `*.backup` and local Supabase state.

Use Supabase CLI with Docker and operator credentials, or PostgreSQL 17 client tools. Configure `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE=verify-full`, and any required `PGSSLROOTCERT` securely in the operator shell for a direct/session-pooler connection; do not put passwords in command arguments. Confirm the intended project ref using its dashboard before every operation. Do not use transaction pooling for dump/restore.

Example logical backup commands (PowerShell; target an encrypted backup volume with restricted permissions):

```powershell
# Connection comes from PG* environment variables, never shell command arguments.
$backupDirectory = 'D:\EncryptedBackups\adams-work\YYYY-MM-DD-project-ref'
New-Item -ItemType Directory -Path $backupDirectory -ErrorAction Stop
pg_dump --format=custom --schema=public --schema=private --file="$backupDirectory\application.dump"
if ($LASTEXITCODE -ne 0) { throw 'Application backup failed' }
pg_dump --format=custom --data-only --schema=auth --file="$backupDirectory\auth-data.dump"
if ($LASTEXITCODE -ne 0) { throw 'Auth backup failed' }
pg_dump --format=custom --data-only --schema=storage --file="$backupDirectory\storage-data.dump"
if ($LASTEXITCODE -ne 0) { throw 'Storage metadata backup failed' }
pg_restore --list "$backupDirectory\application.dump"
```

Also record migration versions (`npx supabase migration list`), CLI/PostgreSQL versions, project ref, bucket settings, and required external configuration without secret values. Auth data is highly sensitive. Supabase-managed auth/storage schema versions must match a restore target; backup/restore of managed metadata requires the documented Supabase procedure and an isolated rehearsal. Logical dumps **do not contain Storage object bytes**, SMTP settings, JWT keys or vendor configuration. Export private object bytes through an authorized Storage API into the same encrypted backup set; retain a manifest/path/checksum, never public URLs. No script in this phase downloads client files.

Restore/rebuild options:

- **Fresh empty project:** create Singapore project, disable signups, configure secrets independently, verify project separation, apply repository migrations via `supabase link` + `db push --dry-run` + `db push`. This recreates business tables, RLS, private buckets and policies, not data. Do not also restore schema from application.dump on top of these objects.
- **Recovery from backup:** use an isolated new project first. Inspect archives using `pg_restore --list`; match managed schema versions and review the official recovery guide. Restore compatible Auth records before business data because profiles reference auth.users. Restore application schema/data OR apply migrations and restore application data-only, never both schema paths. Immutable triggers and Auth profile-sync triggers require controlled bypass during data-only restoration by a trusted DB operator, only on the isolated target: `pg_restore --data-only --disable-triggers --no-owner --no-privileges --exit-on-error --single-transaction ...` (appropriate superuser/trigger privileges required). Inspect and exclude duplicate preseeded system_health data and managed migration metadata using `pg_restore --use-list` before restoration. Preserve/reapply grants through reviewed migrations. Do not turn RLS off for normal use.
- Restore only compatible needed Storage metadata, then private object bytes to the original bucket/path via the authorized Storage API; reconcile duplicates/foreign keys and checksums. Keep all buckets private. Reapply/review Storage policies from migration definitions. Never claim a SQL-only restore restored files.
- Validate record counts, immutable policy/offer snapshots, file manifest, role/assignment access, and test users from two clients plus assigned/unassigned staff. Rotate secrets if compromise was involved; reconfigure Auth SMTP/redirects/Sentry/cron. Only switch application envs after explicit approval and a successful rehearsal. The repo's isolation check prevents accidentally using one project for both environments.
- **Paused project:** resume it from Supabase dashboard, wait for database/Auth/Storage readiness, run authorized health check and verify a staged read/access test. If it cannot resume, follow the isolated recovery procedure. A heartbeat cannot wake or guarantee recovery from a paused/deleted project.

No restore or production schema command should run as part of deployment. Destructive restore and production data processing need their own explicit task.

## 6. Validation and remaining gates

`npm run test:backend` applies real SQL to embedded PostgreSQL and tests RLS/immutability/commencement/storage plus cron authorization/environment isolation/Sentry redaction. Supabase-owned Auth/Storage scaffolding is mocked; hosted integration still requires credentials. Full-stack optional local check: Docker + `supabase start`, local reset only on disposable data, `npm run db:lint`. Do not run linked/production resets.

Before live commerce: verify hosted RLS/Storage signed links, auth refresh/proxy matcher on future private routes, SMTP/Reply-To, sanitized Sentry delivery, concurrent webhook/refund state transitions, backup restoration, retention/legal requirements, and quotas. The session-refresh helper is prepared but not wired to current public routes; future auth pages must call it from a scoped Next.js Proxy and use server-verified identity plus RLS. Refresh responses must be private/no-store and retain cookies/cache headers. Never trust getSession for authorization.

Installation audit reported existing baseline advisories for Next.js 16.3.1, sharp 0.35.3 and js-yaml 4.3.1. These baseline packages were not upgraded during backend scope; address them in a focused security patch before enabling authenticated production traffic. Do not expose local development servers publicly.

Official references:
- https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://resend.com/docs/send-with-supabase-smtp
- https://supabase.com/pricing
- https://resend.com/pricing
- https://sentry.io/pricing/
