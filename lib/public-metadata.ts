import type { Metadata } from "next"
import { getSiteContent } from "@/data/home-content"
import type { PublicLocale } from "@/data/public-content"

export function getPublicMetadata(locale: PublicLocale): Metadata {
  const site = getSiteContent(locale)
  const url = site.url + (locale === "en" ? "/" : "/id")
  const title = site.name + " — " + site.role
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: "%s | Adam’s Work" },
    description: site.description,
    alternates: { canonical: url, languages: { en: site.url + "/", id: site.url + "/id", "x-default": site.url + "/" } },
    authors: [{ name: site.founder }], creator: site.name,
    openGraph: {
      type: "website", locale: locale === "en" ? "en_US" : "id_ID", alternateLocale: locale === "en" ? "id_ID" : "en_US",
      url, title, description: site.description, siteName: site.name,
      images: [{ url: "/assets/avatar/avatar-about-640.webp", width: 640, height: 640,
        alt: locale === "en" ? "Fikri Adam, founder of Adam’s Work" : "Fikri Adam, pendiri Adam’s Work" }],
    },
    twitter: { card: "summary", title, description: site.description, images: ["/assets/avatar/avatar-about-640.webp"] },
    icons: { icon: { url: "/assets/brand/adams-work.svg", type: "image/svg+xml" }, apple: "/assets/avatar/avatar-circle-64.png" },
    robots: {
      index: process.env.APP_ENV !== "staging" && process.env.VERCEL_ENV !== "preview",
      follow: process.env.APP_ENV !== "staging",
    },
  }
}
