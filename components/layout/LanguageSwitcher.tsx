"use client"

import { usePublicLocale } from "./PublicLocaleProvider"

export default function LanguageSwitcher() {
  const { locale, t } = usePublicLocale()
  return <nav aria-label={t("nav.language")} className="flex shrink-0 items-center font-interface text-xs">
    {(["en", "id"] as const).map(language => <a
      key={language} href={language === "en" ? "/" : "/id"} hrefLang={language} lang={language}
      aria-current={locale === language ? "page" : undefined}
      aria-label={language === "en" ? "English" : "Bahasa Indonesia"}
      onClick={event => { event.currentTarget.href = (language === "en" ? "/" : "/id") + window.location.hash }}
      className={"inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-white/5 " + (locale === language ? "text-white underline underline-offset-4" : "text-muted")}
    >{language.toUpperCase()}</a>)}
  </nav>
}
