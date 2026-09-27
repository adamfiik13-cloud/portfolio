"use client"

import { usePublicLocale } from "@/components/layout/PublicLocaleProvider"

import Image from "next/image"

export default function BrandSignature() {
  const { t, siteConfig } = usePublicLocale()
  return (
    <a href="#hero" className="inline-flex min-h-11 min-w-11 items-center gap-3" aria-label={t("nav.top")}>
      <Image src="/assets/avatar/avatar-circle-64.png" alt="" width={36} height={36} className="rounded-full shrink-0" />
      <span className="font-display font-semibold text-soft text-base">{siteConfig.name}</span>
    </a>
  )
}
