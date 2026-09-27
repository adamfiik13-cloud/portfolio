"use client"

import { useState } from "react"
import { catalogServices, serviceCategories, type CatalogService, type CategoryId } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import { filterServices } from "@/lib/service-search"
import ServiceCard from "./ServiceCard"

const featuredIds = ["landing-page-starter", "business-website", "seo-audit-roadmap", "tracking-basic", "meta-ads-starter", "digital-business-consultation"]

export default function CatalogBrowser({ locale }: { locale: PublicLocale }) {
  const t = getServiceCopy(locale)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryId | "all">("all")
  const filtered = filterServices(catalogServices, locale, query, category)
  const active = Boolean(query.trim()) || category !== "all"
  const business = filtered.filter(service => service.category !== "career")
  const career = filtered.filter(service => service.category === "career")
  const reset = () => { setQuery(""); setCategory("all") }

  return <>
    <div className="mb-12 font-interface">
      <label htmlFor="service-search" className="block text-sm mb-2">{t("search")}</label>
      <input id="service-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("search")} aria-controls="catalog-results" className="block min-h-12 w-full max-w-2xl min-w-0 rounded-xl border border-line bg-surface px-4 py-3 text-soft placeholder:text-muted" />
      <fieldset className="mt-6 min-w-0">
        <legend className="text-sm mb-3">{t("categories")}</legend>
        <div className="flex flex-wrap gap-2">
          {[{ id: "all" as const, name: { en: t("all"), id: t("all") } }, ...serviceCategories].map(item => <button key={item.id} type="button" aria-pressed={category === item.id} aria-controls="catalog-results" onClick={() => setCategory(item.id)} className={`min-h-11 max-w-full rounded-xl border px-4 py-2 text-left text-sm ${category === item.id ? "border-red-bright bg-soft text-ink" : "border-line text-muted hover:text-white hover:border-red"}`}>{item.name[locale]}</button>)}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted">{filtered.length} {t("results")}</p>
        <button type="button" onClick={reset} className="min-h-11 px-3 underline underline-offset-4 hover:text-red-bright">{t("reset")}</button>
      </div>
    </div>
    <div id="catalog-results" className="space-y-16">
      {!active && <CatalogGroup title={t("featured")} services={featuredIds.map(id => catalogServices.find(service => service.id === id)!)} locale={locale} />}
      {business.length > 0 && <CatalogGroup title={t("all")} services={business} locale={locale} />}
      {career.length > 0 && <CatalogGroup title={serviceCategories.find(item => item.id === "career")!.name[locale]} description={t("career")} services={career} locale={locale} secondary />}
      {filtered.length === 0 && <section className="border-t border-line py-10"><h2 className="font-display text-2xl font-semibold mb-3">{t("empty")}</h2><p className="font-interface text-muted">{t("emptyHint")}</p></section>}
    </div>
  </>
}

function CatalogGroup({ title, description, services, locale, secondary = false }: { title: string; description?: string; services: CatalogService[]; locale: PublicLocale; secondary?: boolean }) {
  return <section className="border-t border-line pt-8">
    <h2 className={`font-display font-semibold mb-3 ${secondary ? "text-2xl" : "text-3xl sm:text-4xl"}`}>{title}</h2>
    {description && <p className="text-muted font-interface mb-3">{description}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-7">{services.map(service => <ServiceCard key={service.id} service={service} locale={locale} />)}</div>
  </section>
}
