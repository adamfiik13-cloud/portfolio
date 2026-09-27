# Adam's Work — Architecture

**Status:** Target architecture and delivery constraints  
**Version:** 1.0  
**Last updated:** 27 September 2026

## 1. Architecture goals

- Preserve the current Next.js and Vercel foundation.
- Support public portfolio and service discovery first, then commerce and authenticated operations.
- Keep business rules on trusted server boundaries.
- Protect client data and private project files.
- Allow vendors to be selected later without rewriting core business logic.
- Keep the MVP operationally simple for a small internal team.

## 2. Current baseline

- Framework: Next.js.
- Hosting and deployments: Vercel Pro.
- Source control: GitHub repository `adamfiik13-cloud/portfolio`.
- Working foundation branch: `phase-1a/adams-work-foundation`.
- Current launch domain decision: `adamswork.app`.
- Planned permanent Indonesian domain: `adamswork.id`.
- Fonts: self-hosted through `next/font/local`.
- Typography roles: League Spartan, Alata, Source Sans 3.
- Database, authentication, private storage, payment, email, and monitoring vendors remain undecided.

Do not infer vendor selections from examples in this document.

## 3. Logical system boundaries

### Public web

Marketing pages, service catalogue, portfolio, case studies, policies, contact, inquiry, and checkout entry.

### Application

Authenticated client portal, order workspace, brief, messages, files, delivery, revisions, and payment records.

### Internal operations

Owner/admin management and assignment-scoped team access.

### Server domain layer

Business rules for packages, offers, orders, briefs, payments, refunds, access, and state transitions.

### External services

- Payment gateway: planned Midtrans.
- Transactional email: TBD.
- Database: TBD.
- Authentication: TBD.
- Private object storage: TBD.
- Monitoring/error reporting: TBD.

Vendor-specific code should be isolated behind narrow adapters where practical.

## 4. Recommended application structure

This is a direction, not a forced migration if the repository has a better compatible structure.

```text
app/
  (marketing)/
    page.tsx
    about/
    portfolio/
    services/
    contact/
    policies/
  (auth)/
    login/
    register/
  (client)/
    dashboard/
    orders/[orderId]/
    offers/[offerId]/
  (internal)/
    admin/
    team/
  api/
    payments/
    webhooks/
    uploads/
components/
  brand/
  marketing/
  commerce/
  application/
  ui/
content-or-data/
domain/
  services/
  offers/
  orders/
  briefs/
  payments/
  refunds/
  permissions/
lib/
  auth/
  database/
  email/
  payment/
  storage/
  validation/
```

Rules:

- Route components should not contain payment or permission rules directly.
- Shared UI must not become a dumping ground for domain behavior.
- Server-only modules must be clearly separated from client code.
- Avoid premature abstraction; introduce adapters when external integration begins.

## 5. Core domain entities

### User

Identity and account-level information.

### Role and membership

Owner, admin if introduced, team member, and client. Public registration produces client access only.

### Service

Commercial category and public description.

### Package

Versioned commercial offering with price, scope, deliverables, duration, revisions, requirements, exclusions, and policy references.

### Custom offer

Client-specific commercial proposal with expiry and an immutable accepted snapshot.

### Order

Central record connecting client, purchased package/offer snapshot, work status, brief status, deadlines, assignment, and delivery.

### Payment

Gateway transaction reference, amount, currency, provider status, verified status, timestamps, and idempotency data.

### Refund

Separate lifecycle linked to payment and order without overwriting payment history.

### Brief and brief response

Versioned mandatory questions, client responses, files, and admin approval history.

### Message

Order-scoped asynchronous communication with author and timestamps.

### File asset

Private metadata, storage key, owner, order relation, purpose, type, size, and access policy.

### Delivery and revision

Submitted output, review window, client decision, and revision requests within the purchased allowance.

### Audit event

Records sensitive state changes such as payment verification, refund decisions, role updates, assignments, and order completion.

## 6. Data integrity rules

- Orders retain immutable commercial snapshots.
- Current package edits do not change existing orders.
- Monetary values use integer minor units or another database-safe exact representation; never floating-point arithmetic.
- Store currency explicitly; MVP transactions use IDR.
- Every order belongs to one client account.
- Team access requires an active assignment or privileged internal role.
- Soft deletion or archival is preferred for commercial records requiring history.
- Timestamps use UTC in storage and are formatted for the user interface.
- State changes use explicit validated transitions.

## 7. Authentication and authorization

- Authentication proves identity; authorization must be enforced separately on the server.
- Client queries must be scoped to the authenticated client's records.
- Team queries must be scoped to assigned orders unless the role grants broader access.
- Never rely solely on hidden navigation, client-side checks, or guessed unlisted URLs.
- Owner/team invitations must not allow privilege escalation.
- Sensitive actions may require recent authentication when supported.
- Session and cookie settings must follow the selected provider's secure production guidance.

## 8. Payment architecture

Planned provider: Midtrans, introduced after a working staging commerce flow exists.

Required flow:

1. Server creates a pending order and payment attempt from an approved price snapshot.
2. Server requests a payment session/token from the provider.
3. Client completes the provider-supported payment experience within the approved Adam's Work checkout flow.
4. Browser return state is treated as informational only.
5. Provider webhook reaches a dedicated server endpoint.
6. Server verifies signature/authenticity and validates amount, currency, order reference, and allowed transition.
7. Handler processes events idempotently.
8. Verified payment state updates separately from order state.
9. Transactional notification is queued/sent.

