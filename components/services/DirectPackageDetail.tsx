import type { DirectPackage } from "@/data/direct-packages"
import type { CatalogService } from "@/data/service-catalog"
import type { PublicLocale } from "@/data/public-content"
import ServiceDetailBody from "./ServiceDetailBody"

export default function DirectPackageDetail({ service, spec, locale }: { service: CatalogService; spec: DirectPackage; locale: PublicLocale }) {
  return <ServiceDetailBody service={service} spec={spec} locale={locale} />
}
