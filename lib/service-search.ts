import { serviceCategories, type CatalogService, type CategoryId } from "@/data/service-catalog"
import type { PublicLocale } from "@/data/public-content"

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase()

export function filterServices(services: CatalogService[], locale: PublicLocale, query: string, category: CategoryId | "all") {
  const terms = normalize(query).split(" ").filter(Boolean)
  return services.filter(service => {
    if (category !== "all" && service.category !== category) return false
    const categoryCopy = serviceCategories.find(item => item.id === service.category)!
    const text = normalize([service.name[locale], service.description[locale], categoryCopy.name[locale], ...service.scope[locale]].join(" "))
    return terms.every(term => text.includes(term))
  })
}
