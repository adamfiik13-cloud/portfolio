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
export async function compatibilityRequests() {
  const { client, user } = await commerceContext()
  if (!client || !user) return []
  const { data, error } = await client.from("catalog_compatibility").select("id,client_id,website_url,platform,status,specification_version,order_id,created_at").eq("client_id", user.id).order("created_at", { ascending: false }).limit(30)
  if (error) throw new Error("Commerce unavailable")
  return data ?? []
}
export async function catalogAgreement(serviceId: string, locale: Locale, outputLanguage: Locale, approvalId = "") {
  const catalog = catalogTerms(serviceId, locale, outputLanguage)
  if (!catalog?.eligible) return null
  let terms = catalog.terms
  let existingOrderId: string | null = null
  if (serviceId === "seo-foundation") {
    const { client, user } = await commerceContext()
    if (!client || !user || !isUuid(approvalId)) return null
    const { data, error } = await client.from("catalog_compatibility").select("id,client_id,website_url,platform,status,specification_version,order_id").eq("id", approvalId).eq("client_id", user.id).maybeSingle()
    if (error) throw new Error("Commerce unavailable")
    if (!data || data.status !== "approved" || data.specification_version !== terms.specification_version) return null
    if (data.order_id !== null) {
      if (!isUuid(data.order_id)) return null
      const { data: order, error: orderError } = await client.from("orders").select("id").eq("id", data.order_id).eq("client_id", user.id).maybeSingle()
      if (orderError) throw new Error("Commerce unavailable")
      if (!order) return null
      existingOrderId = order.id
    }
    terms = { ...terms, compatibility_approval_id: data.id, compatibility_target: { url: data.website_url, platform: data.platform } }
  }
  // Presentation state stays outside the agreement hash so a successful submit
  // can still be recovered by retrying its original request key.
  return { ...agreement(terms, locale), existingOrderId }
}
export async function requestCompatibility(url: string, platform: string) {
  const { client, user } = await commerceContext()
  if (!client || !user || !["wordpress", "nextjs"].includes(platform)) throw new Error("Unauthorized")
  const parsed = new URL(url)
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || url.length > 500 || /\s/.test(url)) throw new Error("Invalid request")
  const version = catalogTerms("seo-foundation", "en")?.terms.specification_version
  if (!version) throw new Error("Incomplete terms")
  const { data, error } = await mutationClient().rpc("catalog_request_compatibility", { p_client: user.id, p_url: parsed.href, p_platform: platform, p_version: version })
  if (error || !isUuid(data)) throw new Error("Commerce unavailable")
  return data
}
export async function reviewCompatibility(id: string, approved: boolean) {
  const context = await ownerContext()
  if (!context?.user || !isUuid(id)) throw new Error("Unauthorized")
  const { data, error } = await mutationClient().rpc("catalog_review_compatibility", { p_actor: context.user.id, p_id: id, p_approved: approved })
  if (error || data !== true) throw new Error("Commerce unavailable")
}
export async function placeOrder(input: { key: string; fingerprint: string; serviceId?: string; offerId?: string; locale: Locale; outputLanguage?: Locale; approvalId?: string }) {
  const { client, user } = await commerceContext()
  if (!client || !user || !isUuid(input.key)) throw new Error("Unauthorized")
  const selected = input.offerId ? await offerAgreement(input.offerId, input.locale) : null
  if (!["en", "id"].includes(input.locale) || input.outputLanguage !== undefined && !["en", "id"].includes(input.outputLanguage)) throw new Error("Incomplete terms")
  const catalog = input.serviceId ? catalogTerms(input.serviceId, input.locale, input.outputLanguage ?? input.locale) : null
  if (input.offerId && (!selected || !["sent", "accepted"].includes(selected.offer.status) || (selected.offer.status === "sent" && new Date(selected.offer.expires_at).getTime() <= Date.now()))) throw new Error("Changed agreement")
  if (!input.offerId && !catalog?.eligible) throw new Error("Incomplete terms")
  const current = selected ?? await catalogAgreement(input.serviceId!, input.locale, input.outputLanguage ?? input.locale, input.approvalId)
  if (!current) throw new Error("Compatibility approval required")
  if (!validTerms(current.terms) || current.fingerprint !== input.fingerprint) throw new Error("Changed agreement")
  const args = { p_client: user.id, p_key: input.key, p_locale: input.locale, p_terms: current.terms, p_hash: current.fingerprint, p_policies: current.policies, p_agreed: true }
  const { data, error } = await mutationClient().rpc(input.offerId ? "commerce_place_order" : "commerce_place_catalog_order", input.offerId ? { ...args, p_offer: input.offerId } : args)
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
