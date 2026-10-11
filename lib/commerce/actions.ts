"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { catalogServices } from "@/data/service-catalog"
import { commercePaths } from "@/data/commerce"
import { createOffer, placeOrder, requestCompatibility, reviewCompatibility } from "./server"
import { acceptanceInput, validOfferTerms, type Locale, type OfferTerms } from "./rules"

export type CommerceState = { message?: "invalid" | "changed" | "unavailable" | "saved"; offerId?: string }
export async function acceptOrder(locale: Locale, serviceId: string, offerId: string, _previous: CommerceState, form: FormData): Promise<CommerceState> {
  const input = acceptanceInput(form)
  if (!input) return { message: "invalid" }
  if (!offerId && ["business-website", "tracking-basic", "ads-tracking", "seo-foundation"].includes(serviceId) && form.get("supportedConditions") !== "on") return { message: "invalid" }
  let id: string
  const output = form.get("outputLanguage")
  if (!offerId && output !== "en" && output !== "id") return { message: "invalid" }
  try { id = await placeOrder({ ...input, serviceId, offerId: offerId || undefined, locale, outputLanguage: offerId ? undefined : output as Locale, approvalId: String(form.get("approvalId") ?? "") }) }
  catch (error) { return { message: error instanceof Error && error.message === "Changed agreement" ? "changed" : "unavailable" } }
  revalidatePath(commercePaths.orders[locale])
  redirect(commercePaths.orders[locale] + "/" + id)
}
export async function requestCompatibilityAction(locale: Locale, _previous: CommerceState, form: FormData): Promise<CommerceState> {
  let id: string
  try { id = await requestCompatibility(String(form.get("website") ?? ""), String(form.get("platform") ?? "")) }
  catch { return { message: "unavailable" } }
  redirect(commercePaths.checkout[locale] + "?service=seo-foundation&output=" + (form.get("outputLanguage") === "id" ? "id" : "en") + "&approval=" + id)
}
export async function reviewCompatibilityAction(locale: Locale, id: string, form: FormData) {
  if (form.get("reviewed") !== "on" || !["approve", "reject"].includes(String(form.get("decision")))) return
  await reviewCompatibility(id, form.get("decision") === "approve")
  revalidatePath(commercePaths.owner[locale])
}
export async function submitOffer(locale: Locale, _previous: CommerceState, form: FormData): Promise<CommerceState> {
  const field = (key: string) => typeof form.get(key) === "string" ? String(form.get(key)).trim() : ""
  const service = catalogServices.find(s => s.id === field("service"))
  if (!service || field("confirmed") !== "on") return { message: "invalid" }
  const terms = {} as OfferTerms
  for (const lang of ["en", "id"] as const) {
    const lines = (key: string) => field(lang + "-" + key).split("\n").map(s => s.trim()).filter(Boolean)
    const milestoneLines = lines("milestones")
    const milestones = milestoneLines.map(line => { const split = line.lastIndexOf("|"); return { label: line.slice(0, split).trim(), amount_idr: split < 0 ? NaN : Number(line.slice(split + 1).trim()) } })
    terms[lang] = { service_id: service.id, package_id: "custom-offer", service_name: field(lang + "-title"), amount_idr: Number(field("amount")), currency: "IDR", scope: lines("scope"), deliverables: lines("deliverables"), requirements: lines("requirements"), exclusions: lines("exclusions"), estimated_duration: field(lang + "-duration"), revision_rule: { description: field(lang + "-revisions") }, milestones, cost_disclosure: field(lang + "-fees") }
  }
  if (!validOfferTerms(terms)) return { message: "invalid" }
  try {
    const offerId = await createOffer({ id: field("key"), clientId: field("client"), terms, expires: field("expires") })
    revalidatePath(commercePaths.owner[locale])
    return { message: "saved", offerId }
  } catch { return { message: "unavailable" } }
}
