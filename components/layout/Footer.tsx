"use client"

import Link from "next/link"
import { policyDefinitions, policyCopy } from "@/data/policies/config"
import { usePublicLocale } from "@/components/layout/PublicLocaleProvider"

import BrandSignature from "@/components/ui/BrandSignature"
import { authPaths, authText } from "@/data/auth-content"

export default function Footer() {
  const { t, siteConfig, locale } = usePublicLocale()
  return (
    <footer className="border-t border-line bg-black">
      <div className="public-container py-10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <BrandSignature />
            <p className="text-sm text-muted" lang="en">{siteConfig.role}</p>
            <p className="text-sm text-muted" lang="en">{siteConfig.tagline}</p>
            <p className="text-xs text-muted">{t("hero.founder")}</p>
          </div>
          <nav aria-label={t("footer.contact")} className="flex flex-wrap gap-x-6 text-sm text-muted">
            <a className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={"mailto:" + siteConfig.email}>Email</a>
            <a className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={siteConfig.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn Fikri</a>
            <a className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
            <Link className="min-h-11 min-w-11 inline-flex items-center hover:text-white" href={authPaths.login[locale]}>{authText("login", locale)}</Link>
          </nav>
        </div>
        <nav aria-label={policyCopy.group[locale]} className="border-t border-line pt-5">
          <p className="font-display text-base mb-2">{policyCopy.group[locale]}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-interface text-sm text-muted">
            {policyDefinitions.map(policy => <Link key={policy.id} href={policy.paths[locale]} className="inline-flex min-h-11 items-center hover:text-white underline underline-offset-4">{policy.label[locale]}</Link>)}
          </div>
        </nav>
        <p className="text-xs text-muted">&copy; {new Date().getFullYear()} {siteConfig.name}</p>
      </div>
    </footer>
  )
}
