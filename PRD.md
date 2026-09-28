# Adam's Work — Product Requirements Document

**Status:** Working product baseline  
**Version:** 1.1\
**Last updated:** 27 September 2026  
**Owner:** Fikri Adam  
**Current launch domain:** `adamswork.app`  
**Planned primary domain:** `adamswork.id`

## 1. Product summary

Adam's Work is an Indonesia-based, personal-brand-led Web, SEO & Digital Growth Studio and digital services platform. English is the default communication language. It combines a credible portfolio, a service catalogue, ordering and payment, and a private workspace where clients and the internal team can complete projects.

All services belong to Adam's Work and are delivered through a founder-led studio with specialist collaborators, with strategy, communication, and quality accountability remaining with Fikri Adam. The platform is not a public freelancer marketplace. Fiverr is only a reference for the ordering workflow.

## 2. Brand foundation

| Item | Decision |
| --- | --- |
| Brand | Adam's Work |
| Descriptor | Web, SEO & Digital Growth Studio |
| Tagline | Better digital work, built together. |
| Operating principle | Clarity before execution. |
| Brand lead | Fikri Adam — founder, strategist, and quality lead |
| Character | Strategic, practical, personal, collaborative |
| Primary market | Growing businesses and global clients entering or operating in Indonesia |
| Secondary market | Indonesian SMEs |

## 3. Product goals

1. Establish trust through evidence-based case studies and a clear working approach.
2. Help prospective clients understand, compare, and order services without unnecessary back-and-forth.
3. Connect payment, brief collection, project communication, delivery, and revision in one workflow.
4. Give the owner and internal team a reliable operational view of every order.
5. Build a commercial foundation that can grow without becoming a public marketplace.

## 4. Non-goals

- Public seller profiles or public freelancer registration.
- Marketplace commissions, seller balances, or split payouts.
- Escrow between independent buyers and sellers.
- Public bidding or project competition.
- Complex project management comparable to Jira, ClickUp, or Asana.
- Real-time chat in the first release.
- Multi-vendor payment settlement.

## 5. Target users

### 5.1 Indonesian SME decision-maker (secondary audience)

Needs understandable services, transparent scope, Rupiah pricing, local communication, visible proof, and a simple order process.

### 5.2 Growing businesses and global clients (primary audience)

Growing businesses need clear digital services, credible execution, and structured delivery. Global clients entering or operating in Indonesia also need local market context and an English-first bilingual experience.

### 5.3 Owner

Needs control over services, pricing, policies, clients, orders, payments, refunds, custom offers, and team assignments.

### 5.4 Internal team member

Needs access only to assigned orders and the information required to deliver them. Team accounts are invitation-only.

## 6. Core value proposition

Adam's Work turns unclear digital needs into focused work with an explicit scope, practical execution, measurable outputs, and accountable delivery.

The website must communicate:

- What Adam's Work can help with.
- Why the work is credible.
- What is included before a client pays.
- What happens after payment.
- Who is responsible for quality.
- How a client can start a conversation or place an order.

## 7. Launch service strategy

Phase 2B publishes 19 approved offers across Websites, SEO, Tracking & Analytics, Paid Advertising, Strategy & Marketplace, and separately presented Career Services. Websites, SEO, tracking, and growth strategy remain the primary business positioning.

Approved prices and scope are maintained in `data/service-catalog.ts`. Standardized services may later support checkout; variable-scope “Starts from” services require a quote; consultations may later support booking and payment. In Phase 2B all CTAs open a prepared WhatsApp inquiry. Final scope and price are confirmed after discovery. Unspecified delivery timelines and revision arrangements require confirmation; no checkout or booking is implemented.

## 8. Information architecture

### Public area

- Home
- About
- Portfolio index
- Permanent case-study pages
- Services index
- Service detail
- Contact or project inquiry
- Terms and Conditions
- Privacy Policy
- Cancellation and Refund Policy

### Locked language direction

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

### Client area

- Account and profile
- Orders
- Order detail/workspace
- Mandatory brief
- Messages per order
- Private file upload and download
- Delivery review
- Revision request
- Payment and refund records
- Custom offer review

