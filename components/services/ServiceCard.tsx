import Link from "next/link"
import { servicePath, servicePrice, type CatalogService, serviceCategories } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import ServiceThumbnail from "./ServiceThumbnail"

export default function ServiceCard({ service, locale }: { service: CatalogService; locale: PublicLocale }) {
  const t = getServiceCopy(locale)
  const category = serviceCategories.find(category => category.id === service.category)!
  return <article className="min-w-0 h-full">
    <Link href={servicePath(service, locale)} aria-label={`${service.name[locale]} — ${t("details")}`} className="group flex h-full flex-col rounded-2xl border border-line bg-surface hover:border-red focus-visible:outline-offset-4 [&>div:first-child]:rounded-t-2xl">
      <ServiceThumbnail service={service} />
      <div className="flex flex-1 flex-col p-5 sm:p-6 break-words">
        <p className="font-interface text-sm text-muted mb-3">{category.name[locale]}</p>
        <h3 className="font-display font-semibold text-2xl leading-tight mb-3 group-hover:text-red-bright">{service.name[locale]}</h3>
        <p className="font-interface text-muted leading-relaxed line-clamp-2 mb-6">{service.description[locale]}</p>
        <div className="mt-auto">
          <p className="font-interface text-sm text-muted mb-1">{t(service.inquiry === "consultation" ? "consultationModel" : service.price.interval === "month" ? "monthly" : "once")}</p>
          <p className="font-display text-xl font-semibold">{servicePrice(service, locale)}</p>
          <p className="font-display font-semibold text-red-bright mt-4">{t("details")} <span aria-hidden="true">→</span></p>
        </div>
      </div>
    </Link>
  </article>
}
