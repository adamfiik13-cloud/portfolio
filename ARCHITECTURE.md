# Adam's Work — Architecture

**Status:** Target architecture and delivery constraints  
**Version:** 1.1\
**Last updated:** 27 September 2026

## 1. Architecture goals

- Preserve the current Next.js and Vercel foundation.
- Support public portfolio and service discovery first, then commerce and authenticated operations.
- Keep business rules on trusted server boundaries.
- Protect client data and private project files.
- Allow vendors to be selected later without rewriting core business logic.
- Keep the MVP operationally simple for a small internal team.

Optional public analytics uses a consent-gated GTM loader, a static public-page allowlist, and sanitized page-view events. Staging and Preview never send application measurement events; private and unknown routes never load GTM. The isolated analytics release adds no backend or authentication infrastructure. Configuration, operator QA, and deferred activation are documented in `docs/analytics/PHASE_16D.md`.

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
    work/
    services/
    contact/
    policies/
    id/
      page.tsx
      tentang/
      layanan/
      karya/
      kontak/
      # Equivalent localized policy and detail routes use explicit locale mapping.
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

### Phase 2B public catalog

- Typed offers, shared IDR prices, inquiry types, and explicit EN/ID slugs live in `data/service-catalog.ts`; interface copy lives in `data/service-copy.ts`.
- Shared server templates serve `/services`, `/id/layanan`, and their detail routes. Unknown slugs return 404.
- The catalog adds a shared client-side search/category filter with all services in the initial rendered HTML. Reusable category thumbnails use inline decorative SVG; bilingual output expectations remain attached to stable service IDs.
- Each page maps its equivalent locale URL for navigation and canonical/hreflang metadata. Production sitemap includes both versions; staging SEO protection is inherited unchanged.
- CTAs prepare WhatsApp inquiries only. Price metadata is not a checkout implementation or authorization to take payment.

### Phase 2C.2 policy content and future transaction boundary

- `data/policies/config.ts` centralizes stable policy IDs, EN/ID paths, operator identity, and typed per-policy metadata through `getPolicyMetadata`. Terms/Service/Refund retain version 1.0 and 2026-09-28; Privacy uses version 1.1 and 2026-10-04. Rendering uses each policy's metadata, never a staging/build timestamp.
- `data/policies/en.ts` and `id.ts` contain typed paragraph/list/table sections with matching stable section IDs. `PolicyPage` shares presentation and the existing public shell; footer links import only configuration. Indonesian is the primary contractual version for Indonesian-directed transactions; full English clauses preserve substantive parity.
- Policy route pairs: `/terms` ↔ `/id/syarat-ketentuan`, `/service-policy` ↔ `/id/kebijakan-layanan`, `/refund-policy` ↔ `/id/kebijakan-refund`, `/privacy` ↔ `/id/kebijakan-privasi`. Metadata maps reciprocal alternates and English x-default; production sitemap includes all eight routes and staging remains noindex with an empty sitemap.
- Internal source retained in `docs/policies/Adams_Work_Policies_Draft_v1.md`; internal review items, checkout checklist, and data model are not rendered publicly. Provider-dependent text must not imply unimplemented systems or finalized vendors.

Future Transaction Terms fields (documentation only; no acceptance or persistence implementation):

| Group | Immutable snapshot fields |
| --- | --- |
| Identity | Order ID, timestamp, contract language, client name/contact, operator, accepted Terms/Service/Refund/Privacy versions |
| Service | Stable service ID/name, objectives/context, scope, outputs, milestones, estimate, revision/review model, mandatory brief/access/materials, exclusions, dependencies/assumptions |
| Price | Base price, add-ons, disclosed taxes/fees, total IDR, payment method/expiry, commencement conditions |
| Cancellation/change | Specific cancellation rules, milestone values, third-party/non-refundable costs, change-request procedure, 5-business-day review, 14-day inactivity rule |
| Rights | Ownership/source files, third-party licenses, confidentiality/white-label/portfolio opt-out, no guaranteed business outcomes |
| Acceptance | Active unchecked-by-default consent, accepted_at, accepted_by, accepted_language, restricted/encrypted IP evidence, user agent, immutable content hash |