### Owner/admin area

- Service and package management
- Client management
- Order management
- Payment and refund records
- Brief review and approval
- Custom offers
- Team invitations and assignments
- Basic operational reporting

### Internal team area

- Assigned orders only
- Required brief and files
- Order messages
- Progress updates allowed by role
- Deliverable upload if authorized

### Phase 2C.2 public policies

- Approved source: `docs/policies/Adams_Work_Policies_Draft_v1.md`. Publish full equivalent EN/ID clauses, not only the English operational summary.
- Operator: Fikri Adam, an individual trading as Adam’s Work, Badung, Bali, Indonesia; public contact: adamfiik13@gmail.com. Do not publish private identification or a home address.
- Indonesian is the primary contractual version for transactions directed to Indonesian customers; English supports international visitors and transactions subject to specific Transaction Terms.
- Policy version 1.0 is active in configuration. Its effective date stays unset until actual production publication; set `POLICY_EFFECTIVE_DATE` once during promotion. Staging approval is not an effective date.
- Routes: `/terms` ↔ `/id/syarat-ketentuan`; `/service-policy` ↔ `/id/kebijakan-layanan`; `/refund-policy` ↔ `/id/kebijakan-refund`; `/privacy` ↔ `/id/kebijakan-privasi`.
- Approved operational terms include the source timelines/revisions, 5-business-day review, two reminders plus 14 days of inactivity before possible archival, consultation rescheduling, and progress-based refunds with statutory protections. Specific accepted Transaction Terms/custom offers take precedence under the documented hierarchy.
- Public policies do not activate accounts, checkout, payment integration, acceptance logging, or orders. Service inquiries remain available through existing contact channels.
- Every future order must retain an immutable accepted Terms snapshot. Acceptance precedes payment transaction creation; policy updates never change historical orders. Changed custom offers require a new version/addendum and renewed acceptance. Payment, work, and refund statuses remain separate.

## 9. Ordering workflows

### 9.1 Fixed package

Portfolio or service discovery → package selection → login/register → checkout → 100% payment → mandatory brief → admin brief approval → work starts → delivery → revision/approval → completed.

### 9.2 Custom project

Requirement submission → discussion → custom offer → client approval → 100% payment → mandatory brief → admin brief approval → work starts → delivery → revision/approval → completed.

### 9.3 Commercial rules

- Work does not begin before payment is verified.
- Delivery duration starts only after mandatory information is complete and approved by admin.
- Scope, duration, revision allowance, and policy summary must be visible before checkout.
- Additional work requires an additional offer and payment before execution.
- Each order stores a snapshot of price, scope, duration, revisions, and applicable policies at purchase time.
- Work status, payment status, and refund status are separate state dimensions.
- Currency for transactions is Indonesian Rupiah.

## 10. MVP functional requirements

### Public and catalogue

- Responsive English-first bilingual public experience with equivalent Indonesian content and functionality.
- Service catalogue with packages in IDR.
- Service detail with scope, exclusions, duration, revision allowance, deliverables, requirements, FAQ, and policy summary.
- Portfolio and permanent case-study URLs.
- Contact information and WhatsApp CTA.
- Search-engine metadata, sitemap, robots directives, and relevant structured data.

### Account and access

- Public registration creates client accounts only.
- Owner and team accounts are created or invited internally.
- Server-side authorization protects all private records and files.
- Users can access only data permitted by their role and assignment.

### Checkout and payment

- Full upfront payment.
- One Indonesian payment gateway; Midtrans is the planned provider.
- Payment state is confirmed from verified server-side webhook events, not browser redirects alone.
- Checkout remains on the Adam's Work website as required by the payment onboarding criteria.
- Payment history and transaction references are retained.

### Brief and order workspace

- Package-specific mandatory brief.
- Private file uploads.
- Admin approval of brief completeness.
- Order timeline, progress, deadline, and messages.
- Transactional email for important order updates.
- Delivery submission, review period, revision request, and approval.
- Cancellation and refund record management.

### Admin and team operations

