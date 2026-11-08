"use client"
import { useSyncExternalStore } from "react"
import { PublicLocaleProvider } from "@/components/layout/PublicLocaleProvider"
import { commercePaths } from "@/data/commerce"
import { getServiceCopy } from "@/data/service-copy"
import { readServiceIntent, type ServiceOrderMode } from "@/data/service-ordering"
import type { PublicLocale } from "@/data/public-content"

const intentEvent = "adamswork:service-intent"
function subscribe(update: () => void) {
  window.addEventListener("popstate", update); window.addEventListener(intentEvent, update)
  return () => { window.removeEventListener("popstate", update); window.removeEventListener(intentEvent, update) }
}
const snapshot = () => window.location.search
const serverSnapshot = () => ""
function useIntent(locale: PublicLocale) { return readServiceIntent(locale, useSyncExternalStore(subscribe, snapshot, serverSnapshot)) }

export default function ServiceLocaleProvider({ locale, paths, preserveIntent, children }: { locale: PublicLocale; paths: Record<PublicLocale, string>; preserveIntent: boolean; children: React.ReactNode }) {
  const intent = useIntent(locale), query = new URLSearchParams()
  if (preserveIntent && intent.explicitOutput) query.set("output", intent.output)
  if (preserveIntent && intent.approval) query.set("approval", intent.approval)
  const suffix = query.size ? "?" + query.toString() : ""
  return <PublicLocaleProvider locale={locale} paths={{ en: paths.en + suffix, id: paths.id + suffix }}>{children}</PublicLocaleProvider>
}
export function ServiceOrderForm({ locale, serviceId, mode }: { locale: PublicLocale; serviceId: string; mode: ServiceOrderMode }) {
  const t = getServiceCopy(locale), intent = useIntent(locale)
  return <form action={commercePaths.checkout[locale]} method="get" className="space-y-3" data-service-order-form>
    <input type="hidden" name="service" value={serviceId} />
    {intent.approval && <input type="hidden" name="approval" value={intent.approval} />}
    <label className="block font-semibold" htmlFor="package-output-language">{t("outputLanguage")}</label>
    <select id="package-output-language" name="output" value={intent.output} onChange={event => {
      const url = new URL(window.location.href)
      url.searchParams.set("output", event.target.value)
      window.history.replaceState(window.history.state, "", url)
      window.dispatchEvent(new Event(intentEvent))
    }}><option value="en">English</option><option value="id">{locale === "en" ? "Indonesian" : "Indonesia"}</option></select>
    <p className="text-sm text-muted">{t("oneOutputLanguage")}</p>
    <button type="submit" className="service-primary">{t(mode === "compatibility" ? "requestCompatibility" : "reviewPackageOrder")}</button>
    <p className="text-sm text-muted">{t("reviewBeforePayment")}</p>
  </form>
}
