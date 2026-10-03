export type AuthLocale = "en" | "id"
export const authLocale = (value: unknown): AuthLocale => value === "id" ? "id" : "en"
export function validEmail(value: string) { return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) }
export function validPassword(value: string) {
  return value.length >= 12 && value.length <= 128 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^a-zA-Z0-9\s]/.test(value)
}
export function validToken(value: string) { return /^[a-zA-Z0-9_-]{32,512}$/.test(value) }
export function verifiedUser(user: { email_confirmed_at?: string | null; email?: string; is_anonymous?: boolean } | null | undefined) {
  return Boolean(user?.email && user.email_confirmed_at && !user.is_anonymous)
}
// No next/redirect URL supplied by a browser is accepted by the auth flow.
export function authOrigin(env: Record<string, string | undefined>) {
  const url = new URL(env.NEXT_PUBLIC_SITE_URL || (env.APP_ENV === "staging" ? "https://staging.adamswork.app" : ""))
  if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) throw new Error("Invalid auth origin")
  const local = env.APP_ENV === "local" && !env.VERCEL && ["localhost", "127.0.0.1"].includes(url.hostname)
  if (!local && (env.APP_ENV !== "staging" || url.origin !== "https://staging.adamswork.app")) throw new Error("Staging auth origin required")
  return url.origin
}
