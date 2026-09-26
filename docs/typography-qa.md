# Typography visual QA checkpoint

Status: implementation and build checks passed; ready for user visual review. Broader Phase 1A is paused at the requested approval checkpoint. The follow-up below supersedes the initial zoom limitation and uncommitted status.

## Follow-up: actual 200% zoom and preview preparation

The user enabled browser zoom at 200%. Verified in Chromium: a requested viewport width of 1440 produced `innerWidth: 720` with devicePixelRatio approximately 2; this was actual browser zoom, not CSS zoom. Both homepage and specimen were tested at these dimensions:

| Width before zoom | Layout width at 200% | Homepage | Specimen |
| ---: | ---: | --- | --- |
| 360 | 180 | No horizontal/text overflow after fixes | No horizontal/text overflow |
| 768 | 384 | No horizontal/text overflow | No horizontal/text overflow |
| 1440 | 720 | No horizontal/text overflow | No horizontal/text overflow |

Additional 200% checks used layout widths of exactly 360, 768, and 1440 CSS px (outer viewport settings 720, 1536, 2880). All passed the same document/text overflow checks. At 180 CSS px some words necessarily wrap internally; this is a stress test, not the intended standard mobile layout. See `typography-zoom-results.json` for measured dimensions.

Necessary fixes: allow long words and badges to wrap at extremely narrow widths; stack narrow hero stats/contact details; keep portrait labels in flow below 360 CSS px; wrap contact values instead of truncating them; constrain CTA width; make the mobile menu vertically scrollable. The shared anchor button now forwards its existing `onClick` so the menu's View Selected Work CTA actually closes the menu and navigates. Its target is unchanged. Menu/close controls and CTA have at least 44 px height; explicit focus outlines remain visible. Desktop nav at 768 CSS px has separate non-overlapping logo, links and CTA.

Keyboard checks: modal autofocus, Tab to its CTA with visible outline, Escape close; specimen name field to email field via Tab with visible outline. Mobile menu open and its selected-work CTA close were exercised. No clipping or overlap was observed in the inspected loaded views. Alata body text and Source Sans 3 form/table/status/long-form/legal examples remain distinct and readable at regular layout widths. Legal text is expressly illustrative, not an adopted policy.

No obvious font-induced layout shift was observed after the pages settled. Existing entrance animations remain; numeric cold-load CLS is still deferred, and this is not a zero-CLS claim.

Lint, nonincremental type-check and fresh production build passed after the fixes. Production preview smoke checks confirmed the homepage, specimen, real italic and Source Sans 3 legal copy. Font files and specimen HTML are included in the Next server trace.

The new `/typography-checkpoint` review route serves only the specimen and four allowlisted fonts, sends noindex/no-store headers, and returns 404 on Vercel Production. It is available locally and on Vercel Preview. `next.config.ts` includes explicit tracing for these review assets. No commerce, auth, content model or marketing route migration was introduced.

The complete typography change is prepared as one dedicated commit on `phase-1a/adams-work-foundation`. Commit hash, push result, deployment URL and final working-tree status are reported in the task response, since the final hash cannot be embedded in its own commit.

Updated screenshots in the workspace evidence directory: `production-home-zoom200-layout180.png`, `production-home-zoom200-layout768.png`, and `production-specimen-zoom200-legal.png`. Earlier `home-zoom200-*.png` captures include resize/entrance-transition frames and should not be used as final visual evidence.

## Initial checkpoint record (historical)

## Validation results

- ESLint without cache: passed.
- TypeScript with `--noEmit --incremental false`: passed.
- Fresh Next.js production build: passed after the final glyph adjustment.
- Active source scan: no `next/font/google`, Google font service URLs, `--font-inter`, or `--font-playfair` tokens.
- Git diff whitespace validation: passed; Git reports normal Windows LF/CRLF conversion warnings.
- Data, dependency manifest/lockfile, public assets, page composition, robots, sitemap, and Next configuration have no changes.
- Browser observed all four local WOFF2 assets; only League Spartan and Alata are preloaded. Source Sans 3 upright and italic have real uses.
- Final desktop (1440 px) and mobile (390 px) DOM checks: no document horizontal overflow and no Alata element requesting unsupported weight/style.
- Representative GroPerti modal opens and closes successfully in the final production preview. This is not an exhaustive interaction test of all six projects.

## Visual observations

League Spartan changes the character and word wrapping of display text. The hero retained three lines in the inspected desktop and mobile references; measured heading heights remained 198 px and 118.8 px respectively. No spacing or layout composition changes were needed. Alata gives marketing paragraphs a distinct rounded texture; Source Sans 3 separates dense modal and functional text from marketing copy.

Inspected evidence covers desktop/mobile hero and navigation, section text, project cards, modal content, buttons/badges, bilingual text, and nonfunctional input/label, validation, status, and table specimens. No clipping or horizontal document overflow was observed at the checked widths (1440, 390, and 720 px). The mobile specimen table fits its available width.

Glyph inspection found League Spartan did not contain the existing northeast arrow in the Bali location label. That small functional label now explicitly uses Source Sans 3, which includes the glyph. Final browser inspection confirms this family. Existing italic quotations use genuine Source Sans 3 italic. Alata remains normal 400 and font synthesis is disabled.

## Limits of the evidence

- Browser zoom keyboard shortcuts did not change the browser's measured viewport/device ratio. The 720 px reflow screenshots are a layout proxy only, **not proof of actual 200% browser zoom**. Actual zoom must still be checked before declaring the complete visual QA checklist passed.
- No numeric CLS/cold-load performance measurement was collected. Stable loaded screenshots do not establish zero layout shift; `font-display: swap` can still produce transient changes.
- Before screenshots came from the existing public portfolio. Its deployed commit was not verified against the local baseline. The original local baseline build remains failed, as documented in the migration report.
- Form/status/table examples are review specimens only; they do not submit or persist data.

## Evidence index

Screenshots are local workspace review artifacts outside the application Git root, in `../../typography-checkpoint/`.

| Evidence | Files |
| --- | --- |
| Old-font reference | `before-desktop.png`, `before-mobile.png` |
| Final hero/navigation | `after-desktop.png`, `after-mobile.png`, `after-mobile-navigation.png` |
| Cards and detail | `after-project-cards.png`, `after-modal-desktop.png`, `after-modal-detail.png`, `after-modal-mobile.png` |
| Bilingual marketing specimen | `specimen-desktop.png`, `specimen-mobile.png` |
| Functional UI specimen | `specimen-ui-desktop.png`, `specimen-ui-mobile.png`, `specimen-table-mobile.png` |
| Reflow proxy, not actual zoom | `after-reflow-720.png`, `specimen-reflow-720.png` |
| Observed font assets | `browser-font-resources.json` |

Final hero screenshots were refreshed after the Bali label font correction. Other representative screenshots were captured before that correction, which only affects the location label.

## Change inventory

Modified: `README.md`, `app/layout.tsx`, `app/globals.css`, `components/layout/Navbar.tsx`, the seven existing files in `components/sections/`, and `components/ui/Badge.tsx`, `Button.tsx`, `ProjectModal.tsx`.

Created: four WOFF2 files, three upstream license notices and provenance README under `app/fonts/`; `docs/typography-migration.md`, `docs/typography-qa.md`, `docs/typography-checkpoint.html`; `scripts/typography-preview.mjs`.

Branch: `phase-1a/adams-work-foundation`. HEAD remains `96d78a3`. Changes are uncommitted. No push or deployment was performed.
