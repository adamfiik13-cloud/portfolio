"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { ORDER_INTENT_COOKIE, orderDestination } from "./order-intent"
import { authLocale, authOrigin } from "./rules"
import { runAuthFlow, type AuthState } from "./flow"
import { createClient, clearLocalAuthCookies } from "@/lib/supabase/server"
import { authPaths, type AuthFormKind } from "@/data/auth-content"

export async function submitAuth(kind: AuthFormKind, rawLocale: string, token: string, tokenType: string, _previous: AuthState, form: FormData): Promise<AuthState> {
  const locale = authLocale(rawLocale)
  const field = (key: string) => typeof form.get(key) === "string" ? String(form.get(key)) : ""
  let result: AuthState & { destination?: string }
  try {
    const origin = authOrigin(process.env)
    const store = await cookies()
    const intent = field("orderingIntent")
    if (["login", "register"].includes(kind) && orderDestination(intent, locale)) store.set(ORDER_INTENT_COOKIE, intent, { httpOnly: true, secure: process.env.APP_ENV !== "local", sameSite: "lax", path: "/", maxAge: 3600 })
    const client = await createClient()
    result = await runAuthFlow(kind, locale, { email: field("email"), password: field("password"), confirmPassword: field("confirmPassword"), name: field("name"), orderIntent: form.get("orderIntent") === "on", token, tokenType }, client, origin)
    if (result.destination && ["login", "confirm"].includes(kind)) {
      const destination = orderDestination(store.get(ORDER_INTENT_COOKIE)?.value, locale)
      if (destination) { result.destination = destination; store.delete(ORDER_INTENT_COOKIE) }
    }
    if (kind === "register" || (kind === "login" && !result.destination) || (kind === "reset" && result.message !== "invalidPassword")) await clearLocalAuthCookies()
  } catch { return { message: "unavailable" } }
  if (result.destination) redirect(result.destination)
  return result
}

export async function logout(rawLocale: string) {
  const locale = authLocale(rawLocale)
  let failed = false
  try {
    authOrigin(process.env)
    const client = await createClient()
    const result = await client.auth.signOut({ scope: "local" })
    failed = Boolean(result.error)
    await clearLocalAuthCookies()
  } catch { failed = true }
  redirect(authPaths.login[locale] + (failed ? "?notice=logoutFailed" : ""))
}
