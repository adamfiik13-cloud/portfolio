# Adam's Work — Design System

**Status:** Foundation specification  
**Version:** 1.1\
**Last updated:** 27 September 2026

## 1. Design principles

1. **Clarity before decoration** — every element must help users understand, decide, or act.
2. **Proof before promise** — case studies, process, scope, and outcomes carry more weight than promotional claims.
3. **Strategic and practical** — strong hierarchy paired with plain language and useful detail.
4. **Personal, not informal** — Fikri Adam remains visible as founder and quality lead while Adam's Work operates as the commercial brand.
5. **Creative restraint** — editorial composition and purposeful motion, without visual noise.
6. **Accessible by default** — readability, contrast, focus, motion preferences, and touch targets are foundational.

## 2. Brand hierarchy

- **Primary brand:** Adam's Work
- **Descriptor:** Web, SEO & Digital Growth Studio
- **Founder line:** Led by Fikri Adam, founder, strategist, and quality lead.
- **Tagline:** Better digital work, built together.
- **Principle:** Clarity before execution.

Do not present Adam's Work as a large agency, public marketplace, or independent freelancer directory.

## 3. Visual direction

- Dark editorial base.
- Black and near-black surfaces.
- Red as a selective action and emphasis color.
- Off-white rather than pure white for large light surfaces.
- Strong typography, generous spacing, restrained borders.
- Portfolio evidence should remain visually dominant.
- Cartoon avatar may identify Fikri; do not replace it with an invented photograph.
- Avoid excessive glow, glassmorphism, generic SaaS gradients, or dense dashboard styling on public pages.

## 4. Color tokens

Existing implemented colors should be mapped to semantic tokens before broad visual changes. Values below are working defaults and must be contrast-tested before finalization.

```css
:root {
  --color-bg: #09090b;
  --color-surface: #141416;
  --color-surface-elevated: #1b1b1f;
  --color-text: #f5f3ee;
  --color-text-muted: #b8b6b2;
  --color-border: #303036;
  --color-brand: #e52535;
  --color-brand-hover: #ff3345;
  --color-brand-subtle: #3a1117;
  --color-light-bg: #f2efe7;
  --color-light-text: #18181b;
  --color-success: #23865f;
  --color-warning: #b7791f;
  --color-danger: #d93d4f;
  --color-info: #356fa3;
}
```

Rules:

- Red is for primary CTA, important emphasis, selected states, and critical highlights—not long paragraphs.
- Status colors must include text or icons; color alone cannot carry meaning.
- Body text and interactive components must be checked against WCAG AA contrast.
- Muted text may not be made faint merely for aesthetics.

## 5. Typography

All fonts are self-hosted with `next/font/local`.

| Token | Font | Use |
| --- | --- | --- |
| `--font-display` | League Spartan variable 100–900 | Display headings, project names, metrics, CTA labels, badges |
| `--font-brand-body` | Alata Regular 400 | Public marketing navigation, short marketing paragraphs, summaries, footer |
| `--font-ui` | Source Sans 3 variable + genuine italic | Functional UI, forms, tables, status, legal, long-form, client/admin areas |

Rules:

- Never synthesize unsupported Alata bold or italic.
- Prefer League Spartan or Source Sans 3 semibold for emphasis.
- Marketing body using Alata should normally be at least 16 px.
- Dense content and legal text use Source Sans 3.
- Use genuine Source Sans 3 italic only where italic communicates meaning.

### Suggested type scale

```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: clamp(1.5rem, 2vw, 2rem);
--text-3xl: clamp(2rem, 4vw, 3.5rem);
--text-display: clamp(3rem, 7vw, 6.5rem);
```

Maintain comfortable line lengths:

- Marketing paragraph: approximately 45–70 characters.
- Long-form content: approximately 55–75 characters.
- Legal copy: avoid full-width lines on desktop.

## 6. Spacing and layout

