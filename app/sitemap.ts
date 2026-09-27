import { MetadataRoute } from "next"
import siteConfig from "@/data/site-config.json"

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.APP_ENV === "staging") return []

  const languages = { en: siteConfig.url + "/", id: siteConfig.url + "/id", "x-default": siteConfig.url + "/" }
  return [languages.en, languages.id].map(url => ({
    url, lastModified: new Date(), changeFrequency: "monthly", priority: 1,
    alternates: { languages },
  }))
}
