import { MetadataRoute } from "next"
import siteConfig from "@/data/site-config.json"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(process.env.VERCEL_ENV === "preview" ? { disallow: "/" } : { allow: "/", disallow: "/typography-checkpoint" }),
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
