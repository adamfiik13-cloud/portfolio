import { serviceInquiry, servicePrice, type CatalogService } from "@/data/service-catalog"
import { directPackageRules, type DirectPackage } from "@/data/direct-packages"
import { getServiceCopy } from "@/data/service-copy"
import type { PublicLocale } from "@/data/public-content"
import { servicePresentation } from "./service-presentation"
import { ServiceOrderForm } from "./ServiceLocaleProvider"

export default function ServiceOrderPanel({ locale, service, spec }: { locale: PublicLocale; service: CatalogService; spec?: DirectPackage }) {
  const t = getServiceCopy(locale), presentation = servicePresentation(service.id, locale)
  const enabled = process.env.APP_ENV === "staging" && presentation.mode !== "inquiry"
  return <aside className="service-order-panel space-y-5" tabIndex={0} aria-labelledby="service-order-title">
    <div><h2 id="service-order-title" className="font-interface text-sm text-muted mb-2">{t(spec ? "packageTotal" : "price")}</h2><p className="font-display text-3xl sm:text-4xl font-bold leading-tight">{servicePrice(service, locale)}</p><p className="mt-3"><span className="service-badge" data-mode={presentation.mode}>{t(presentation.mode === "direct" ? "orderDirectly" : presentation.mode === "compatibility" ? "compatibilityBadge" : "discussFirst")}</span></p></div>
    <dl className="space-y-4 border-y border-line py-5"><div><dt className="font-semibold">{t("timeline")}</dt><dd className="text-muted mt-1">{presentation.duration || t("timingUnknown")}</dd></div><div><dt className="font-semibold">{t("revisions")}</dt><dd className="text-muted mt-1">{presentation.revisions || t("revisionUnknown")}</dd></div></dl>
    {presentation.mode === "compatibility" && <p className="service-note">{t("compatibilityRequired")}</p>}
    {enabled ? <ServiceOrderForm locale={locale} serviceId={service.id} mode={presentation.mode} /> : <div className="space-y-3">
      {spec && <p className="text-sm text-muted"><strong>{t("outputLanguage")}:</strong> {directPackageRules.outputLanguage[locale]}</p>}
      <a href={serviceInquiry(service, locale)} target="_blank" rel="noopener noreferrer" className="service-primary">{t("discussProject")}</a>
      <p className="text-sm text-muted">{t(spec ? "onlineOrderingInactive" : "inquiryNote")}</p>
    </div>}
    {spec && <div className="space-y-3 text-muted text-sm"><p>{t("costSummary")}</p><p>{t("costApproval")}</p></div>}
    {spec && <a href={serviceInquiry(service, locale)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4 text-sm">{t("outsidePackage")}</a>}
    {spec?.schedulingNote && <p className="text-sm text-muted">{spec.schedulingNote[locale]}</p>}
    {!spec && <p className="text-muted">{t("confirmation")}</p>}
  </aside>
}
