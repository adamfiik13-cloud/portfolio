# Phase 3B — Authentication and user lifecycle

## Scope and status

Staging-only email/password authentication, verified email, password recovery, logout and a minimal account page. No ordering, checkout, payment, upload, admin/team management or account deletion. All Phase 3A tables, RLS, immutable records and private Storage policies remain unchanged. Hosted settings and owner assignment are not assumed to have been applied by this source change.

The owner's Stage 14 rehearsal report states that application recovery passed. **Full hosted Auth and Storage restore remains deferred until a compatible platform environment is available.** This implementation does not repeat or claim that rehearsal or full hosted recovery.

## Routes and entry rule

| Purpose | English | Indonesian |
| --- | --- | --- |
| Login | `/login` | `/id/masuk` |
| Contextual registration | `/register` | `/id/daftar` |
| Request recovery | `/forgot-password` | `/id/lupa-password` |
| New password | `/reset-password` | `/id/atur-ulang-password` |
| Account | `/account` | `/id/akun` |
| Email-link confirmation | `/auth/confirm` | `/id/auth/konfirmasi` |

`/auth/callback?locale=en` or `locale=id` is an optional PKCE confirmation callback. It exchanges a code, verifies the user and sends them only to the fixed localized account/login route; it never grants password-reset permission. Token-hash templates below are required for recovery/invitations. No arbitrary `next`, redirect, or fragment token is accepted.

Registration is described and confirmed as part of starting a service order; creating an account does not create an order. There is no homepage or primary-navigation signup CTA. A small localized login link is in the footer. The login form has a contextual registration link; future order flow will provide its own entry. The current intent checkbox is an entry rule, not proof of an order or an authorization mechanism. Public service CTAs still open WhatsApp.

Every auth/account/confirmation route is dynamic, `noindex, nofollow`, private/no-store, and excluded from the unchanged public sitemap. Proxy also sets X-Robots-Tag and Referrer-Policy no-referrer. Locale switching maps equivalent auth routes and keeps a valid email token/type where required. Public pages retain their SEO behavior.

## Session, authorization and recovery boundary

- `@supabase/ssr` clients are reused. Auth-only Next.js Proxy refreshes cookies with `getClaims`; refreshed request/response cookies and private cache headers are preserved. Public marketing pages never invoke session refresh.
- Shared server page context calls `getUser` and requires a non-anonymous user with `email_confirmed_at`. Account rendering rechecks this on the server, then reads only the current profile/staff record using the user's client and RLS. Logged-out/unverified users redirect to the locale-matching login; verified users at login/register redirect to account.
- Source auth operations are deliberately gated to APP_ENV=staging and the exact staging app origin, or APP_ENV=local with a loopback origin and no VERCEL value. Supabase target-isolation checks still require distinct environment refs. A production rollout requires its own authorization; no production Auth connection is made by these new routes.
- Server Actions provide same-origin POST protection. Login errors are generic. Signup and recovery return the same eligibility message for existing/absent accounts, provider errors and rate limiting. Passwords never enter response state/logging. Signup metadata contains display name/locale only, never a role; automatic signup sessions are discarded even if dashboard confirmation is misconfigured.
- Email confirmation GET only displays a form. Signup verification consumes the one-time `token_hash` via `verifyOtp(type=signup)` on an explicit POST, then verifies current identity with `getUser`. Only self-editable profile fields are initialized. Email scanners opening GET links cannot consume these tokens.
- Recovery/invitation links lead to the matching reset form. Its POST validates the new password first, calls `verifyOtp(type=recovery|invite)`, rechecks the same verified identity with `getUser`, then calls `updateUser`. An ordinary login session alone cannot authorize reset. The provider's one-time token supplies the recovery capability; there is no unsigned recovery cookie or reusable client flag.
- Successful reset signs out all provider sessions and clears local auth cookies. Other devices' issued JWTs may remain valid until their expiry; review token lifetime before production. If verification consumed a token but update/signout subsequently fails, request a new recovery link. Do not bypass one-time verification for retries.
- Logout attempts provider local-scope signout and clears current app session cookies; errors remain visible and generic. No service-role/admin client is introduced. The service-role secret remains exclusively in the existing protected health reader.
- Hosted Supabase Auth rate limits must be reviewed. Server-side provider calls may share an egress IP; do not claim per-client distributed rate limiting or CAPTCHA has been implemented. Before production authentication, verify abuse protection, delivery quotas and user-visible retry behavior.

