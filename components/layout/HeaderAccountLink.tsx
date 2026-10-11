"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { verifiedUser } from "@/lib/auth/rules"
import { authPaths } from "@/data/auth-content"
import { commercePaths } from "@/data/commerce"
import type { PublicLocale } from "@/data/public-content"

export function headerAccountDestination(locale: PublicLocale, signedIn: boolean) {
  return signedIn ? commercePaths.orders[locale] : authPaths.login[locale]
}

export default function HeaderAccountLink({ locale, expanded = false, onNavigate }: { locale: PublicLocale; expanded?: boolean; onNavigate?: () => void }) {
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    let active = true
    try {
      const client = createClient()
      void client.auth.getUser().then(({ data, error }) => { if (active) setSignedIn(!error && verifiedUser(data.user)) }).catch(() => { if (active) setSignedIn(false) })
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => { if (active) setSignedIn(verifiedUser(session?.user)) })
      return () => { active = false; subscription.unsubscribe() }
    } catch { return () => { active = false } }
  }, [])
  const label = signedIn ? (locale === "en" ? "My orders" : "Pesanan saya") : (locale === "en" ? "Login" : "Masuk")
  // Session state affects a navigation label only. The destination still authorizes server-side.
  return <a href={headerAccountDestination(locale, signedIn)} aria-label={label} title={label} onClick={onNavigate}
    className={"inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg text-muted hover:text-white hover:bg-white/5 font-interface text-sm " + (expanded ? "px-4" : "lg:px-3")}>
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>
    <span className={expanded ? "" : "sr-only lg:not-sr-only"}>{label}</span>
  </a>
}
