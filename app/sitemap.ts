import { MetadataRoute } from "next"
import siteConfig from "@/data/site-config.json"

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.APP_ENV === "staging") return []

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ]
}
