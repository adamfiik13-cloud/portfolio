# Phase 16D — optional public analytics

## Boundary and configuration

- GTM container: `GTM-5HNJFLP7`. Approved final production GA4 Measurement ID: `G-NQ5Q41KYSG`; no other measurement ID is approved.
- One container/property; no second staging GA4 property. No dashboard/tag changes are made by this implementation.
- Staging configuration and consent QA were approved separately. This isolated production release is a manual analytics-only port from main, with no backend or authentication additions. `NEXT_PUBLIC_GTM_ID` is compiled into the browser bundle; missing/invalid configuration fails closed. This preparation does not set the production variable, publish GTM, merge main, or activate measurement.
- Loader requires explicit `granted`, a current allowlisted public route, valid container ID and exact hostname `adamswork.app` or `staging.adamswork.app`. Localhost and arbitrary preview hosts never load it. No noscript iframe, preconnect or Google font request is added.
- Measurement requires exact `adamswork.app` and a non-staging, non-preview server environment. Staging can load the container after acceptance, but Google analytics consent stays denied and no `public_page_view` is pushed. Staging is container/consent QA only, never production measurement.
- Staging-only CSP constrains connect/image/frame origins; GA/Ads collection origins are deliberately absent. Self remains allowed; GTM and Tag Assistant are the only added connection origins, GTM/gstatic the added image origins. Script/style policies are not relaxed; no unsafe-eval is added. Production headers/SEO remain unchanged. Do not add collection domains to make a staging tag work.

## Consent and private-route isolation

- One versioned localStorage key: `adamswork.analytics-consent.v1`; only literal `granted` or `denied`. Absent, malformed or unreadable storage means no consent. A save failure keeps analytics off. No profiles, cookies or database store this choice.
- EN/ID non-modal banner is fixed to the viewport bottom and immediately visible after hydration. Accept is primary; Continue without analytics remains directly visible as an outlined secondary action. Copy scrolls separately at extreme zoom; a measured spacer keeps the footer reachable. Localized Privacy link, footer Cookie settings, optional Escape/close for an existing choice. Reopening focuses the region and closing returns focus to the footer. No animation, backdrop or focus trap. This UI-only revision does not change policy version/date or data processing.
- Default consent is queued before GTM; advertising storage/user data/personalization always denied. Only production analytics can become granted. Revocation queues denied, removes accessible `_ga`/`_ga_*` first-party cookies (not Auth cookies), and reloads the document to terminate installed listeners/timers. Cookie deletion cannot reach HttpOnly or inaccessible path cookies. Other tabs react to preference changes.
- Exact public allowlist is derived from stable home/catalog/service/policy data. Unknown/future routes are excluded until explicitly approved. All `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`, `/auth/*`, `/id/masuk`, `/id/daftar`, `/id/lupa-password`, `/id/atur-ulang-password`, `/id/akun`, `/id/auth/*` routes and descendants are excluded.
- Entering a private route from a GTM document uses full-document navigation, including intercepted history changes; private links bypass delegated click handlers. A fallback denies/reloads on private history traversal. Private documents have no loader/events and do not change the stored preference. Returning public may restore it. These are preventive route guards; this isolated release introduces no Auth handlers, sessions or provider configuration.
- Code cannot police arbitrary future container JavaScript or third-party listeners. Keep the container restricted to the approved tags below; no broad click/form/history/engagement listeners or custom HTML tags. Manual Tag Assistant/network checks remain a release gate.

## Data layer and future GTM configuration (manual, not published)

Only `public_page_view` with `page_path`, `page_title`, `locale`, `content_type`, `content_category`; all values come from static public content. Queries/fragments, raw document title/referrer, email/name/user IDs, passwords/tokens, forms, messages/files, orders/payments and commerce/Auth events are prohibited. Consecutive same-path rerenders/query changes do not duplicate events; A → B → A records legitimate navigation.

Later configure the Google tag for **`G-NQ5Q41KYSG`**, with:

1. Production hostname equals `adamswork.app`, allowlisted `public_page_view` trigger and an additional required `analytics_storage` consent check. Built-in denied consent alone can still allow cookieless pings: do not rely on it as the firing restriction.
2. No automatic page view (`send_page_view: false`), history trigger or All Pages/initialization measurement trigger. Disable Enhanced Measurement and automatic engagement/form/click tracking for this foundation. Configure only the explicit sanitized page-view event.
3. Explicit sanitized `page_location` = `https://adamswork.app` + `page_path`, static `page_title`, empty `page_referrer`. Do not read raw Page URL/referrer/query variables, propagate User ID or enable user-provided data. Never transmit debug query parameters.
4. No staging/private events or tags; no first-party/server-side measurement proxy, Ads tag, marketing/custom HTML or additional vendor.
5. Retention 14 months for event/user exploration data, reset on new activity off; Signals/user-provided data/Ads linking/personalization off. These are owner-confirmed settings, not dashboard verification performed here.

Reference: Google's [basic consent guidance](https://developers.google.com/tag-platform/security/guides/consent) and [CSP domain guidance](https://developers.google.com/tag-platform/security/guides/csp). Tag Manager templates should use its consent APIs if a template is later approved; this foundation queues consent before loading any container.

## Policy metadata and manual QA

