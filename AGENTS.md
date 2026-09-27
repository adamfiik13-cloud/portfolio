# AGENTS.md — Adam's Work Repository Instructions

These instructions apply to automated coding agents working in this repository. User instructions in the active task take precedence.

## 1. Product context

Adam's Work is a personal-brand-led Web, SEO & Digital Growth Studio owned by Fikri Adam. It will combine a public portfolio and service catalogue with ordering, payment, a client workspace, and internal delivery tools.

It is **not** a public freelancer marketplace. Services are owned by Adam's Work and delivered by Fikri with an internal team. Public users may register only as clients.

Canonical product documents:

1. `PRD.md`
2. `DESIGN_SYSTEM.md`
3. `ARCHITECTURE.md`
4. This file

When documents conflict, prefer the most recent explicit user instruction, then the PRD, then Architecture, then Design System.

## 2. Locked brand decisions

- Brand: Adam's Work
- Descriptor: Web, SEO & Digital Growth Studio
- Tagline: Better digital work, built together.
- Principle: Clarity before execution.
- Founder: Fikri Adam — founder, strategist, and quality lead.
- Primary market: Indonesian SMEs.
- Secondary market: global clients entering Indonesia.
- Current domain: `adamswork.app`.
- Planned future domain: `adamswork.id`.
- Visual direction: black, red, off-white; editorial, modern, creative, simple.

## 3. Locked typography

- League Spartan: display, headings, metrics, CTA, badges.
- Alata Regular 400: public marketing navigation and short marketing copy.
- Source Sans 3: functional UI, forms, tables, statuses, legal copy, and long-form content.
- Fonts are self-hosted through `next/font/local`.
- Do not reintroduce Google Fonts or synthetic Alata bold/italic.

## 4. Lean development workflow

The user uses more than one AI tool and wants to conserve credits.

Therefore:

- Work from one phase-level prompt whenever possible.
- Inspect only files relevant to the task.
- Do not repeatedly summarize repository history.
- Do not create unsolicited audits, specimens, screenshots, reports, or documentation.
- Do not run multiple equivalent QA passes.
- Do not stop for small reversible implementation decisions.
- Consolidate related edits, validation, commit, push, and preview once per phase.
- User performs final visual, responsive, copy, and UX QA manually.
- Treat consolidated user feedback as one revision batch.

Stop and ask only when blocked by:

- Major product scope ambiguity.
- Security or privacy risk.
- Legal/commercial policy not approved by the owner.
- Destructive or irreversible action.
- Material architecture decision whose alternatives change cost or long-term behavior.
- Missing credentials or authority required for an external mutation.

## 5. Phase discipline

Implement only the active phase.

- Phase 1A: brand, content, design-system, accessibility foundation.
- Phase 2: public multipage and bilingual-ready experience.
- Phase 3: approved services, packages, pricing, FAQ, policies.
- Phase 4: authentication, orders, offers, checkout workflow.
- Midtrans onboarding: after functional Phase 4 staging.
- Phase 5: Midtrans Sandbox and payment reconciliation.
- Phase 6: client/admin/team workspace, files, messages, delivery.
- Phase 7: production hardening and launch.

Do not pull features forward merely because they are mentioned in future documents.

## 6. Content integrity

Never invent:

- Metrics or business results.
- Client names or projects.
- Testimonials.
- Prices, durations, scope, revision allowances, or guarantees.
- Legal, refund, cancellation, privacy, or tax rules.
- Certifications or team size.

Preserve verified portfolio evidence. Mark internal unknowns as `TBD` and hide incomplete claims from public production when appropriate.

## 7. Engineering boundaries

- Preserve Next.js and Vercel unless the user approves a change.
- Keep server-only logic and secrets out of client bundles.
- Enforce authorization on the server, not only in UI.
- Keep order, payment, refund, and brief statuses separate.
- Store immutable commercial snapshots on accepted packages/offers.
- Treat browser payment redirects as informational; verified webhook state is authoritative.
- Payment webhooks must be authenticated, idempotent, and amount/order validated.
- Private client files must not be placed in public assets.
- Do not commit secrets or production user data.
- Do not select a database, auth, storage, email, or monitoring vendor without the phase requiring it and enough information to decide.

## 8. UI and accessibility boundaries

- Follow `DESIGN_SYSTEM.md`.
- Maintain semantic HTML, keyboard access, visible focus, reduced motion, and responsive wrapping.
- Aim for at least 44 px interactive targets.
- Avoid horizontal document overflow.
- Check contrast when changing text or surface colors.
- Public pages should feel editorial, not like a dense SaaS dashboard.
- Authenticated interfaces may be denser but must prioritize clarity and status.

## 9. Repository hygiene

- Inspect current branch, status, and relevant instructions before editing.
- Preserve unrelated user changes in a dirty working tree.
- Do not use destructive Git commands unless explicitly authorized.
- Prefer focused changes over broad rewrites.
- Add dependencies only when necessary and explain material additions.
- Keep environment-specific values out of source.
- Update `.env.example` when new variables are introduced, without real secrets.
- Add an ADR only for a material architectural choice; keep it concise.

## 10. Required validation

For normal phase work, run only:

1. Lint.
2. Type-check.
3. Fresh production build.
4. One focused smoke test for changed critical paths.

Add targeted tests when the change affects authentication, authorization, payments, state transitions, private files, or destructive operations.

Do not generate large screenshot sets or lengthy QA reports unless explicitly requested. Report exact failures concisely and stop only when the failure blocks safe continuation.

## 11. Git and preview workflow

- Work on the phase branch specified by the user.
- Prefer one meaningful commit per phase or approved revision batch.
- Do not merge to `main` without explicit approval.
- Produce one Vercel Preview after phase implementation is ready for manual review.
- Branch previews are not the stable staging environment.
- Stable staging is configured at the roadmap gate and must use non-production services and credentials.

## 12. Response format

Unless the user asks otherwise, final implementation reports must be concise:

```text
Status: completed | blocked

Implemented:
- ...

Changed:
- path/file

Validation:
- Lint: pass/fail
- Type-check: pass/fail
- Build: pass/fail
- Smoke test: pass/fail

Placeholders or decisions needed:
- ...

Commit:
Vercel Preview:
```

Do not paste full logs unless necessary to diagnose a failure.

## 13. Manual QA handoff

The user will manually review:

- Desktop and mobile appearance.
- Copy and claims.
- Spacing and hierarchy.
- Brand consistency.
- Navigation and CTA behavior.
- Portfolio evidence.

After providing the preview, stop. Do not start the next phase until the user approves the checkpoint.

