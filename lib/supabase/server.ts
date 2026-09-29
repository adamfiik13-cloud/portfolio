import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseConfig } from "./config"

export async function createClient() {
  const { url, key } = getSupabaseConfig()
  const store = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        // Server Components cannot write cookies. Future auth routes must use
        // updateSession in Proxy before rendering; never use getSession as proof.
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)) } catch { /* read-only Server Component */ }
      },
    },
  })
}

export async function requireUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error("Unauthorized")
  return { supabase, user: data.user }
}