Privacy EN/ID: 1.1, 4 October 2026 / 4 Oktober 2026. Terms/Service/Refund: 1.0, 28 September 2026 / 28 September 2026. Stable clause IDs and SEO mappings remain unchanged. Future immutable commerce acceptance must snapshot applicable per-policy metadata; no acceptance records are created now.

After setting the staging variable and redeploying:

- Check EN/ID banner, localized Privacy links and equivalent buttons. Check keyboard focus, touch targets, mobile and 200% zoom; content must remain accessible.
- Clear only the consent key; verify no Google network/script before a choice. Reject, reload, reopen, accept, reload, revoke, reaccept; confirm only granted/denied persists and unrelated cookies remain intact. Repeat in another tab and with browser storage disabled.
- Tag Assistant: container appears only after acceptance on allowed staging public pages and disappears after revocation reload. No GA4 collection requests, Google tags or production GA4 measurement on staging. CSP violations from measurement indicate a misconfigured container, not a reason to allow those endpoints.
- Navigate homes, catalogs, services and policies; staging has no application measurement events. Private-route exclusions are covered by inert unit fixtures; this release has no login/recovery/account pages. When later introduced, test their navigation and back/forward with no container or private page/click/form/engagement events. Preview/localhost: no GTM.
- Inspect query/fragment stripping and duplicates with the focused unit suite; production measurement QA is deferred to an independently authorized rollout.
- Verify Privacy 1.1/date in both languages, other policies unchanged, canonical/hreflang, staging noindex/nofollow and empty sitemap.

## Preview connection audit — 4 October 2026

The owner observed consent already granted, `gtm.js` HTTP 200 and a Tag Assistant overlay, followed by Not Connected and a frame rejection for `vercel.live`. A fresh isolated staging browser verified no Google script before consent, then the single `adamswork-gtm` script after acceptance. It had no active owner Chrome/GTM Preview session, so it cannot reproduce that session's handshake. Actual staging headers: connect/image/frame CSP as above, no script/style/font/default restriction, and no COOP/COEP header. Current code preserves the page's debug query/session context; analytics path normalization affects only event payloads. It does not append or remove `gtm_auth`/`gtm_preview`, and their absence is not a diagnosis.

The traced application flow is: staging public allowlist → persisted or explicit granted choice → default denied/update denied for staging → dynamic `gtm.js` insertion → Google's session-specific debug/handshake code. That final session state, blocked request initiator, cookie acceptance, cache and browser-extension behavior are unavailable here. No evidence identifies a GTM handshake request blocked by this CSP. `vercel.live` is not a required origin in Google's published Preview CSP list; its observed rejection does not prove a GTM failure or Vercel Toolbar interference. No speculative CSP/loader patch was applied, no collection endpoint was allowed, and the container remains unpublished.

## Operator-reported staging QA closeout — 5 October 2026 WITA

The operator approved manual QA on `d5d1852b215d66df8e728fe20a8325a04d80dc77`. These are operator-reported results, not a new agent-run hosted test:

- Stage 16G.1: Tag Assistant connected successfully.
- Stage 16G.2: Tag Assistant Connected; container `GTM-5HNJFLP7`, Preview version.
- `Google Tag - GA4 - Production`: Not Fired. `GA4 Event - public_page_view`: Not Fired. Tags Fired: None.
- Staging `public_page_view`: absent. GA4 collect requests: 0.
- The earlier connection failure was not reproduced in a clean Preview session. Its historical root cause remains unproven; no loader or CSP patch is required.

The dynamic/basic-consent loader remains approved. Tag Assistant works in a clean Preview session; `vercel.live` was not added to CSP and GA4 collection endpoints remain excluded on staging. The earlier diagnostic request is closed by this successful operator QA. The container remains unpublished; no production activation is authorized by this closeout. Background references: [consent-gated connection](https://developers.google.com/tag-platform/security/guides/consent-debugging) and [same-browser Preview requirements](https://support.google.com/tagmanager/answer/6107056?hl=en).

## Deferred production activation

Preparation audit on 5 October 2026 reports six affected packages in the unchanged main lockfile: Next.js 16.3.3 (critical, [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j)) and the ESLint dependency chain through braces 3.0.3 (five high package findings, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). No `next/og`/`ImageResponse` usage was found in current public source; this is not an audit waiver. Dependencies remain untouched by this analytics-only port. Resolve the baseline advisories in a separate focused patch and rerun the audit before production activation; do not apply the suggested major ESLint downgrade automatically.

After separate release approval, an authorized operator must:

1. Set production `NEXT_PUBLIC_GTM_ID=GTM-5HNJFLP7`, then redeploy/promote the approved isolated release. Do not promote the unfinished staging backend.
2. Review the GTM/GA4 restrictions above and manually publish the approved container with only `G-NQ5Q41KYSG`. This preparation does not publish it.
3. Verify consent rejection produces no Google requests, acceptance produces only sanitized public events on `adamswork.app`, revocation stops measurement, private/unknown routes remain excluded, and EN/ID policy metadata and production SEO are correct.
4. Use the disable/rollback procedure if any activation check fails.

## Disable / rollback

Remove `NEXT_PUBLIC_GTM_ID` from the relevant authorized environment and redeploy to disable container loads; revoking the browser preference also disables that browser immediately. Do not change production configuration during this stage. Revert the focused commit if needed; do not rewrite accepted policy history or relabel prior versions. Any later production tag publication needs its own review.
