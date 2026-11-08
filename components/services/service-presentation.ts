import "server-only"
import { catalogTerms } from "@/data/commerce-catalog"
import { findDirectPackage } from "@/data/direct-packages"
import type { PublicLocale } from "@/data/public-content"
import type { ServiceOrderMode } from "@/data/service-ordering"

export function servicePresentation(serviceId: string, locale: PublicLocale) {
  const catalog = catalogTerms(serviceId, locale)
  const spec = findDirectPackage(serviceId)
  const mode: ServiceOrderMode = spec && catalog?.eligible ? (spec.compatibilityApproval ? "compatibility" : "direct") : "inquiry"
  return { mode, duration: spec?.duration[locale] ?? catalog?.terms.estimated_duration ?? "", revisions: spec?.revisions[locale] ?? catalog?.terms.revision_rule.description ?? "" }
}
