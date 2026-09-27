import Link from "next/link"
import { catalogPaths, catalogServices, serviceCategories, servicePath, servicePrice } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import ServiceShell from "./ServiceShell"

export default function ServiceCatalog({ locale }: { locale: PublicLocale }) {
  const t = getServiceCopy(locale)
  return <ServiceShell locale={locale} paths={catalogPaths}>
    <header className="max-w-3xl mb-16">
      <p className="font-display uppercase tracking-widest text-sm text-muted mb-4">{t("label")}</p>
      <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-6">{t("title")}</h1>
      <p className="text-muted leading-relaxed mb-4">{t("intro")}</p>
      <p className="font-interface text-sm text-muted">{t("founder")} {t("confirmation")}</p>
    </header>
    <nav aria-label={t("label")} className="flex flex-wrap gap-2 mb-12">
      {serviceCategories.map(category => <a key={category.id} href={"#" + category.id} className="inline-flex items-center min-h-11 rounded-xl border border-line px-4 text-sm text-muted hover:text-white hover:border-red">{category.name[locale]}</a>)}
    </nav>
    {serviceCategories.map((category, index) => <section id={category.id} key={category.id} className={"border-t border-line py-10 lg:py-14 " + (category.id === "career" ? "mt-12" : "")}>
      {category.id === "career" && <p className="font-interface text-sm text-muted mb-5">{t("career")}</p>}
      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-16">
        <header>
          <p className="font-display text-red-bright text-sm mb-3">0{index + 1}</p>
          <h2 className={"font-display font-bold mb-3 " + (category.id === "career" ? "text-2xl" : "text-3xl sm:text-4xl")}>{category.name[locale]}</h2>
          <p className="text-muted text-sm leading-relaxed">{category.description[locale]}</p>
        </header>
        <div className="divide-y divide-line">
          {catalogServices.filter(service => service.category === category.id).map(service => <article key={service.id} className="first:pt-0 py-7 last:pb-0">
            <div className="flex flex-wrap justify-between gap-x-5 gap-y-2 mb-3">
              <h3 className="font-display text-xl font-semibold"><Link href={servicePath(service, locale)} className="inline-flex min-h-11 items-center hover:text-red-bright">{service.name[locale]}</Link></h3>
              <p className="font-display text-lg font-semibold text-red-bright self-center">{servicePrice(service, locale)}</p>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-3">{service.description[locale]}</p>
            <ul className="font-interface text-sm text-muted list-disc pl-5 space-y-1 mb-3">{service.scope[locale].slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul>
            <Link href={servicePath(service, locale)} className="inline-flex items-center min-h-11 font-display font-semibold hover:text-red-bright">{t("details")} <span aria-hidden="true" className="ml-2">→</span></Link>
          </article>)}
        </div>
      </div>
    </section>)}
  </ServiceShell>
}
