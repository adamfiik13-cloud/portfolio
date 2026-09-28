import { MetadataRoute } from "next"
import { policyDefinitions } from "@/data/policies/config"
import siteConfig from "@/data/site-config.json"
import { catalogPaths, catalogServices, servicePath } from "@/data/service-catalog"

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.APP_ENV === "staging") return []
  const pairs = [{ en: "/", id: "/id" }, catalogPaths, ...policyDefinitions.map(policy => policy.paths), ...catalogServices.map(service => ({ en: servicePath(service, "en"), id: servicePath(service, "id") }))]
  return pairs.flatMap(paths => {
    const en = siteConfig.url + paths.en, id = siteConfig.url + paths.id
    const languages = { en, id, "x-default": en }
    return [en, id].map(url => ({ url, lastModified: new Date(), changeFrequency: "monthly" as const, priority: paths.en === "/" ? 1 : 0.8, alternates: { languages } }))
  })
}
