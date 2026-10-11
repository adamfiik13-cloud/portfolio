import { commercePaths } from "../../data/commerce.ts"
import { isUuid, type Locale } from "../commerce/rules.ts"

export const ORDER_INTENT_COOKIE = "aw-order-intent"
function serviceIntent(value: string) {
  const match = /^service:([a-z0-9]+(?:-[a-z0-9]+)*)(?::(en|id))?$/.exec(value)
  return match && match[1].length <= 100 ? { id: match[1], output: match[2] } : null
}
export function orderDestination(value: unknown, locale: Locale): string | null {
  if (typeof value !== "string") return null
  const service = serviceIntent(value)
  if (service) return commercePaths.checkout[locale] + "?service=" + service.id + (service.output ? "&output=" + service.output : "")
  if (value.startsWith("offer:") && isUuid(value.slice(6))) return commercePaths.offers[locale] + "/" + value.slice(6)
  return null
}
export function queryOrderIntent(query: Record<string, string | string[] | undefined>) {
  if (typeof query.offer === "string" && isUuid(query.offer)) return "offer:" + query.offer
  if (typeof query.service === "string" && orderDestination("service:" + query.service, "en")) return "service:" + query.service + (query.output === "en" || query.output === "id" ? ":" + query.output : "")
  return ""
}
export function intentQuery(intent: string) {
  const service = serviceIntent(intent)
  return service ? "?service=" + service.id + (service.output ? "&output=" + service.output : "") : intent.startsWith("offer:") && isUuid(intent.slice(6)) ? "?offer=" + intent.slice(6) : ""
}
