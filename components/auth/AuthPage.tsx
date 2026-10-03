import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authPaths, authText, type AuthFormKind, type AuthPageId } from "@/data/auth-content"
import type { PublicLocale } from "@/data/public-content"
import { PublicLocaleProvider } from "@/components/layout/PublicLocaleProvider"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import BrandSignature from "@/components/ui/BrandSignature"
import AuthForm, { LogoutForm } from "./AuthForm"
import { authContext } from "@/lib/auth/context"
import { validToken } from "@/lib/auth/rules"

export type AuthSearch = Promise<Record<string, string | string[] | undefined>>
export function authMetadata(kind: AuthPageId, locale: PublicLocale): Metadata {
  return { title: authText(kind, locale), robots: { index: false, follow: false }, alternates: { canonical: null, languages: {} }, openGraph: null, twitter: null, referrer: "no-referrer" }
}
function Shell({ locale, kind, children, token = "", tokenType = "" }: { locale: PublicLocale; kind: AuthPageId; children: React.ReactNode; token?: string; tokenType?: string }) {
  const suffix = token ? "?token_hash=" + encodeURIComponent(token) + "&type=" + encodeURIComponent(tokenType) : ""
  const paths = { en: authPaths[kind].en + suffix, id: authPaths[kind].id + suffix }
  return <PublicLocaleProvider locale={locale} paths={paths}>
    <a href="#auth-main" className="skip-link">{authText(kind, locale)}</a>
    <header className="public-container flex min-h-20 items-center justify-between gap-4"><BrandSignature /><LanguageSwitcher /></header>
    <main id="auth-main" className="public-container py-12 sm:py-20"><div className="mx-auto max-w-xl space-y-7 rounded-2xl border border-line bg-surface p-6 sm:p-10 font-interface">
      <p className="text-sm text-muted">Adam’s Work</p><h1 className="font-display text-4xl font-bold leading-tight">{authText(kind, locale)}</h1>{children}
      <Link href={locale === "en" ? "/" : "/id"} className="inline-flex min-h-11 items-center text-muted underline underline-offset-4 hover:text-white">{authText("back", locale)}</Link>
    </div></main>
  </PublicLocaleProvider>
}
export async function AuthPage({ kind, locale, searchParams }: { kind: AuthFormKind; locale: PublicLocale; searchParams: AuthSearch }) {
  const context = await authContext()
  if (["login", "register"].includes(kind) && context.user) redirect(authPaths.account[locale])
  const query = await searchParams
  const token = typeof query.token_hash === "string" ? query.token_hash : ""
  const tokenType = typeof query.type === "string" ? query.type : ""
  if (kind === "confirm" && ["recovery", "invite"].includes(tokenType) && validToken(token)) redirect(authPaths.reset[locale] + "?token_hash=" + encodeURIComponent(token) + "&type=" + tokenType)
  const badLink = ["reset", "confirm"].includes(kind) && (!validToken(token) || (kind === "reset" ? !["recovery", "invite"].includes(tokenType) : tokenType !== "signup"))
  const intro = { login: "loginIntro", register: "registerIntro", forgot: "forgotIntro", reset: "resetIntro", confirm: "confirmIntro" } as const
  const notice = typeof query.notice === "string" && ["passwordSaved", "invalidLink", "logoutFailed"].includes(query.notice) ? query.notice as "passwordSaved" | "invalidLink" | "logoutFailed" : null
  return <Shell kind={kind} locale={locale} token={badLink ? "" : token} tokenType={tokenType}>
    <p className="text-muted leading-relaxed">{authText(intro[kind], locale)}</p>
    {notice && <p role="status" className="rounded-xl border border-line p-4">{authText(notice, locale)}</p>}
    {!context.configured && <p role="status">{authText("unavailable", locale)}</p>}
    {badLink ? <p role="alert">{authText("invalidLink", locale)}</p> : <AuthForm kind={kind} locale={locale} disabled={!context.configured} token={token} tokenType={tokenType} />}
    <nav className="flex flex-col items-start gap-1 text-muted underline underline-offset-4">
      {kind !== "login" && <Link className="inline-flex min-h-11 items-center" href={authPaths.login[locale]}>{authText("loginLink", locale)}</Link>}
      {kind === "login" && <Link className="inline-flex min-h-11 items-center" href={authPaths.register[locale]}>{authText("registerLink", locale)}</Link>}
      {kind !== "forgot" && <Link className="inline-flex min-h-11 items-center" href={authPaths.forgot[locale]}>{authText("forgot", locale)}</Link>}
      {kind === "register" && <Link className="inline-flex min-h-11 items-center" href={locale === "en" ? "/services" : "/id/layanan"}>{authText("browse", locale)}</Link>}
    </nav>
  </Shell>
}
export async function AccountPage({ locale }: { locale: PublicLocale }) {
  const { client, user } = await authContext()
  if (!client || !user) redirect(authPaths.login[locale])
  const { data: profile } = await client.from("profiles").select("display_name,locale").eq("id", user.id).maybeSingle()
  const { data: staff } = await client.from("staff_access").select("role,active").eq("user_id", user.id).maybeSingle()
  const role = staff?.active && ["owner", "admin", "team"].includes(staff.role) ? staff.role as "owner" | "admin" | "team" : null
  return <Shell kind="account" locale={locale}>
    <dl className="space-y-5 break-words"><div><dt className="text-muted">{authText("email", locale)}</dt><dd>{user.email}</dd></div>
      <div><dt className="text-muted">{authText("name", locale)}</dt><dd>{profile?.display_name || authText("noName", locale)}</dd></div>
      <div><dt className="text-muted">{authText("locale", locale)}</dt><dd>{profile?.locale === "id" ? "Bahasa Indonesia" : profile?.locale === "en" ? "English" : authText("noName", locale)}</dd></div>
    </dl><p>{authText("verified", locale)}</p>{role && <p>{authText(role, locale)}</p>}<p className="text-muted">{authText("portal", locale)}</p><LogoutForm locale={locale} />
  </Shell>
}
