"use client"

import { createContext, useContext } from "react"
import { getSiteContent, messages, type MessageId } from "@/data/home-content"
import type { PublicLocale } from "@/data/public-content"

const LocaleContext = createContext<PublicLocale>("en")
export function PublicLocaleProvider({ locale, children }: { locale: PublicLocale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}
export function usePublicLocale() {
  const locale = useContext(LocaleContext)
  return { locale, siteConfig: getSiteContent(locale), t: (id: MessageId) => messages[id][locale] }
}
