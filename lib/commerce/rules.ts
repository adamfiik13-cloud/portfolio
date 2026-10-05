export type Locale = "en" | "id"
export interface TransactionTerms {
  service_id: string; package_id: string; service_name: string; amount_idr: number; currency: "IDR";
  scope: string[]; deliverables: string[]; exclusions: string[]; requirements: string[];
  estimated_duration: string; revision_rule: { description: string };
  milestones: { label: string; amount_idr: number }[];
  cost_disclosure: string;
}
export interface OfferTerms { en: TransactionTerms; id: TransactionTerms }
export function isUuid(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) }
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= 6000
const lines = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.length <= 40 && value.every(text)
export function validTerms(value: unknown): value is TransactionTerms {
  if (!value || typeof value !== "object") return false
  const v = value as TransactionTerms
  return typeof v.service_id === "string" && v.service_id.length <= 100 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.service_id) && text(v.package_id) && text(v.service_name) &&
    Number.isSafeInteger(v.amount_idr) && v.amount_idr > 0 && v.amount_idr <= 1_000_000_000 && v.currency === "IDR" &&
    lines(v.scope) && lines(v.deliverables) && lines(v.exclusions) && lines(v.requirements) && text(v.estimated_duration) &&
    text(v.revision_rule?.description) && text(v.cost_disclosure) && Array.isArray(v.milestones) && v.milestones.length > 0 && v.milestones.length <= 20 &&
    v.milestones.every(m => text(m.label) && Number.isSafeInteger(m.amount_idr) && m.amount_idr > 0) && v.milestones.reduce((sum, m) => sum + m.amount_idr, 0) === v.amount_idr
}
export function validOfferTerms(value: OfferTerms) {
  return validTerms(value?.en) && validTerms(value?.id) && value.en.service_id === value.id.service_id && value.en.package_id === value.id.package_id &&
    value.en.amount_idr === value.id.amount_idr && value.en.milestones.length === value.id.milestones.length &&
    value.en.milestones.every((m, i) => m.amount_idr === value.id.milestones[i].amount_idr)
}
// Browser amounts, client IDs, roles and statuses never participate in this input.
export function acceptanceInput(form: Pick<FormData, "get">) {
  const key = form.get("key"), fingerprint = form.get("fingerprint")
  if (form.get("agreement") !== "on" || !isUuid(key) || typeof fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(fingerprint)) return null
  return { key, fingerprint }
}
