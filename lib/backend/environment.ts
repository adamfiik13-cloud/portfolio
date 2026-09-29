export function backendEnvironment() {
  if (process.env.APP_ENV === "staging") return "staging"
  if (process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production") return "production"
  return "development"
}

export function assertProjectIsolation(url: string, env: Record<string, string | undefined>) {
  const host = new URL(url).hostname
  const local = env.APP_ENV === "local" && !env.VERCEL && ["localhost", "127.0.0.1"].includes(host)
  if (local) return
  const staging = env.SUPABASE_STAGING_PROJECT_REF
  const production = env.SUPABASE_PRODUCTION_PROJECT_REF
  if (!staging || !production || staging === production) throw new Error("Separate Supabase project references required")
  const expected = env.APP_ENV === "staging" ? staging : env.VERCEL_ENV === "production" || env.APP_ENV === "production" ? production : staging
  if (env.SUPABASE_PROJECT_REF !== expected || host !== expected + ".supabase.co" || new URL(url).protocol !== "https:") {
    throw new Error("Supabase environment mismatch")
  }
}
