import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseConfig } from "./config"

export async function clearLocalAuthCookies() {
  const { url } = getSupabaseConfig()
  const prefix = "sb-" + new URL(url).hostname.split(".")[0] + "-auth-token"
  const store = await cookies()
  store.getAll().filter(cookie => cookie.name === prefix || cookie.name.startsWith(prefix + ".") || cookie.name === prefix + "-code-verifier").forEach(cookie => store.delete(cookie.name))
}

export async function createClient() {
  const { url, key } = getSupabaseConfig()
  const store = await cookies()
  return createServerClient(url, key, {
    cookieOptions: { secure: process.env.APP_ENV !== "local", sameSite: "lax" },
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        // Server Components cannot write cookies. Auth-only Proxy refreshes the
        // session before rendering; never use getSession as identity proof.
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
