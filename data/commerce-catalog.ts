import { catalogServices, serviceCategories } from "./service-catalog"
import { policiesEn } from "./policies/en"
import { policiesId } from "./policies/id"
import type { PublicLocale } from "./public-content"
import { validTerms, type TransactionTerms } from "../lib/commerce/rules"
import { directPackageTerms } from "./direct-packages"

// Stable IDs map to approved Service Policy estimates; translations remain variants.
const estimateRows: Record<string, number> = {
  "landing-page-starter": 0, "business-website": 1, "custom-website": 2, "seo-audit-roadmap": 3, "seo-foundation": 4, "seo-growth": 5,
  "tracking-basic": 6, "ads-tracking": 7, "advanced-tracking": 8, "meta-ads-starter": 9, "meta-ads-growth": 9, "google-ads-starter": 9,
  "integrated-ads-management": 10, "digital-business-consultation": 11, "marketing-marketplace-audit": 12,
  "marketplace-growth-plan": 13, "career-consultation": 14, "cv-review": 15, "cv-rewrite-optimization": 16,
}
const revisionRows: Record<string, number> = {
  "landing-page-starter": 0, "business-website": 1, "tracking-basic": 2, "ads-tracking": 2,
  "seo-audit-roadmap": 3, "seo-foundation": 3, "marketplace-growth-plan": 3, "cv-rewrite-optimization": 3,
  "digital-business-consultation": 4, "marketing-marketplace-audit": 4, "career-consultation": 4, "cv-review": 4,
  "seo-growth": 4, "meta-ads-starter": 4, "meta-ads-growth": 4, "google-ads-starter": 4, "custom-website": 5, "advanced-tracking": 5, "integrated-ads-management": 5,
}
// No commercial values invented. Populate only after explicit owner approval.
const approvedTransactionDetails: Record<string, Record<PublicLocale, Pick<TransactionTerms, "milestones" | "cost_disclosure">>> = {}
export function catalogTerms(serviceId: string, locale: PublicLocale, outputLanguage: PublicLocale = locale) {
  const service = catalogServices.find(s => s.id === serviceId)
  if (!service) return null
  const approved = directPackageTerms(serviceId, locale, outputLanguage)
  if (approved) return { service, terms: approved, missing: [] as string[], eligible: validTerms(approved) }
  const content = (locale === "en" ? policiesEn : policiesId).service
  const estimates = content.sections.find(s => s.id === "service-2")?.blocks.find(b => b.type === "table")
  const revisions = content.sections.find(s => s.id === "service-3")?.blocks.find(b => b.type === "list")
  const extra = approvedTransactionDetails[serviceId]?.[locale]
  const terms: TransactionTerms = {
    service_id: service.id, package_id: service.id + ":standard", service_name: service.name[locale], amount_idr: service.price.amount, currency: "IDR",
    scope: service.scope[locale], deliverables: service.outputs[locale], requirements: [serviceCategories.find(c => c.id === service.category)!.inputs[locale]],
    exclusions: [...service.exclusions[locale], locale === "en" ? "Work and third-party costs not expressly included in the agreed scope." : "Pekerjaan dan biaya pihak ketiga yang tidak secara eksplisit termasuk dalam ruang lingkup yang disepakati."],
    estimated_duration: estimates?.type === "table" ? estimates.rows[estimateRows[serviceId]]?.[1] ?? "" : "",
    revision_rule: { description: revisions?.type === "list" ? revisions.items[revisionRows[serviceId]] ?? "" : "" },
    milestones: extra?.milestones ?? [], cost_disclosure: extra?.cost_disclosure ?? "",
  }
  const missing: string[] = []
  if (service.price.kind === "starting") missing.push(locale === "en" ? "Final quoted price and proposal-specific terms" : "Harga final dan ketentuan khusus proposal")
  if (service.price.interval === "month") missing.push(locale === "en" ? "Recurring billing / engagement terms" : "Ketentuan penagihan berulang / kerja sama")
  if (!terms.milestones.length) missing.push(locale === "en" ? "Milestone values for progress-based cancellation/refunds" : "Nilai milestone untuk pembatalan/refund berdasarkan progres")
  if (!terms.cost_disclosure) missing.push(locale === "en" ? "Tax, fee and third-party cost disclosure" : "Rincian pajak, biaya dan biaya pihak ketiga")
  if (!terms.estimated_duration || !terms.revision_rule.description) missing.push(locale === "en" ? "Duration and revision terms" : "Ketentuan durasi dan revisi")
  return { service, terms, missing, eligible: missing.length === 0 && validTerms(terms) }
}
