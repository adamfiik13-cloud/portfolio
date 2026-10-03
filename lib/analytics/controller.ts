import { gtmHost, measurementHost, publicPage, validGtmId, type AnalyticsConsent, type PublicPage, type PublicPageEvent } from "./rules.ts"

export interface AnalyticsPorts {
  hostname: string
  gtmId?: string
  productionEnabled: boolean
  pages: readonly PublicPage[]
  consent: (command: "default" | "update", value: AnalyticsConsent) => void
  load: (id: string) => void
  push: (event: PublicPageEvent) => void
  clearCookies: () => void
  reload: () => void
}

export function createAnalyticsController(ports: AnalyticsPorts) {
  let loaded = false, stopped = false, lastPath = ""
  let googleConsent: AnalyticsConsent = "denied"
  const deny = () => {
    if (!loaded || stopped) return
    stopped = true
    ports.consent("update", "denied")
    ports.clearCookies()
    // Removing a script cannot stop Google's already installed timers/listeners.
    // Start a clean document after revocation or leaving the public allowlist.
    ports.reload()
  }
  return {
    sync(path: string, choice: AnalyticsConsent | null) {
      const page = publicPage(path, ports.pages)
      if (!page || choice !== "granted") { deny(); return }
      if (stopped || !gtmHost(ports.hostname) || !validGtmId(ports.gtmId)) return
      const measure = measurementHost(ports.hostname, ports.productionEnabled)
      const nextConsent = measure ? "granted" : "denied"
      if (!loaded) {
        ports.consent("default", "denied")
        ports.consent("update", nextConsent)
        googleConsent = nextConsent
        loaded = true
        ports.load(ports.gtmId)
      } else if (googleConsent !== nextConsent) {
        ports.consent("update", nextConsent)
        googleConsent = nextConsent
      }
      // Staging is container QA only: no application measurement events at all.
      if (measure && lastPath !== page.page_path) {
        lastPath = page.page_path
        ports.push({ event: "public_page_view", ...page })
      }
    },
    deny,
    isLoaded: () => loaded,
  }
}
