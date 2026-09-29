import "server-only"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseConfig } from "./config"

// The only service-role consumer. No generic privileged client is exported.
// The key bypasses RLS: never reuse it for browser/user queries.
export async function checkSupabaseHealth(): Promise<boolean> {
  const { url } = getSupabaseConfig()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("Health configuration unavailable")
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const { data, error } = await client.from("system_health").select("healthy").eq("id", 1).abortSignal(AbortSignal.timeout(5000)).single()
  return !error && data?.healthy === true
}
