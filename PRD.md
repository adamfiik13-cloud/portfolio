# Adam's Work — Product Requirements Document

**Status:** Working product baseline  
**Version:** 1.0  
**Last updated:** 27 September 2026  
**Owner:** Fikri Adam  
**Current launch domain:** `adamswork.app`  
**Planned primary domain:** `adamswork.id`

## 1. Product summary

Adam's Work is a personal-brand-led digital services platform. It combines a credible portfolio, a service catalogue, ordering and payment, and a private workspace where clients and the internal team can complete projects.

All services belong to Adam's Work and are delivered by Fikri Adam with an internal team. The platform is not a public freelancer marketplace. Fiverr is only a reference for the ordering workflow.

## 2. Brand foundation

| Item | Decision |
| --- | --- |
| Brand | Adam's Work |
| Descriptor | Web, SEO & Digital Growth Studio |
| Tagline | Better digital work, built together. |
| Operating principle | Clarity before execution. |
| Brand lead | Fikri Adam — founder, strategist, and quality lead |
| Character | Strategic, practical, personal, collaborative |
| Primary market | Indonesian SMEs |
| Secondary market | Global clients entering Indonesia |

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

### 5.1 Indonesian SME decision-maker

Needs understandable services, transparent scope, Rupiah pricing, local communication, visible proof, and a simple order process.

### 5.2 Global client entering Indonesia

Needs a bilingual experience, local market context, credible execution, clear deliverables, and a structured way to commission work.

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

The first commercial categories are:

1. **Website Development**
2. **SEO**

Supporting capabilities such as paid media, analytics, landing pages, and digital strategy remain visible as expertise and portfolio evidence. They must not be presented as purchasable launch packages until scope, price, duration, and revision rules are approved.

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

- Responsive bilingual-ready public experience.
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
- Indonesian is the initial commercial language; architecture should support English without duplicating business logic.

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
| Staging gate | Stable staging environment after Phase 1A and before Phase 2 |
| 2 | Public multipage and bilingual-ready experience |
| 3 | Approved services, packages, pricing, FAQs, and policies |
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

- Final Website Development packages, prices, timelines, revisions, and exclusions.
- Final SEO packages and whether billing is one-time or recurring.
- Cancellation, refund, review-period, and automatic completion rules.
- Database, authentication, private storage, transactional email, and monitoring vendors.
- Legal entity and merchant identity used for payment onboarding.
- Tax treatment and invoice requirements.
- Exact bilingual URL strategy.
- Service-level expectations and internal capacity.
- Timing for purchasing and promoting `adamswork.id`.