- Owner can manage services, packages, clients, orders, payments, custom offers, and team access.
- Owner can assign an internal team member to an order.
- Team members can access assigned work only.
- Admin actions affecting payment, refund, access, or completion should be auditable.

## 11. State model requirements

Exact labels may evolve, but these concerns must remain separate:

| State dimension | Illustrative states |
| --- | --- |
| Order | Draft, awaiting brief, brief review, ready, in progress, delivered, revision, completed, cancelled |
| Payment | Pending, verified, failed, expired, refunded, partially refunded |
| Refund | Not requested, requested, reviewing, approved, rejected, processed |
| Brief | Incomplete, submitted, changes requested, approved |

Transitions must be validated on the server. A payment redirect must not directly mark an order as paid.

## 12. Content integrity

- Do not invent portfolio metrics, testimonials, clients, guarantees, prices, or credentials.
- Preserve verified case-study claims and their context.
- Mark unfinished content clearly as draft/TBD in internal data; hide it from public production when appropriate.
- Final price, duration, scope, revision, cancellation, refund, review-period, tax, and recurring-billing rules require owner approval.

## 13. Non-functional requirements

- Responsive from small mobile to desktop.
- Semantic HTML and keyboard accessibility.
- Visible focus states and minimum 44 px interactive targets.
- Reduced-motion support.
- Appropriate color contrast.
- Private files must not use permanently public URLs.
- Secrets remain server-side.
- Input validation on client and server.
- Webhook signature verification and idempotent processing.
- Backups, monitoring, error reporting, and recovery procedures before production commerce.
- Reasonable Core Web Vitals and optimized media.
- English is the default public and application language; Indonesian maintains factual and feature parity without duplicating business logic.

## 14. Success measures

### Acquisition

- Qualified service inquiries.
- Service-detail visits and CTA engagement.
- Portfolio-to-service journey completion.

### Commerce

- Checkout completion rate.
- Verified payment rate.
- Brief completion rate.
- Time from payment to approved brief.

### Delivery

- On-time delivery rate after brief approval.
- Revision frequency and causes.
- Order completion rate.
- Refund and cancellation rate.

### Trust and quality

- Case-study engagement.
- Client satisfaction or approved testimonials when available.
- Support issues caused by unclear scope or policy.

No KPI target is final until a baseline exists.

## 15. Release roadmap

| Phase | Outcome |
| --- | --- |
| 0 | Repository and product audit |
| 0.5 | Local typography migration and build remediation — completed |
| 1A | Adam's Work brand, content, design-system, accessibility foundation |
| 1B | Documentation-only language-direction alignment; no runtime changes |
| Staging gate | Stable staging environment after Phase 1B and before Phase 2 |
| 2 | Implement the English-first multipage bilingual public website |
| 3 | Approved bilingual services, packages, pricing, FAQs, and policies |
| 4 | Authentication, order model, checkout shell, and working staging workflow |
| Midtrans onboarding | Register using functional public staging after Phase 4 |
| 5 | Midtrans Sandbox and verified webhook flow |
| 6 | Client portal, admin workspace, team assignments, files, messages, and delivery |
| 7 | Production hardening, production payment activation, launch, and monitoring |

## 16. Midtrans readiness gate

Midtrans onboarding begins only when the staging website is publicly accessible and demonstrates:

- Clear business and service description.
- Orderable services with prices in IDR.
- Working order and checkout journey.
- Payment page under the Adam's Work website experience.
- Terms and Conditions.
- Cancellation and Refund Policy.
- Business contact information.
- No broken or misleading commerce flow.

## 17. Open decisions

- Service-specific terms not covered by the approved Phase 2C.2 policy estimates/revisions or an accepted custom offer.
- Future recurring billing mechanics for monthly services; no automatic subscription is implemented.
- Professional legal review of approved liability, dispute, and refund clauses before live payments; final provider-dependent privacy and retention details.
- Database, authentication, private storage, transactional email, and monitoring vendors.
- Licensing and onboarding requirements for Fikri Adam as individual operator; operator identity is approved.
- Tax treatment and invoice requirements.
- Service-level expectations and internal capacity.
- Timing for purchasing and promoting `adamswork.id`.

