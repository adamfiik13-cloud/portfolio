import type { Metadata } from "next"
import { getPublicMetadata } from "./public-metadata"
import { catalogPaths, servicePath, type CatalogService } from "@/data/service-catalog"
import { getServiceCopy } from "@/data/service-copy"
import siteConfig from "@/data/site-config.json"
import type { PublicLocale } from "@/data/public-content"

export function getServiceMetadata(locale: PublicLocale, service?: CatalogService): Metadata {
  const base = getPublicMetadata(locale)
  const t = getServiceCopy(locale)
  const paths = service ? { en: servicePath(service, "en"), id: servicePath(service, "id") } : catalogPaths
  const title = (service ? service.name[locale] : t("label")) + " | Adam’s Work"
  const description = service ? service.description[locale] : t("intro")
  const en = siteConfig.url + paths.en, id = siteConfig.url + paths.id
  const url = locale === "en" ? en : id
  return { ...base, title: { absolute: title }, description,
    alternates: { canonical: url, languages: { en, id, "x-default": en } },
    openGraph: { ...base.openGraph, title, description, url },
    twitter: { ...base.twitter, title, description },
  }
}
