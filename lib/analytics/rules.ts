export type AnalyticsConsent = "granted" | "denied"
export const CONSENT_KEY = "adamswork.analytics-consent.v1"
export const COOKIE_SETTINGS_EVENT = "adamswork:cookie-settings"
export interface PublicPage {
  page_path: string
  page_title: string
  locale: "en" | "id"
  content_type: "home" | "catalog" | "service" | "policy"
  content_category: string
}
export type PublicPageEvent = PublicPage & { event: "public_page_view" }

export function parseConsent(value: unknown): AnalyticsConsent | null {
  return value === "granted" || value === "denied" ? value : null
}

export function readConsent(storage: Pick<Storage, "getItem">): AnalyticsConsent | null {
  try { return parseConsent(storage.getItem(CONSENT_KEY)) } catch { return null }
}

export function saveConsent(storage: Pick<Storage, "setItem">, choice: AnalyticsConsent): boolean {
  try { storage.setItem(CONSENT_KEY, choice); return true } catch { return false }
}

export function normalizePath(path: string): string {
  // Only relative paths: never accept a URL, arbitrary encoding, query or fragment.
  const clean = path.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/"
  return /^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*$/.test(clean) ? clean : ""
}

export function excludedRoute(path: string): boolean {
  const clean = normalizePath(path)
  const excluded = ["/login", "/register", "/forgot-password", "/reset-password", "/account", "/auth", "/id/masuk", "/id/daftar", "/id/lupa-password", "/id/atur-ulang-password", "/id/akun", "/id/auth"]
  return !clean || excluded.some(prefix => clean === prefix || clean.startsWith(prefix + "/"))
}

export function publicPage(path: string, pages: readonly PublicPage[]): PublicPage | null {
  if (excludedRoute(path)) return null
  const clean = normalizePath(path)
  const page = pages.find(page => page.page_path === clean)
  // Reconstruct the allowlisted shape; never spread router, form or user state.
  return page ? { page_path: clean, page_title: page.page_title, locale: page.locale, content_type: page.content_type, content_category: page.content_category } : null
}

export function validGtmId(id: string | undefined): id is string {
  return !!id && /^GTM-[A-Z0-9]{4,20}$/.test(id)
}

export function gtmHost(hostname: string): boolean {
  return hostname === "adamswork.app" || hostname === "staging.adamswork.app"
}

export function measurementHost(hostname: string, productionEnabled: boolean): boolean {
  return productionEnabled && hostname === "adamswork.app"
}

// Only GA4's first-party cookie names. Authentication/session cookies are untouched.
export function gaCookieNames(cookie: string): string[] {
  return cookie.split(";").map(part => part.trim().split("=", 1)[0]).filter(name => /^_ga(?:_[A-Za-z0-9]+)?$/.test(name))
}
