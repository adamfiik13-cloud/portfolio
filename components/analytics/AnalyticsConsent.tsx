"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { analyticsCopy, analyticsPages } from "@/data/analytics"
import { policyDefinitions } from "@/data/policies/config"
import { browserAnalytics } from "@/lib/analytics/browser"
import { CONSENT_KEY, COOKIE_SETTINGS_EVENT, parseConsent, publicPage, readConsent, saveConsent, type AnalyticsConsent } from "@/lib/analytics/rules"

export default function AnalyticsConsent({ productionEnabled }: { productionEnabled: boolean }) {
  const pathname = usePathname()
  const page = publicPage(pathname, analyticsPages)
  const locale = pathname === "/id" || pathname.startsWith("/id/") ? "id" : "en"
  const t = (key: keyof typeof analyticsCopy) => analyticsCopy[key][locale]
  const [choice, setChoice] = useState<AnalyticsConsent | null>(null)
  const [ready, setReady] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const panel = useRef<HTMLElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Storage exceptions fail closed, including browsers disabling localStorage.
    let saved: AnalyticsConsent | null = null
    try { saved = readConsent(window.localStorage) } catch { /* no decision */ }
    browserAnalytics(productionEnabled).sync(window.location.pathname, saved)
    const hydrate = window.setTimeout(() => { setChoice(saved); setReady(true) }, 0)
    const open = () => {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setSettingsOpen(true)
    }
    const storage = (event: StorageEvent) => {
      if (event.key === CONSENT_KEY || event.key === null) {
        const saved = event.key === null ? null : parseConsent(event.newValue)
        browserAnalytics(productionEnabled).sync(location.pathname, saved)
        setChoice(saved)
      }
    }
    window.addEventListener(COOKIE_SETTINGS_EVENT, open)
    window.addEventListener("storage", storage)
    return () => {
      clearTimeout(hydrate)
      window.removeEventListener(COOKIE_SETTINGS_EVENT, open)
      window.removeEventListener("storage", storage)
    }
  }, [productionEnabled])

  useEffect(() => {
    if (ready) browserAnalytics(productionEnabled).sync(pathname, choice)
  }, [pathname, choice, ready, productionEnabled])

  useEffect(() => { if (settingsOpen) panel.current?.focus() }, [settingsOpen])

  const close = () => { setSettingsOpen(false); returnFocus.current?.focus() }
  const select = (value: AnalyticsConsent) => {
    let persisted = false
    try { persisted = saveConsent(localStorage, value) } catch { /* fail closed */ }
    // A browser unable to retain the preference must not silently re-enable tags.
    const effective = persisted ? value : "denied"
    setStorageError(!persisted)
    setChoice(effective)
    browserAnalytics(productionEnabled).sync(location.pathname, effective)
    close()
  }
  if (!ready || !page || (choice !== null && !settingsOpen && !storageError)) return null
  const privacy = policyDefinitions.find(policy => policy.id === "privacy")!.paths[locale]
  const buttonClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-line px-4 py-2 font-interface text-base text-soft hover:border-red-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-bright"

  // In-flow, non-modal region: content stays readable at 200% zoom and on mobile.
  return <section ref={panel} tabIndex={-1} aria-labelledby="analytics-consent-title" className="border-t border-line bg-black font-interface" onKeyDown={event => {
    if (event.key === "Escape" && choice !== null && settingsOpen) close()
  }}>
    <div className="public-container py-5 space-y-3">
      <h2 id="analytics-consent-title" className="font-display text-2xl font-semibold">{t("title")}</h2>
      <p className="max-w-3xl text-base leading-relaxed text-muted">{t("description")} {" "}<a href={privacy} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white">{t("privacy")}</a></p>
      {storageError && <p role="status" className="text-base text-muted">{t("unavailable")}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={() => select("granted")}>{t("accept")}</button>
        <button type="button" className={buttonClass} onClick={() => select("denied")}>{t("reject")}</button>
        {choice !== null && settingsOpen && <button type="button" className={buttonClass} onClick={close}>{t("close")}</button>}
      </div>
    </div>
  </section>
}