## Staging dashboard and email configuration (manual)

Select **adams-work-staging** and verify its identity before every action. No production dashboard/database is queried or configured by this phase.

1. Email provider enabled; email/password signup enabled **only in staging**. Require email confirmations. Anonymous sign-in stays disabled. Do not enable social, phone or magic-link login.
2. Site URL: `https://staging.adamswork.app`.
3. Exact allowed Redirect URLs used by signup/recovery:
   - `https://staging.adamswork.app/auth/confirm?locale=en`
   - `https://staging.adamswork.app/id/auth/konfirmasi?locale=id`
   - If the optional PKCE confirmation flow is used: `https://staging.adamswork.app/auth/callback?locale=en` and `https://staging.adamswork.app/auth/callback?locale=id`.
   No wildcard or production redirects. The reset destinations are internal server routes, not provider redirect targets.
4. Set the password policy to at least 12 characters, uppercase/lowercase/digit/symbol when supported. App registration/reset enforce this policy and a 128-character maximum. Existing passwords can still log in; no forced owner password change is imposed. Set email-link expiry to a short operational window (recommend 30 minutes), review provider rate limits and available leaked-password protections without enabling paid features automatically.
5. Preserve Resend Custom SMTP and approved sender `Adam’s Work <notifications@adamswork.app>`. Disable click/open tracking on Auth links. Verify actual received headers and Reply-To handling (`adamfiik13@gmail.com`) during manual QA. No direct email SDK/sender is added.
6. Configure the **Confirm signup**, **Reset password** and **Invite user** email template links to use the matching entry below. The app sends RedirectTo with `?locale=en|id`, so append parameters with `&`, not a second `?`:

```html
<!-- Confirm signup -->
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup">Continue / Lanjutkan</a>
<!-- Reset password -->
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">Continue / Lanjutkan</a>
<!-- Invite user: operator must choose one of the exact localized RedirectTo URLs above -->
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=invite">Continue / Lanjutkan</a>
```

Use the invitation RedirectTo explicitly; existing already-consumed invitations need a new password-recovery link, not re-use of the old token. Default fragment-based email links do not support this implementation. Email template body localization/SMTP headers require actual received-email QA; the shared bilingual action label above is not a claim of localized delivery.

7. Confirm staging application env has APP_ENV=staging, NEXT_PUBLIC_SITE_URL=https://staging.adamswork.app, staging URL/publishable key, staging project ref and both distinct project refs. Use the existing approved operator/Vercel workflow; never paste credentials in chat or commit env files. No new secret is required for Phase 3B. Production settings remain unchanged.

## Owner bootstrap (operator only)

Run the **single idempotent DO operation** in [../../scripts/bootstrap-staging-owner.sql](../../scripts/bootstrap-staging-owner.sql) only in the **adams-work-staging SQL Editor**, after visually confirming the selected project's name/ref. It is intentionally not a shared migration or public server endpoint. There is no portable SQL-only hostname/ref check for the hosted SQL Editor, so checking the selected staging project is mandatory.

The operation looks up the existing, verified, non-anonymous, non-deleted Auth user for the explicitly approved `adamfiik13@gmail.com`; requires exactly one match; ensures one matching profile; and grants `owner, active=true` only through this trusted operator action. It never creates an Auth user or accepts a browser email/role. Repeating it causes no duplicate profile, role or audit event. `profiles` has no activation column in the approved schema: here “active profile” means the existing linked profile plus a verified Auth account; staff activation uses `staff_access.active`. A future lifecycle-state migration needs separate approval.

After running it, log in through the staging app and verify the account shows owner access. Existing RLS still prevents owner/admin browser sessions from writing operational tables. No admin dashboard is delivered here.

## `Database error deleting user`: evidence and proposed lifecycle

