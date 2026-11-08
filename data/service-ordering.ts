import type { PublicLocale } from "./public-content"
import { isUuid } from "@/lib/commerce/rules"

// Public presentation only. Eligibility is resolved by the server from approved
// packages; an absent/unknown mode must never advertise direct ordering.
export type ServiceOrderMode = "direct" | "compatibility" | "inquiry"
export type ServiceOrderFilter = "all" | "direct" | "discuss"
export type ServiceOrderModes = Record<string, ServiceOrderMode>
export function orderingGroup(mode: ServiceOrderMode | undefined): Exclude<ServiceOrderFilter, "all"> {
  return mode === "direct" ? "direct" : "discuss"
}
export function filterByOrdering<T extends { id: string }>(services: T[], modes: ServiceOrderModes, filter: ServiceOrderFilter) {
  return filter === "all" ? services : services.filter(service => orderingGroup(modes[service.id]) === filter)
}
export function readServiceIntent(locale: PublicLocale, search: string) {
  const query = new URLSearchParams(search), output = query.get("output"), approval = query.get("approval")
  return { output: output === "en" || output === "id" ? output : locale, explicitOutput: output === "en" || output === "id", approval: isUuid(approval) ? approval : null }
}
