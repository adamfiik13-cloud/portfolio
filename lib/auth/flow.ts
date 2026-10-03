import type { SupabaseClient } from "@supabase/supabase-js"
import { authPaths, type AuthFormKind, type AuthMessageId } from "../../data/auth-content.ts"
import { validEmail, validPassword, validToken, verifiedUser, type AuthLocale } from "./rules.ts"

export type AuthState = { message?: AuthMessageId; success?: boolean; email?: string; name?: string }
type Input = { email: string; password: string; confirmPassword: string; name: string; orderIntent: boolean; token: string; tokenType: string }
type Result = AuthState & { destination?: string }
export async function runAuthFlow(kind: AuthFormKind, locale: AuthLocale, input: Input, client: SupabaseClient, origin: string): Promise<Result> {
  const auth = client.auth
  const email = input.email.trim().toLowerCase(), name = input.name.trim()
  const keep = { email, name }
  try {
    if (kind === "confirm" || kind === "reset") {
      if (!validToken(input.token) || (kind === "confirm" ? input.tokenType !== "signup" : !["recovery", "invite"].includes(input.tokenType))) return { message: "invalidLink" }
      if (kind === "reset" && (!validPassword(input.password) || input.password !== input.confirmPassword)) return { message: "invalidPassword" }
      // Consume the one-time email capability only on an explicit POST. An ordinary
      // authenticated session alone never authorizes this password-reset action.
      const { data, error } = await auth.verifyOtp({ token_hash: input.token, type: input.tokenType as "signup" | "recovery" | "invite" })
      if (error || !data.user || !verifiedUser(data.user)) { await auth.signOut({ scope: "local" }); return { message: "invalidLink" } }
      const identity = await auth.getUser()
      if (identity.error || identity.data.user?.id !== data.user.id || !verifiedUser(identity.data.user)) { await auth.signOut({ scope: "local" }); return { message: "invalidLink" } }
      if (kind === "reset") {
        const result = await auth.updateUser({ password: input.password })
        if (result.error) { await auth.signOut({ scope: "local" }); return { message: "invalidLink" } }
        const signedOut = await auth.signOut({ scope: "global" })
        if (signedOut.error) { await auth.signOut({ scope: "local" }); return { message: "logoutFailed" } }
        return { destination: authPaths.login[locale] + "?notice=passwordSaved" }
      }
      // Only editable profile fields; never copy a role from user metadata.
      const displayName = typeof data.user.user_metadata.display_name === "string" ? data.user.user_metadata.display_name.trim().slice(0, 160) : ""
      await client.from("profiles").update({ display_name: displayName, locale }).eq("id", data.user.id)
      return { destination: authPaths.account[locale] + "?notice=verifiedNotice" }
    }
    if (!validEmail(email)) return { ...keep, message: "invalid" }
    if (kind === "forgot") {
      await auth.resetPasswordForEmail(email, { redirectTo: origin + authPaths.confirm[locale] + "?locale=" + locale })
      // The same response for absent users, provider errors, rate limits and success.
      return { ...keep, message: "resetSent", success: true }
    }
    if (kind === "register") {
      if (!input.orderIntent || !name || name.length > 160) return { ...keep, message: "invalid" }
      if (!validPassword(input.password) || input.password !== input.confirmPassword) return { ...keep, message: "invalidPassword" }
      await auth.signUp({ email, password: input.password, options: { emailRedirectTo: origin + authPaths.confirm[locale] + "?locale=" + locale, data: { display_name: name, locale } } })
      // Never keep auto-created sessions if email confirmation is misconfigured.
      await auth.signOut({ scope: "local" })
      return { ...keep, message: "checkEmail", success: true }
    }
    if (!input.password || input.password.length > 128) return { ...keep, message: "invalid" }
    const result = await auth.signInWithPassword({ email, password: input.password })
    if (result.error || !verifiedUser(result.data.user)) { await auth.signOut({ scope: "local" }); return { ...keep, message: "failed" } }
    const identity = await auth.getUser()
    if (identity.error || !verifiedUser(identity.data.user)) { await auth.signOut({ scope: "local" }); return { ...keep, message: "failed" } }
    return { destination: authPaths.account[locale] }
  } catch {
    if (kind === "forgot" || kind === "register") return { ...keep, message: kind === "forgot" ? "resetSent" : "checkEmail", success: true }
    return { ...keep, message: "failed" }
  }
}
