"use client"

import { createContext, useContext } from "react"
import { getSiteContent, messages, type MessageId } from "@/data/home-content"
import type { PublicLocale } from "@/data/public-content"

const homePaths = { en: "/", id: "/id" }
const LocaleContext = createContext<{ locale: PublicLocale; paths: Record<PublicLocale, string> }>({ locale: "en", paths: homePaths })
export function PublicLocaleProvider({ locale, paths = homePaths, children }: { locale: PublicLocale; paths?: Record<PublicLocale, string>; children: React.ReactNode }) {
  return <LocaleContext.Provider value={{ locale, paths }}>{children}</LocaleContext.Provider>
}
export function usePublicLocale() {
  const { locale, paths } = useContext(LocaleContext)
  return { locale, paths, homePath: homePaths[locale], isHome: paths[locale] === homePaths[locale], siteConfig: getSiteContent(locale), t: (id: MessageId) => messages[id][locale] }
}
