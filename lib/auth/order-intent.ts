import { commercePaths } from "../../data/commerce.ts"
import { isUuid, type Locale } from "../commerce/rules.ts"

export const ORDER_INTENT_COOKIE = "aw-order-intent"
export function orderDestination(value: unknown, locale: Locale): string | null {
  if (typeof value !== "string") return null
  if (value.startsWith("service:") && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value.slice(8)) && value.length <= 108) return commercePaths.checkout[locale] + "?service=" + value.slice(8)
  if (value.startsWith("offer:") && isUuid(value.slice(6))) return commercePaths.offers[locale] + "/" + value.slice(6)
  return null
}
export function queryOrderIntent(query: Record<string, string | string[] | undefined>) {
  if (typeof query.offer === "string" && isUuid(query.offer)) return "offer:" + query.offer
  if (typeof query.service === "string" && orderDestination("service:" + query.service, "en")) return "service:" + query.service
  return ""
}
export function intentQuery(intent: string) {
  return intent.startsWith("service:") ? "?service=" + intent.slice(8) : intent.startsWith("offer:") ? "?offer=" + intent.slice(6) : ""
}
