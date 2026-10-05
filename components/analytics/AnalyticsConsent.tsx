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
  const [bannerHeight, setBannerHeight] = useState(0)
  const panel = useRef<HTMLElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const visible = ready && !!page && (choice === null || settingsOpen || storageError)

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

  useEffect(() => {
    if (!visible || !panel.current) return
    // Reserve the measured height so the fixed banner cannot hide the footer.
    // ResizeObserver also follows font loading, narrow screens and browser zoom.
    const observer = new ResizeObserver(entries => {
      setBannerHeight(Math.ceil(entries[0].target.getBoundingClientRect().height))
    })
    observer.observe(panel.current)
    return () => observer.disconnect()
  }, [visible])

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
  if (!visible) return null
  const privacy = policyDefinitions.find(policy => policy.id === "privacy")!.paths[locale]
  const buttonClass = "inline-flex min-h-11 min-w-11 w-full sm:w-auto items-center justify-center rounded-control border px-4 py-2 font-interface text-base leading-snug focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-bright"

  // No backdrop or focus trap. At extreme zoom the copy can scroll independently
  // while both choices stay directly available in the fixed bottom banner.
  return <><div aria-hidden="true" style={{ height: bannerHeight }} /><section ref={panel} tabIndex={-1} aria-labelledby="analytics-consent-title" className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[80svh] border-t border-line bg-surface px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] font-interface shadow-xl" onKeyDown={event => {
    if (event.key === "Escape" && choice !== null && settingsOpen) close()
  }}>
    <div className="mx-auto flex w-full max-w-[1360px] min-h-0 min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
      <div tabIndex={0} className="min-h-0 min-w-0 overflow-y-auto overscroll-contain break-words lg:flex-1">
        <h2 id="analytics-consent-title" className="font-display text-xl sm:text-2xl font-semibold leading-tight">{t("title")}</h2>
        <p className="max-w-3xl mt-2 text-sm sm:text-base leading-relaxed text-muted">{t("description")}</p>
        <a href={privacy} className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-white">{t("privacy")}</a>
        {storageError && <p role="status" className="text-sm text-muted">{t("unavailable")}</p>}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:max-w-lg">
        <button type="button" className={buttonClass + " border-red bg-red text-white hover:bg-red-bright"} onClick={() => select("granted")}>{t("accept")}</button>
        <button type="button" className={buttonClass + " border-muted text-soft hover:border-white"} onClick={() => select("denied")}>{t("reject")}</button>
        {choice !== null && settingsOpen && <button type="button" className={buttonClass + " border-line text-soft hover:border-white"} onClick={close}>{t("close")}</button>}
      </div>
    </div>
  </section></>
}
