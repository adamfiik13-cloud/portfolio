import Link from "next/link"
import { catalogPaths, servicePath, type CatalogService } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import { findDirectPackage } from "@/data/direct-packages"
import ServiceShell from "./ServiceShell"
import ServiceDetailBody from "./ServiceDetailBody"

export default function ServiceDetail({ locale, service }: { locale: PublicLocale; service: CatalogService }) {
  const t = getServiceCopy(locale)
  return <ServiceShell locale={locale} paths={{ en: servicePath(service, "en"), id: servicePath(service, "id") }} light preserveIntent>
    <Link href={catalogPaths[locale]} className="inline-flex items-center min-h-11 text-muted hover:text-red-bright mb-8">← {t("back")}</Link>
    <ServiceDetailBody locale={locale} service={service} spec={findDirectPackage(service.id) ?? undefined} />
  </ServiceShell>
}
