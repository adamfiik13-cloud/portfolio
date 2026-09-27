import { MetadataRoute } from "next"
import siteConfig from "@/data/site-config.json"

export default function robots(): MetadataRoute.Robots {
  // Allow crawling so search engines can read staging's noindex metadata.
  if (process.env.APP_ENV === "staging") {
    return { rules: { userAgent: "*", allow: "/" } }
  }

  return {
    rules: {
      userAgent: "*",
      ...(process.env.VERCEL_ENV === "preview" ? { disallow: "/" } : { allow: "/", disallow: "/typography-checkpoint" }),
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
