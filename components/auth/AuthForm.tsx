"use client"

import { useActionState } from "react"
import { submitAuth, logout } from "@/lib/auth/actions"
import { authText, type AuthFormKind } from "@/data/auth-content"
import type { PublicLocale } from "@/data/public-content"
import type { AuthState } from "@/lib/auth/flow"
import { useFormStatus } from "react-dom"

const control = "w-full min-h-11 rounded-xl border border-line bg-black px-3 py-3 text-base text-soft disabled:opacity-60"
const button = "inline-flex min-h-11 items-center justify-center rounded-xl bg-red px-6 py-3 font-display font-semibold text-white hover:bg-red-bright disabled:cursor-not-allowed disabled:opacity-60"
export default function AuthForm({ kind, locale, disabled, token = "", tokenType = "" }: { kind: AuthFormKind; locale: PublicLocale; disabled: boolean; token?: string; tokenType?: string }) {
  const [state, action, pending] = useActionState(submitAuth.bind(null, kind, locale, token, tokenType), {} as AuthState)
  const password = kind === "login" || kind === "register" || kind === "reset"
  const fresh = kind === "register" || kind === "reset"
  const submitId = { login: "submitLogin", register: "submitRegister", forgot: "submitForgot", reset: "submitReset", confirm: "submitConfirm" } as const
  return <form action={action} className="space-y-5 font-interface" aria-busy={pending}>
    <fieldset disabled={disabled || pending || Boolean(state.success)} className="space-y-5">
      {kind === "register" && <label className="block space-y-2" htmlFor="auth-name"><span>{authText("name", locale)}</span><input id="auth-name" name="name" autoComplete="name" required maxLength={160} defaultValue={state.name} className={control} /></label>}
      {!["reset", "confirm"].includes(kind) && <label className="block space-y-2" htmlFor="auth-email"><span>{authText("email", locale)}</span><input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={state.email} className={control} /></label>}
      {password && <label className="block space-y-2" htmlFor="auth-password"><span>{authText(fresh ? "newPassword" : "password", locale)}</span><input id="auth-password" name="password" type="password" autoComplete={fresh ? "new-password" : "current-password"} required minLength={fresh ? 12 : 1} maxLength={128} aria-describedby={fresh ? "password-hint" : undefined} className={control} />{fresh && <span id="password-hint" className="block text-sm text-muted">{authText("passwordHint", locale)}</span>}</label>}
      {fresh && <label className="block space-y-2" htmlFor="auth-confirm"><span>{authText("confirmPassword", locale)}</span><input id="auth-confirm" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={control} /></label>}
      {kind === "register" && <label className="flex min-h-11 items-start gap-3 py-2"><input name="orderIntent" type="checkbox" required className="mt-1 size-5 shrink-0 accent-red" /><span>{authText("orderIntent", locale)}</span></label>}
      <button type="submit" className={button} disabled={disabled || pending || Boolean(state.success)}>{authText(pending ? "pending" : submitId[kind], locale)}</button>
    </fieldset>
    {state.message && <p role={state.success ? "status" : "alert"} aria-live="polite" className="rounded-xl border border-line p-4 text-base">{authText(state.message, locale)}</p>}
  </form>
}
function LogoutButton({ locale }: { locale: PublicLocale }) {
  const { pending } = useFormStatus()
  return <button className={button} type="submit" disabled={pending}>{authText(pending ? "pending" : "logout", locale)}</button>
}
export function LogoutForm({ locale }: { locale: PublicLocale }) {
  return <form action={logout.bind(null, locale)}><LogoutButton locale={locale} /></form>
}
