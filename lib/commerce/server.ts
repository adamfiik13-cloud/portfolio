import "server-only"
import { createHash } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { authContext } from "@/lib/auth/context"
import { getSupabaseConfig } from "@/lib/supabase/config"
import { catalogTerms } from "@/data/commerce-catalog"
import { policiesEn } from "@/data/policies/en"
import { policiesId } from "@/data/policies/id"
import { getPolicyMetadata, policyDefinitions, policyOperator } from "@/data/policies/config"
import { validTerms, validOfferTerms, isUuid, type Locale, type TransactionTerms, type OfferTerms } from "./rules"

export const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex")
function orderedFields(value: object, keys: string[]) {
  // Include unexpected fields too: never silently exclude content from integrity checks.
  const remaining = Object.keys(value).filter(key => !keys.includes(key)).sort()
  return Object.fromEntries([...keys, ...remaining].map(key => [key, (value as Record<string, unknown>)[key]]))
}
export function offerHash(terms: OfferTerms) {
  // Match the original submitOffer serialization, including nested objects. JSONB
  // changes key order on storage; existing sent offers must retain their hashes.
  const ordered = orderedFields(terms, ["en", "id"])
  for (const locale of ["en", "id"] as const) {
    const value = terms[locale]
    ordered[locale] = {
      ...orderedFields(value, ["service_id", "package_id", "service_name", "amount_idr", "currency", "scope", "deliverables", "requirements", "exclusions", "estimated_duration", "revision_rule", "milestones", "cost_disclosure"]),
      revision_rule: orderedFields(value.revision_rule, ["description"]),
      milestones: value.milestones.map(m => orderedFields(m, ["label", "amount_idr"])),
    }
  }
  return hash(ordered)
}
export function policyBundle(locale: Locale) {
  return policyDefinitions.map(p => {
    const metadata = getPolicyMetadata(p.id)
    if (!metadata.effectiveDate) throw new Error("Unpublished policy")
    const content = JSON.stringify((locale === "en" ? policiesEn : policiesId)[p.id], (_key, value) => typeof value === "string" ? value.replace(/\{\{(brand|operator|domicile|email|website)\}\}/g, (_token, key: keyof typeof policyOperator) => policyOperator[key]) : value)
    return { policy_type: p.id, version: metadata.version, locale, effective_date: metadata.effectiveDate, content, content_sha256: createHash("sha256").update(content).digest("hex") }
  })
}
export function agreement(terms: TransactionTerms, locale: Locale, offerId: string | null = null) {
  const policies = policyBundle(locale)
  return { terms, policies, fingerprint: hash({ terms, policies, locale, offerId }) }
}
export async function commerceContext() {
  // Phase 4 is authorized on staging only; reuse the existing Auth isolation gate.
  const context = await authContext()
  if (process.env.APP_ENV !== "staging" && !(process.env.APP_ENV === "local" && !process.env.VERCEL)) return { ...context, client: null, user: null, configured: false }
  return context
}
export async function ownerContext() {
  const context = await commerceContext()
  if (!context.client || !context.user) return null
  const { data, error } = await context.client.from("staff_access").select("role,active").eq("user_id", context.user.id).maybeSingle()
  return !error && data?.active && data.role === "owner" ? context : null
}
// Kept module-private. User reads always use the session client and RLS.
function mutationClient() {
  const { url } = getSupabaseConfig()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("Commerce configuration unavailable")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}
export async function offerAgreement(id: string, locale: Locale) {
  if (!isUuid(id)) return null
  const { client, user } = await commerceContext()
  if (!client || !user) return null
  const { data, error } = await client.from("custom_offers").select("id,client_id,status,expires_at,order_id,transaction_terms,terms_sha256,version").eq("id", id).eq("client_id", user.id).maybeSingle()
  if (error) throw new Error("Commerce unavailable")
  if (!data || !validOfferTerms(data.transaction_terms) || offerHash(data.transaction_terms) !== data.terms_sha256) return null
  return { offer: data, canAccept: data.status === "sent" && new Date(data.expires_at).getTime() > Date.now(), ...agreement(data.transaction_terms[locale], locale, id) }
}
export async function placeOrder(input: { key: string; fingerprint: string; serviceId?: string; offerId?: string; locale: Locale }) {
  const { client, user } = await commerceContext()
  if (!client || !user || !isUuid(input.key)) throw new Error("Unauthorized")
  const selected = input.offerId ? await offerAgreement(input.offerId, input.locale) : null
  const catalog = input.serviceId ? catalogTerms(input.serviceId, input.locale) : null
  if (input.offerId && (!selected || !["sent", "accepted"].includes(selected.offer.status) || (selected.offer.status === "sent" && new Date(selected.offer.expires_at).getTime() <= Date.now()))) throw new Error("Changed agreement")
  if (!input.offerId && !catalog?.eligible) throw new Error("Incomplete terms")
  const current = selected ?? agreement(catalog!.terms, input.locale)
  if (!validTerms(current.terms) || current.fingerprint !== input.fingerprint) throw new Error("Changed agreement")
  const { data, error } = await mutationClient().rpc("commerce_place_order", { p_client: user.id, p_key: input.key, p_locale: input.locale, p_terms: current.terms, p_hash: current.fingerprint, p_policies: current.policies, p_agreed: true, p_offer: input.offerId ?? null })
  if (error || !isUuid(data)) throw new Error("Commerce unavailable")
  return data
}
export async function createOffer(input: { id: string; clientId: string; terms: OfferTerms; expires: string }) {
  const context = await ownerContext()
  if (!context?.user || !isUuid(input.id) || !isUuid(input.clientId) || !validOfferTerms(input.terms) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(input.expires) || !Number.isFinite(Date.parse(input.expires)) || Date.parse(input.expires) <= Date.now()) throw new Error("Invalid offer")
  const { data, error } = await mutationClient().rpc("commerce_create_offer", { p_actor: context.user.id, p_id: input.id, p_client: input.clientId, p_terms: input.terms, p_hash: offerHash(input.terms), p_expires: input.expires })
  if (error || !isUuid(data)) throw new Error("Commerce unavailable")
  return data
}