Never expose server keys to the browser or mark an order paid solely from query parameters or client callbacks.

## 9. File architecture

- Project files use private storage, not the repository or public directory.
- Access uses short-lived authorized URLs or a protected streaming endpoint.
- Uploads are validated for type, size, ownership, and intended order.
- Filenames displayed to users must not determine storage paths.
- Consider malware scanning before production if client uploads can contain general documents or archives.
- Define retention, deletion, and backup rules before accepting production files.

## 10. Email and background work

Transactional email events may include:

- Account verification or secure login event.
- Payment verified/failed/expired.
- Brief submitted or changes requested.
- Work started.
- New order message.
- Delivery submitted.
- Revision requested.
- Order completed or cancelled.
- Refund status update.

Email is a notification channel, not the source of truth. Users must be able to see authoritative order state in the application.

Retries and reminders should be idempotent and observable. Introduce a job/scheduler mechanism only when a feature requires it.

## 11. Internationalization

- Indonesian is the initial commercial default.
- English supports global clients and should share the same domain data.
- Keep translated copy separate from business logic.
- Decide the URL strategy before Phase 2 completion.
- Metadata, alternate-language links, sitemap entries, and structured data must follow the chosen URL strategy.
- Do not machine-publish unfinished translations as final content.

## 12. Environment and deployment model

### Local

Developer machine with local environment variables and safe test data.

### Branch preview

Short-lived Vercel deployments for phase review. No production secrets or live payment processing.

### Stable staging

Created after Phase 1A and before Phase 2 work is treated as release-ready. Recommended characteristics:

- Stable URL such as `staging.adamswork.app`.
- Separate project or environment configuration where practical.
- Non-production database and storage.
- Sandbox payment credentials only.
- Public enough for Midtrans onboarding when the Phase 4 readiness gate is met.
- Protected from search indexing.
- Clear staging indicators and safe test accounts.

### Production

- `adamswork.app` initially; migration/canonical plan for `adamswork.id` when purchased and approved.
- Production database, storage, email, and live payment credentials.
- Backups, monitoring, alerting, and documented rollback.

Never share databases, storage buckets, payment credentials, or webhook secrets between staging and production.

## 13. Configuration and secrets

- Use environment variables for credentials and environment-specific endpoints.
- Publish a `.env.example` containing names and safe descriptions only.
- Validate required server environment variables at startup/build where appropriate.
- Prefix only genuinely public browser-safe values with the framework's public prefix.
- Rotate leaked secrets rather than merely deleting them from the latest commit.

## 14. Observability and recovery

Before commerce production:

- Structured server logging without secrets or unnecessary personal data.
- Error reporting for failed checkout, webhook, upload, and email paths.
- Correlation identifiers for orders and payment attempts.
- Health monitoring for key public and webhook endpoints.
- Database backup and restore procedure.
- Operational runbook for payment mismatch, duplicate events, failed email, and file access incidents.

## 15. Security and privacy baseline

- Apply least privilege.
- Validate and sanitize all untrusted input.
- Use CSRF protections appropriate to the chosen auth/session architecture.
- Add rate limits to authentication, inquiry, upload, and sensitive mutation endpoints.
- Verify webhook origin/authenticity.
- Prevent insecure direct object references through server authorization.
- Avoid logging brief content, private filenames, payment secrets, or unnecessary personal data.
- Define privacy disclosures and data retention before production collection.
- Perform dependency and security review before production launch.

## 16. Testing strategy

### Every implementation phase

- Lint.
- Type-check.
- Fresh production build.
- Focused smoke test for changed critical paths.

### Before payment integration

- Domain-state transition tests.
- Authorization tests.
- Order snapshot and amount tests.

### Payment sandbox

- Successful payment.
- Pending/async payment.
- Failed and expired payment.
- Duplicate and out-of-order webhook.
- Invalid signature.
- Amount/order mismatch.
- Refund paths when supported.

### Before production

- End-to-end fixed package and custom offer journeys.
- Role isolation and private file access.
- Accessibility review.
- Backup restore rehearsal.
- Monitoring and rollback verification.

## 17. Delivery roadmap and architecture gates

| Gate | Required outcome |
| --- | --- |
| Phase 1A | Brand and reusable UI foundation; no commerce architecture |
| Staging setup | Stable isolated environment established |
| Phase 2 | Public information architecture and bilingual-ready pages |
| Phase 3 | Approved commercial content and policies |
| Phase 4 | Working auth/order/checkout flow on staging; no live payment assumption |
| Midtrans onboarding | Public functional staging satisfies provider website criteria |
| Phase 5 | Sandbox payment, signed idempotent webhook, reconciliation |
| Phase 6 | Client/admin/team operations and private files |
| Phase 7 | Production security, data, monitoring, live credentials, launch |

## 18. Architectural decisions still open

- Database and ORM/data access approach.
- Authentication provider and session model.
- Private storage provider.
- Transactional email provider.
- Monitoring and error-reporting provider.
- Background job/scheduler mechanism.
- Bilingual routing and content source.
- Final schema after packages and policies are approved.
- Whether SEO billing requires recurring payment in the MVP.

Choose these only when requirements are sufficiently clear. Record material choices as short Architecture Decision Records.

