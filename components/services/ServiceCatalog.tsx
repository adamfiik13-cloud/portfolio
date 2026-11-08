import { catalogPaths, catalogServices } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import ServiceShell from "./ServiceShell"
import CatalogBrowser from "./CatalogBrowser"
import { servicePresentation } from "./service-presentation"

export default function ServiceCatalog({ locale }: { locale: PublicLocale }) {
  const t = getServiceCopy(locale)
  const modes = Object.fromEntries(catalogServices.map(service => [service.id, servicePresentation(service.id, locale).mode]))
  return <ServiceShell locale={locale} paths={catalogPaths} light>
    <header className="max-w-3xl mb-10">
      <p className="font-display uppercase tracking-widest text-sm text-muted mb-4">{t("label")}</p>
      <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-6">{t("title")}</h1>
      <p className="text-muted leading-relaxed mb-4 font-brand-body">{t("catalogIntro")}</p>
      <p className="font-interface text-sm text-muted">{t("founder")} {t("catalogConfirmation")}</p>
    </header>
    <CatalogBrowser locale={locale} modes={modes} onlineOrders={process.env.APP_ENV === "staging"} />
  </ServiceShell>
}