**Repository-supported likely cause:** `public.profiles.id → auth.users.id ON DELETE RESTRICT`. `private.sync_auth_profile` creates a profile for every inserted Auth user, including an invited owner. Deleting that Auth user therefore fails even with no orders. This was reproduced using the unmodified migrations in disposable local PostgreSQL as a RESTRICT foreign-key error (`profiles_id_fkey`). It is not proof of the exact hosted log event; hosted database/Auth logs must identify the actual failed constraint before any deletion policy is finalized. No hosted user was deleted or queried here.

Relevant direct identity relationships (all ON DELETE RESTRICT):

| Referenced identity | Incoming references |
| --- | --- |
| auth.users.id | profiles.id |
| profiles.id | staff_access.user_id; orders.client_id; order_messages.author_id; order_files.uploader_id; custom_offers.client_id; policy_acceptances.user_id; refunds.requested_by; order_status_history.actor_id; audit_events.actor_id |
| staff_access.user_id | briefs.approved_by; team_assignments.staff_id; custom_offers.created_by |

Orders also retain incoming snapshot/brief/assignment/message/file/payment/refund/history references; custom offers and policy acceptances have owner-matching composite order FKs. Payment records retain refunds; policy versions retain acceptances. These indirect relationships prevent removing contractual/financial history to free an identity.

Relevant triggers:

- auth_profile_created calls private.sync_auth_profile on Auth insert/email update; deleting Auth does not cascade the profile.
- reject_mutation forbids update/delete of order_snapshots, policy_versions, policy_acceptances, order_status_history and audit_events.
- log_staff_access and log_assignment_access append audit evidence; log_order_status retains work/payment/refund transitions.
- guard_offer makes accepted offers immutable. Snapshot/acceptance/payment/order/brief/refund guards enforce transaction integrity. touch_updated_at preserves modification timestamps, not deletion authorization.

**Lifecycle proposal, not implemented or a new public legal promise:**

| Account | Proposed safe handling |
| --- | --- |
| Ordinary client without retained records | Deactivate first, revoke sessions, verify no object ownership/dependencies and review retention before considering hard deletion |
| Client with orders, payments, consent, messages or files | Disable access; retain linked contractual/financial/security evidence; anonymize only reviewed non-essential personal fields |
| Staff | Revoke active roles/assignments, transfer work and disable Auth access; retain authorship, approvals and audit identity |
| Owner | Never self-delete or automatically delete; require explicit trusted operator authorization and a verified successor owner before deactivation |

Deactivation means blocking future access and revoking sessions while preserving identities/records. Anonymization means a reviewed, auditable removal/replacement of unnecessary personal data across Auth/profile/provider metadata and files, without editing immutable contractual evidence. Hard deletion means actual removal and can eventually be considered only after dependency inventory is empty, legal holds/retention obligations are satisfied, Auth/Storage ownership is resolved, and a tested operator transaction plus backup/rollback exists. The current restrict FKs remain intact; no workflow is available in this phase.

Retain financial payment/refund records, order snapshots and accepted policies, relevant consent/version evidence, security/role/assignment/audit history, authorship/approvals and necessary dispute evidence. Private file bytes require their own retention/deletion rules and manifest. Retention periods, identity minimization within immutable evidence and erasure obligations require owner/legal approval before a production lifecycle implementation; do not invent durations.

## Verification and handoff

Run lint, type-check, fresh production build, `npm run test:auth`, tracked-secret scan and focused staging route/SEO checks. Auth provider calls are stubbed in unit tests; SQL bootstrap/deletion evidence uses disposable local PostgreSQL. These are not hosted email/session behavior proofs. Public copy/data, policies, prices and migrations are unchanged; only a localized login entry is added to the footer.

Manual staging QA: contextual registration → verification email → explicit confirmation → verified login; incorrect password; absent-user generic response; forgot/reset (including expired/re-used links); logged-out account redirect; logged-in login/register redirect; EN/ID parity/switching; logout; owner role after bootstrap. Do not test deletion or production. Auth email delivery, full hosted Auth/Storage restoration, private signed URLs and application provider connectivity need actual staging verification. Resend/Sentry/health live behavior is not newly verified by this task.

References: [Supabase SSR clients and Proxy](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs), [password authentication](https://supabase.com/docs/guides/auth/passwords), [Next.js Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
