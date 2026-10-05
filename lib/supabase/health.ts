import "server-only"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseConfig } from "./config"

// Read-only health consumer. Commerce mutations use a separate module-private client.
// The key bypasses RLS: never reuse it for browser/user reads.
export async function checkSupabaseHealth(): Promise<boolean> {
  const { url } = getSupabaseConfig()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("Health configuration unavailable")
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const { data, error } = await client.from("system_health").select("healthy").eq("id", 1).abortSignal(AbortSignal.timeout(5000)).single()
  return !error && data?.healthy === true
}
