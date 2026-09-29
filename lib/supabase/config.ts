import "server-only"
import { assertProjectIsolation } from "@/lib/backend/environment"

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error("Supabase is not configured")
  assertProjectIsolation(url, process.env)
  return { url, key }
}
