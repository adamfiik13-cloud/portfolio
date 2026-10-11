import { catalogPaths } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import ServiceShell from "./ServiceShell"
import CatalogBrowser from "./CatalogBrowser"

export default function ServiceCatalog({ locale }: { locale: PublicLocale }) {
  const t = getServiceCopy(locale)
  return <ServiceShell locale={locale} paths={catalogPaths}>
    <header className="max-w-3xl mb-16">
      <p className="font-display uppercase tracking-widest text-sm text-muted mb-4">{t("label")}</p>
      <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-6">{t("title")}</h1>
      <p className="text-muted leading-relaxed mb-4">{t("intro")}</p>
      <p className="font-interface text-sm text-muted">{t("founder")} {t("catalogConfirmation")}</p>
    </header>
    <CatalogBrowser locale={locale} />
  </ServiceShell>
}