Use an 8 px-oriented scale with smaller increments where required.

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-12: 3rem;
--space-16: 4rem;
--space-24: 6rem;
--space-section: clamp(5rem, 10vw, 9rem);
```

Layout rules:

- Public pages use an editorial content rhythm, not a continuous grid of cards.
- One primary visual or message should dominate each section.
- Use consistent container widths and page gutters.
- Allow headings and badges to wrap safely.
- Do not introduce horizontal scrolling at supported viewport sizes.
- Commerce and portal interfaces may use denser layouts but must retain the brand typography and colors.

## 7. Borders, radius, and elevation

```css
--radius-sm: 0.5rem;
--radius-md: 0.875rem;
--radius-lg: 1.5rem;
--radius-pill: 999px;
--border-default: 1px solid var(--color-border);
```

- Use subtle elevation through surface contrast and borders before shadows.
- Strong shadows and glow should be rare.
- Large rounded containers are appropriate for selected work and major panels, not every text block.

## 8. Core components

### Button and link

Variants:

- Primary: red filled.
- Secondary: dark/light surface with visible border.
- Text/action link: clear label plus optional directional icon.
- Destructive: reserved for confirmed destructive actions in authenticated areas.

Requirements:

- Minimum interactive height: 44 px.
- Visible hover, active, disabled, loading, and keyboard-focus states.
- Labels describe the outcome: `View case study`, `Continue to payment`, `Submit brief`.
- Do not use ambiguous `Click here` labels.

### Badge and status

- Marketing badges use League Spartan.
- Operational status uses Source Sans 3.
- Status must combine text with shape/icon/color when useful.
- Order, payment, refund, and brief statuses must not be visually conflated.

### Card

- Case-study card: evidence image, category, title, concise context, verified outcome, action.
- Service card: intended outcome, fit, starting context if approved, link to full scope.
- Operational card: compact functional layout using Source Sans 3.

### Public service catalog

- Use image-led, full-link service cards with reusable 16:10 code-native category thumbnails, visible pricing and commercial models. Do not add seller, rating, or sales UI.
- Catalog order: introduction, localized search/category controls, editorial Featured Services, complete business catalog, then Career Services.
- Separate Career Services as additional support for individuals; keep business services prominent.
- Detail pages emphasize scope, scope-derived output expectations, exclusions, client inputs, and confirmed versus starting prices. Outputs must not imply guaranteed business outcomes.
- Use “Choose This Service”, “Book a Consultation”, or “Request a Quote” with equivalent Indonesian labels; clarify that Phase 2B opens WhatsApp and does not complete booking or payment.

### Public policy pages

- Use a shared narrow editorial layout with Source Sans 3 legal body copy, League Spartan headings, visible version/date information, and readable section spacing.
- Keep all clauses visible; use semantic lists, scoped table headers, wrapping table cells, and an accessible table of contents with stable section anchors. Do not use accordion-only legal content or sticky panels.
- Put localized policy links in a clearly labeled footer group; keep the primary header concise. Language switching maps equivalent policy pages and section IDs.
- Staging shows version 1.0 without inventing an effective date. Publication date is centrally configured during production promotion. Display an accurate shared notice for online features that are not yet available.

### Form

- Persistent label above control; placeholder is not the label.
- Help text and validation remain close to the field.
- Error messages explain how to correct the problem.
- Required fields are explicit.
- File upload communicates accepted formats, maximum size, privacy, and upload state.
- Preserve entered data when validation fails where safe.

### Table

- Source Sans 3 only.
- Semantic headings and scopes.
- Responsive strategy must be defined per table: horizontal container, stacked records, or reduced columns.
- Never hide critical payment/order information only to fit mobile.

### Modal/dialog

- Use only for focused tasks or concise case-study detail.
- Trap focus, provide an accessible name, support Escape, restore focus on close.
- Important service, policy, checkout, and case-study content should have permanent URLs rather than modal-only access.

### Navigation

- Public navigation stays concise.
- Mobile menu must be scrollable at high zoom and narrow layouts.
- Current page/state should be perceivable.
- Account/admin navigation must prioritize orientation and status over visual novelty.

## 9. Imagery and portfolio evidence

- Prefer authentic project screenshots and approved assets.
- Sensitive performance, cost, customer, listing, QR, location, and account data must be redacted.
- Do not fabricate dashboards or results.
- Maintain meaningful alt text based on image purpose.
- Decorative imagery uses empty alt text.
- Use responsive image formats and reserve dimensions to reduce layout shift.

## 10. Motion

Permitted:

- Subtle reveal.
- Short project transitions.
- Light avatar movement.
- Purposeful hover state.
- Limited counter animation.

Avoid:

- Scroll hijacking.
- Autoplay audio.
- Long page transitions.
- Constant decorative motion.
- Excessive custom cursor effects.

All nonessential motion must respect `prefers-reduced-motion`.

## 11. Accessibility baseline

- Semantic landmarks and heading order.
- Keyboard-operable navigation, controls, dialogs, and forms.
- Visible focus indicators.
- Minimum 44 px touch target where practical.
- WCAG AA color contrast for normal text and controls.
- Zoom/reflow support up to 200% without loss of content or function.
- Form errors identified in text and associated with fields.
- Status updates announced appropriately when asynchronous.
- Do not rely on color, position, or motion alone.

## 12. Content style

### Language direction and parity (target)

- Adam's Work remains an Indonesia-based Web, SEO & Digital Growth Studio. English is the default communication language for growing businesses and global companies, particularly those entering or operating in Indonesia. Indonesian serves Indonesian SMEs as the secondary audience.
- English home uses `/`; Indonesian home uses `/id`. Follow the equivalent-page mapping and international SEO requirements in `PRD.md` and `ARCHITECTURE.md`.
- The language switcher opens the equivalent translated page when available. Do not automatically redirect based on IP.
- Both languages provide equivalent service, portfolio, policy, and commerce information, facts, and features. Secondary language never means incomplete content or reduced functionality.
- Never use Indonesian copy on an English route except approved proper nouns. Never use English fallback as final public copy on Indonesian routes; missing translations must not silently render mixed-language content.
- Services, packages, case studies, FAQs, policies, and transactional labels use stable IDs and locale variants. Do not introduce locale-specific business logic.
- Translate navigation and accessible labels for the active locale. Preserve approved facts and commercial meaning with natural phrasing and safe text wrapping.
- Checkout and client area default to English and remain bilingual-ready. Transactional email should eventually follow the client's selected locale. Status values remain language-neutral; only display labels are translated. Admin may remain English for MVP.

Phase 1B is documentation-only; production copy and UI remain unchanged. Staging setup follows Phase 1B, Phase 2 implements the multipage bilingual public website, and Phase 3 delivers approved bilingual commercial and policy content. Later application phases remain bilingual-ready without duplicating domain logic.

Voice:

- Direct, calm, practical, evidence-led.
- Explain outcomes in language understood by non-specialists.
- Use `we` for Adam's Work delivery and `Fikri Adam` when founder accountability matters.
- Avoid pretending the business is larger than it is.

Preferred pattern:

1. Business problem.
2. Relevant evidence or context.
3. Recommended action.
4. Expected output or next decision.

Avoid:

- Empty superlatives.
- Excessive marketing jargon.
- Guarantees unsupported by evidence.
- Unverified numbers.
- Hidden exclusions or vague deliverables.

## 13. Design QA ownership

Phase 1B requires only Markdown and Git-diff validation, without visual QA or a Vercel Preview.

During implementation phases:

- Agent performs lint, type-check, build, and basic functional smoke tests.
- Fikri performs final visual, responsive, copy, and UX review from one Vercel Preview per phase.
- Visual findings should be consolidated into one revision batch.
- A new design token or component variant should be added only when reused or clearly required.

