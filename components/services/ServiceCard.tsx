import Link from "next/link"
import { servicePath, servicePrice, type CatalogService, serviceCategories } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import ServiceThumbnail from "./ServiceThumbnail"
import type { ServiceOrderMode } from "@/data/service-ordering"

export default function ServiceCard({ service, locale, mode = "inquiry", headingLevel = "h3" }: { service: CatalogService; locale: PublicLocale; mode?: ServiceOrderMode; headingLevel?: "h3" | "h4" }) {
  const t = getServiceCopy(locale)
  const category = serviceCategories.find(category => category.id === service.category)!
  const Heading = headingLevel
  return <article className="min-w-0 h-full" data-service-id={service.id}>
    <Link href={servicePath(service, locale)} aria-label={`${service.name[locale]} — ${t("details")}`} className="service-card group focus-visible:outline-offset-4">
      <ServiceThumbnail service={service} />
      <div className="flex flex-1 flex-col p-5 sm:p-6 break-words">
        <div className="flex flex-wrap items-center gap-2 mb-3"><span className="service-badge" data-mode={mode}>{t(mode === "direct" ? "orderDirectly" : mode === "compatibility" ? "compatibilityBadge" : "discussFirst")}</span><span className="font-interface text-sm text-muted">{category.name[locale]}</span></div>
        <Heading className="font-display font-semibold text-2xl leading-tight mb-3 group-hover:text-red-bright">{service.name[locale]}</Heading>
        <p className="font-interface text-muted leading-relaxed mb-6">{service.description[locale]}</p>
        <div className="mt-auto">
          <p className="font-interface text-sm text-muted mb-1">{t(service.inquiry === "consultation" ? "consultationModel" : service.price.interval === "month" ? "monthly" : "once")}</p>
          <p className="font-display text-xl font-semibold">{servicePrice(service, locale)}</p>
          <p className="font-display font-semibold text-red-bright mt-4">{t(mode === "compatibility" ? "requestCompatibility" : mode === "direct" ? "viewPackage" : "viewDiscuss")} <span aria-hidden="true">→</span></p>
        </div>
      </div>
    </Link>
  </article>
}
