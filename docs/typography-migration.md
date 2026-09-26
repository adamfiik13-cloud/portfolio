# Typography migration checkpoint

Follow-up: actual 200% zoom and responsive fixes are documented in [Typography QA](./typography-qa.md). The user authorized a dedicated commit, branch push and Vercel Preview. The review specimen now also has a preview-only `/typography-checkpoint` route; production marketing content remains unchanged. Statements below about the initial local-only checkpoint describe the earlier state.

## Scope and original baseline

This is the separately approved typography migration and build remediation, not the broader Phase 1A brand/content/architecture refactor.

- Original branch: `main`.
- Original commit: `96d78a3` (`fix: keep RevoU badge clear of mobile portrait`).
- Original working tree: clean.
- Original lint: passed.
- Original type-check: passed.
- Original fresh production build: **failed** while `next/font/google` fetched Inter and Playfair Display. Errors were `Failed to fetch Inter from Google Fonts` and `Failed to fetch Playfair Display from Google Fonts`.
- No source changes had been made at the original failed-baseline checkpoint. Generated `.next` artifacts were produced by that build attempt.
- Focused development branch: `phase-1a/adams-work-foundation`.

The new user decision supersedes the previous font choice. Inter and Playfair Display have been removed from active font imports, variables, and component styles.

## Implementation

`app/layout.tsx` now uses only `next/font/local`. `app/globals.css` defines semantic aliases and disables synthetic styles. Component changes are typography only: display family on headings/strong labels; Alata regular on marketing navigation/body; Source Sans 3 on modal long-form content and functional text. Existing italic quotations retain genuine italic via Source Sans 3.

See [font provenance, licenses, weights and checksums](../app/fonts/README.md).

No project data, metrics, claims, images, section order, navigation destinations, brand colors, domain metadata, environment configuration, dependency manifest/lockfile, authentication, payment, database, or deployment settings were changed. Existing interaction limitations from Phase 0 are intentionally not repaired in this focused task.

No new production route was introduced. `docs/typography-checkpoint.html` is an isolated, nonfunctional specimen served by a local-only server. Its Indonesian/English sample text is review material, not a change to the homepage copy or an approved service/policy catalog. The text “Adam’s Work” is a font specimen, not final logo artwork.

## Local review

Run the built portfolio:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 4173
```

Run the independent specimen:

```sh
node scripts/typography-preview.mjs
```

Open `http://127.0.0.1:4173` for the portfolio and `http://127.0.0.1:4174` for bilingual headings, paragraphs, buttons, badges, labels, fields, validation, status, table, and genuine italic. The specimen server exposes only its HTML and four font files, binds to loopback, and sends noindex headers. No form submits or persists data.

## Validation commands

```sh
node node_modules/eslint/bin/eslint.js . --no-cache
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/next/dist/bin/next build
```

All three passed after migration. The fresh production build ran successfully in the restricted environment where the original Google Fonts fetch failed. The resulting route set remains `/`, `/_not-found`, `/robots.txt`, and `/sitemap.xml`.

Source inspection confirms no active `next/font/google`, old font variables, or external font URLs. The four emitted WOFF2 files resolve from `/_next/static/media/`. Browser asset inventory observes all four locally; only Alata and League Spartan appear as font preload links. Both Source Sans 3 faces are actually used, so their local downloads are expected.

## Review boundaries

Broader Phase 1A work must wait for user approval of this typography checkpoint. In particular, do not treat this migration as approval to change brand copy, domains, architecture, accessibility behavior unrelated to typography, or commerce features.

Screenshot evidence and detailed QA results are recorded separately in the workspace `typography-checkpoint` directory. The old-font visual reference is the existing public portfolio; it is not proof that its deployed commit equals the local baseline. The original local baseline build remains recorded as failed.
