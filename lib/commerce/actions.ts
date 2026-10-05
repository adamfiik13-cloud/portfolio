"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { catalogServices } from "@/data/service-catalog"
import { commercePaths } from "@/data/commerce"
import { createOffer, placeOrder } from "./server"
import { acceptanceInput, validOfferTerms, type Locale, type OfferTerms } from "./rules"

export type CommerceState = { message?: "invalid" | "changed" | "unavailable" | "saved"; offerId?: string }
export async function acceptOrder(locale: Locale, serviceId: string, offerId: string, _previous: CommerceState, form: FormData): Promise<CommerceState> {
  const input = acceptanceInput(form)
  if (!input) return { message: "invalid" }
  let id: string
  try { id = await placeOrder({ ...input, serviceId, offerId: offerId || undefined, locale }) }
  catch (error) { return { message: error instanceof Error && error.message === "Changed agreement" ? "changed" : "unavailable" } }
  revalidatePath(commercePaths.orders[locale])
  redirect(commercePaths.orders[locale] + "/" + id)
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
