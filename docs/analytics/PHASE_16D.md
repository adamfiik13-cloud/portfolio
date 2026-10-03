# Phase 16D — optional public analytics

## Boundary and configuration

- GTM container: `GTM-5HNJFLP7`. Current production GA4 property: `G-NQ5Q41KYSG`. Never use obsolete `G-D7GT4L2LHH`.
- One container/property; no second staging GA4 property. No dashboard/tag changes are made by this implementation.
- Set **`NEXT_PUBLIC_GTM_ID=GTM-5HNJFLP7` in Vercel Custom Environment staging only**, then redeploy staging: this public variable is compiled into the browser bundle. Missing/invalid configuration fails closed. Production configuration/promotion requires separate authorization.
- Loader requires explicit `granted`, a current allowlisted public route, valid container ID and exact hostname `adamswork.app` or `staging.adamswork.app`. Localhost and arbitrary preview hosts never load it. No noscript iframe, preconnect or Google font request is added.
- Measurement requires exact `adamswork.app` and a non-staging, non-preview server environment. Staging can load the container after acceptance, but Google analytics consent stays denied and no `public_page_view` is pushed. Staging is container/consent QA only, never production measurement.
- Staging-only CSP constrains connect/image/frame origins; GA/Ads collection origins are deliberately absent. Self and existing Supabase browser connectivity remain allowed; GTM and Tag Assistant are the only added connection origins, GTM/gstatic the added image origins. Script/style policies are not relaxed; no unsafe-eval is added. Production headers/SEO remain unchanged. Do not add collection domains to make a staging tag work.

## Consent and private-route isolation

- One versioned localStorage key: `adamswork.analytics-consent.v1`; only literal `granted` or `denied`. Absent, malformed or unreadable storage means no consent. A save failure keeps analytics off. No profiles, cookies or database store this choice.
- EN/ID non-modal, in-flow consent region follows the document, without covering public content. Equal accept/reject buttons, localized Privacy link, footer Cookie settings, optional Escape/close for an existing choice. Reopening focuses the region and closing returns focus to the footer. No animation or focus trap.
- Default consent is queued before GTM; advertising storage/user data/personalization always denied. Only production analytics can become granted. Revocation queues denied, removes accessible `_ga`/`_ga_*` first-party cookies (not Auth cookies), and reloads the document to terminate installed listeners/timers. Cookie deletion cannot reach HttpOnly or inaccessible path cookies. Other tabs react to preference changes.
- Exact public allowlist is derived from stable home/catalog/service/policy data. Unknown/future routes are excluded until explicitly approved. All `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`, `/auth/*`, `/id/masuk`, `/id/daftar`, `/id/lupa-password`, `/id/atur-ulang-password`, `/id/akun`, `/id/auth/*` routes and descendants are excluded.
- Entering a private route from a GTM document uses full-document navigation, including intercepted history changes; private links bypass delegated click handlers. A fallback denies/reloads on private history traversal. Private documents have no loader/events and do not change the stored preference. Returning public may restore it. Auth handlers, sessions and provider configuration are unchanged.
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
- Clear only the consent key; verify no Google network/script before a choice. Reject, reload, reopen, accept, reload, revoke, reaccept; confirm only granted/denied persists and authentication remains intact. Repeat in another tab and with browser storage disabled.
- Tag Assistant: container appears only after acceptance on allowed staging public pages and disappears after revocation reload. No GA4 collection requests, Google tags or production GA4 measurement on staging. CSP violations from measurement indicate a misconfigured container, not a reason to allow those endpoints.
- Navigate homes, catalogs, services and policies; staging has no application measurement events. Test login/recovery/account navigation and back/forward; no container in private documents or private page/click/form/engagement events. Preview/localhost: no GTM.
- Inspect query/fragment stripping and duplicates with the focused unit suite; production measurement QA is deferred to an independently authorized rollout.
- Verify Privacy 1.1/date in both languages, other policies unchanged, canonical/hreflang, staging noindex/nofollow and empty sitemap.

## Disable / rollback

Remove `NEXT_PUBLIC_GTM_ID` from the relevant authorized environment and redeploy to disable container loads; revoking the browser preference also disables that browser immediately. Do not change production configuration during this stage. Revert the focused commit if needed; do not rewrite accepted policy history or relabel prior versions. Any later production tag publication needs its own review.