- Future policy-version records retain type, version, locale, content/hash/location, effective_at, published_at, and retired_at. Acceptance records link the order/user to every accepted policy version; retain the accepted content, not only a link to mutable pages.
- Persist the immutable order Terms snapshot and successful acceptance **before creating any payment transaction or token**. Optional marketing consent stays separate.
- Historical orders keep their accepted policy versions. A changed custom offer requires a new version or addendum, a new snapshot, and renewed acceptance; never overwrite an accepted snapshot.
- Payment, work/order, and refund statuses are independent. A refund does not overwrite payment history or imply a work-state transition.
- Source Parts V, VII, and VIII provide the complete future checkbox, checkout, and data-model requirements; they authorize no runtime commerce in Phase 2C.2.

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

1. Server records the immutable order Terms/price snapshot and successful client acceptance before creating a payment attempt.
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

English is the default public and communication language. English targets growing businesses and global companies, particularly those entering or operating in Indonesia. Indonesian serves Indonesian SMEs as the secondary audience. Adam's Work remains an Indonesia-based Web, SEO & Digital Growth Studio.

### Public URL strategy (Phase 2 target)

| Page | English (default) | Indonesian |
| --- | --- | --- |
| Home | `/` | `/id` |
| About | `/about` | `/id/tentang` |
| Services | `/services` | `/id/layanan` |
| Work | `/work` | `/id/karya` |
| Contact | `/contact` | `/id/kontak` |

Service details, case studies, and policies must have equivalent permanent URLs in both locales. Public translated slugs may differ; use stable internal IDs and explicit locale-to-URL mapping.

### International SEO

- Root document language is English (`en`); `/id` and its descendants use Indonesian (`id`).
- Every locale page has a self-referencing canonical and reciprocal `hreflang` links for `en` and `id`; `x-default` points to its English equivalent.
- Sitemap contains both locale versions. Metadata and structured data follow the active locale.
- No automatic IP-based language redirect. The language switcher opens the equivalent translated page when available.
- Missing translations must not silently render mixed-language final content. Do not advertise nonexistent equivalents in SEO links or use English fallback as final Indonesian copy.

### Content architecture and parity

- Content and business logic remain separate. Services, packages, case studies, FAQs, policies, and transactional labels use stable IDs.
- Translations are locale variants of the same entity, with explicit locale mapping; translated slugs are not entity IDs.
- Do not duplicate pricing, order, payment, or permission logic per language.
- Both languages must provide equivalent service, portfolio, policy, and commerce information. Indonesian preserves factual and feature parity with English; secondary language never means reduced functionality or incomplete content.

### Application language

- Public website: English default, Indonesian selectable.
- Checkout and client area: English default and bilingual-ready. User locale can later be stored in session/profile.
- Transactional email should eventually follow the client's selected locale, using localized templates for shared domain events.
- Internal status values remain language-neutral; only display labels are translated.
- Admin language may remain English for MVP unless a later requirement approves Indonesian UI.

Phase 1B records this direction in documentation only; it does not authorize runtime copy changes, locale routing, staging setup, or Phase 2 implementation. Later application phases remain bilingual-ready without duplicating domain logic.

## 12. Environment and deployment model

### Local

Developer machine with local environment variables and safe test data.

### Branch preview

Short-lived Vercel deployments for phase review. No production secrets or live payment processing.

### Stable staging

Created after Phase 1B and before Phase 2. Recommended characteristics:

- Stable URL such as `staging.adamswork.app`.
- One Vercel project: `main` tracks Production; `staging` tracks the Custom Environment `staging`.
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

Phase 1B requires quick Markdown and Git-diff validation only, without visual QA or a Vercel Preview.

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
| Phase 1B | Documentation-only language-direction alignment |
| Staging setup | Stable isolated environment after Phase 1B, before Phase 2 |
| Phase 2 | Implement the English-first multipage bilingual public website |
| Phase 3 | Approved bilingual commercial content and policies |
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
- Content source and routing implementation details within the locked English-root/Indonesian-`/id` URL strategy.
- Final schema after packages and policies are approved.
- Whether SEO billing requires recurring payment in the MVP.

Choose these only when requirements are sufficiently clear. Record material choices as short Architecture Decision Records.

