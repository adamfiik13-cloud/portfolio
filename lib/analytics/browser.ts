import { analyticsPages } from "@/data/analytics"
import { createAnalyticsController } from "./controller"
import { gaCookieNames, publicPage } from "./rules"

type AnalyticsController = ReturnType<typeof createAnalyticsController>
type AnalyticsWindow = Window & { dataLayer?: unknown[]; adamsworkAnalytics?: AnalyticsController }

export function browserAnalytics(productionEnabled: boolean): AnalyticsController {
  const browser = window as AnalyticsWindow
  if (browser.adamsworkAnalytics) return browser.adamsworkAnalytics
  const push = (value: unknown) => { (browser.dataLayer ??= []).push(value) }
  const controller = createAnalyticsController({
    hostname: location.hostname,
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    productionEnabled,
    pages: analyticsPages,
    consent(command, value) {
      // gtag command queue format (Arguments, not a custom consent event).
      function gtag(...args: unknown[]) {
        void args
        // Google's documented command protocol uses an Arguments object.
        // eslint-disable-next-line prefer-rest-params
        push(arguments)
      }
      gtag("consent", command, { analytics_storage: value, ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" })
    },
    load(id) {
      if (document.getElementById("adamswork-gtm")) return
      installNavigationBoundary(controller)
      push({ "gtm.start": Date.now(), event: "gtm.js" })
      const script = document.createElement("script")
      script.id = "adamswork-gtm"
      script.async = true
      script.referrerPolicy = "no-referrer"
      script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(id)
      document.head.appendChild(script)
    },
    push,
    clearCookies() {
      const domains = ["", location.hostname, "." + location.hostname, "adamswork.app", ".adamswork.app"]
      const parts = location.pathname.split("/").filter(Boolean)
      const paths = ["/", ...parts.map((_, index) => "/" + parts.slice(0, index + 1).join("/"))]
      for (const name of gaCookieNames(document.cookie)) for (const domain of domains) for (const path of paths) {
        document.cookie = `${name}=; Max-Age=0; Path=${path};${domain ? " Domain=" + domain + ";" : ""} SameSite=Lax; Secure`
      }
    },
    reload: () => location.reload(),
  })
  browser.adamsworkAnalytics = controller
  return controller
}

// A public document containing GTM must never become a private SPA document.
// Native navigation isolates future private pages without introducing Auth code.
function installNavigationBoundary(controller: AnalyticsController) {
  const isPrivateDestination = (url: string | URL | null | undefined) => {
    if (url == null) return false
    const target = new URL(url, location.href)
    return target.origin === location.origin && !publicPage(target.pathname, analyticsPages)
  }
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method].bind(history)
    history[method] = (data, unused, url) => {
      if (isPrivateDestination(url)) {
        // The URL has not changed: no private URL enters Google's SPA listeners.
        location.assign(new URL(url!, location.href).href)
        return
      }
      original(data, unused, url)
    }
  }
  window.addEventListener("popstate", () => {
    if (!publicPage(location.pathname, analyticsPages)) controller.deny()
  }, { capture: true })
  document.addEventListener("click", event => {
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null
    if (!(anchor instanceof HTMLAnchorElement) || !isPrivateDestination(anchor.href)) return
    // Exclude framework/tag delegated click handling on private destinations.
    event.stopImmediatePropagation()
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && anchor.target !== "_blank") {
      event.preventDefault()
      location.assign(anchor.href)
    }
  }, { capture: true })
}
