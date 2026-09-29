import { createBrowserClient } from "@supabase/ssr"

// Created only by future authenticated UI, never by the static public pages.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error("Supabase is not configured")
  return createBrowserClient(url, key)
}
