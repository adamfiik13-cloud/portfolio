"use client"

import { useState } from "react"
import { catalogServices, serviceCategories, type CatalogService, type CategoryId } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import { filterServices } from "@/lib/service-search"
import ServiceCard from "./ServiceCard"
import { filterByOrdering, orderingGroup, type ServiceOrderModes, type ServiceOrderFilter } from "@/data/service-ordering"

export default function CatalogBrowser({ locale, modes, onlineOrders }: { locale: PublicLocale; modes: ServiceOrderModes; onlineOrders: boolean }) {
  const t = getServiceCopy(locale)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryId | "all">("all")
  const [ordering, setOrdering] = useState<ServiceOrderFilter>("all")
  const filtered = filterByOrdering(filterServices(catalogServices, locale, query, category), modes, ordering)
  const reset = () => { setQuery(""); setCategory("all"); setOrdering("all") }

  return <>
    <div className="mb-10 font-interface rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-6">
      <fieldset><legend className="font-semibold mb-3">{t("orderFilter")}</legend><div className="flex flex-wrap gap-2">{(["all", "direct", "discuss"] as const).map(mode => <button key={mode} type="button" className="service-filter" aria-pressed={ordering === mode} aria-controls="catalog-results" onClick={() => setOrdering(mode)}>{t(mode === "all" ? "all" : mode === "direct" ? "orderDirectly" : "discussFirst")}</button>)}</div></fieldset>
      {!onlineOrders && <p className="text-muted">{t("onlineOrderingInactive")}</p>}
      <div>
      <label htmlFor="service-search" className="block text-sm mb-2">{t("search")}</label>
      <input id="service-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("search")} aria-controls="catalog-results" className="block min-h-12 w-full max-w-2xl min-w-0 rounded-xl border border-line bg-surface px-4 py-3 text-soft placeholder:text-muted" />
      </div>
      <fieldset className="min-w-0">
        <legend className="text-sm mb-3">{t("categories")}</legend>
        <div className="flex flex-wrap gap-2">
          {[{ id: "all" as const, name: { en: t("all"), id: t("all") } }, ...serviceCategories].map(item => <button key={item.id} type="button" aria-pressed={category === item.id} aria-controls="catalog-results" onClick={() => setCategory(item.id)} className="service-filter text-left">{item.name[locale]}</button>)}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted">{filtered.length} {t("results")}</p>
        <button type="button" onClick={reset} className="min-h-11 px-3 underline underline-offset-4 hover:text-red-bright">{t("reset")}</button>
      </div>
    </div>
    <div id="catalog-results" className="space-y-16">
      {(["direct", "discuss"] as const).map(group => {
        const items = filtered.filter(service => orderingGroup(modes[service.id]) === group)
        return items.length ? <CatalogGroup key={group} title={t(group === "direct" ? "orderDirectly" : "discussFirst")} description={t(group === "direct" ? "directGroupHelp" : "discussGroupHelp")} services={items} locale={locale} modes={modes} /> : null
      })}
      {filtered.length === 0 && <section className="border-t border-line py-10"><h2 className="font-display text-2xl font-semibold mb-3">{t("empty")}</h2><p className="font-interface text-muted">{t("emptyHint")}</p></section>}
    </div>
  </>
}

function CatalogGroup({ title, description, services, locale, modes }: { title: string; description: string; services: CatalogService[]; locale: PublicLocale; modes: ServiceOrderModes }) {
  const t = getServiceCopy(locale)
  const business = services.filter(service => service.category !== "career"), career = services.filter(service => service.category === "career")
  return <section className="border-t border-line pt-8">
    <h2 className="font-display font-semibold mb-3 text-3xl sm:text-4xl">{title}</h2>
    {description && <p className="text-muted font-interface mb-3">{description}</p>}
    {business.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-7">{business.map(service => <ServiceCard key={service.id} service={service} locale={locale} mode={modes[service.id]} />)}</div>}
    {career.length > 0 && <section className="mt-10 border border-line rounded-2xl p-5 sm:p-6 bg-paper"><h3 className="font-display text-2xl font-semibold">{serviceCategories.find(item => item.id === "career")!.name[locale]}</h3><p className="text-muted mt-2">{t("career")}</p><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">{career.map(service => <ServiceCard key={service.id} service={service} locale={locale} mode={modes[service.id]} headingLevel="h4" />)}</div></section>}
  </section>
}
