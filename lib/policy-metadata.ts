import type { Metadata } from "next"
import type { PublicLocale } from "@/data/public-content"
import { policyDefinitions, policyOperator, type PolicyId } from "@/data/policies/config"
import { getPublicMetadata } from "./public-metadata"

export function getPolicyMetadata(locale: PublicLocale, policyId: PolicyId): Metadata {
  const policy = policyDefinitions.find(item => item.id === policyId)!
  const base = getPublicMetadata(locale)
  const title = policy.title[locale] + " | " + policyOperator.brand
  const description = policy.description[locale]
  const en = policyOperator.website + policy.paths.en, id = policyOperator.website + policy.paths.id
  const url = locale === "en" ? en : id
  return { ...base, title: { absolute: title }, description,
    alternates: { canonical: url, languages: { en, id, "x-default": en } },
    openGraph: { ...base.openGraph, title, description, url },
    twitter: { ...base.twitter, title, description },
  }
}
