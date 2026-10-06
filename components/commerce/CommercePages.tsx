import { randomUUID } from "node:crypto"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import BrandSignature from "@/components/ui/BrandSignature"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import { PublicLocaleProvider } from "@/components/layout/PublicLocaleProvider"
import { authPaths } from "@/data/auth-content"
import { commercePaths, commerceText as t, statusLabel } from "@/data/commerce"
import { catalogTerms } from "@/data/commerce-catalog"
import { serviceInquiry } from "@/data/service-catalog"
import { policyDefinitions, type PolicyContent } from "@/data/policies/config"
import { PolicyBlockContent } from "@/components/policies/PolicyPage"
import { agreement, commerceContext, offerAgreement, ownerContext, policyBundle } from "@/lib/commerce/server"
import { isUuid, type Locale, type TransactionTerms } from "@/lib/commerce/rules"
import { AcceptanceForm, OwnerOfferForm } from "./CommerceForms"
import PaymentPanel from "./PaymentPanel"
import { paymentReady } from "@/lib/payments/server"
import { paymentCopy } from "@/data/payment-copy"

export type CommerceKind = keyof typeof commercePaths
export type CommerceSearch = Promise<Record<string, string | string[] | undefined>>
export function commerceMetadata(kind: CommerceKind, locale: Locale): Metadata {
  return { title: t(kind, locale), robots: { index: false, follow: false }, alternates: { canonical: null, languages: {} }, openGraph: null, twitter: null, referrer: "no-referrer" }
}
function Shell({ kind, locale, suffix = "", children }: { kind: CommerceKind; locale: Locale; suffix?: string; children: React.ReactNode }) {
  return <PublicLocaleProvider locale={locale} paths={{ en: commercePaths[kind].en + suffix, id: commercePaths[kind].id + suffix }}>
    <a className="skip-link" href="#commerce-main">{t(kind, locale)}</a>
    <header className="public-container min-h-20 flex items-center justify-between gap-4"><BrandSignature /><LanguageSwitcher /></header>
    <main id="commerce-main" tabIndex={-1} className="public-container py-10 sm:py-16 font-interface">
      <div className="mx-auto max-w-3xl space-y-8 break-words min-w-0">
        <h1 className="font-display font-bold text-4xl leading-tight">{t(kind, locale)}</h1>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-muted underline underline-offset-4" aria-label={t("account", locale)}>{(["orders", "offers"] as const).map(k => <a key={k} className="inline-flex min-h-11 items-center" href={commercePaths[k][locale]}>{t(k, locale)}</a>)}<a className="inline-flex min-h-11 items-center" href={authPaths.account[locale]}>{t("account", locale)}</a></nav>
        <div className="border-l-2 border-red pl-5 space-y-3"><p>{paymentReady() ? paymentCopy[locale].notice : t("payment", locale)}</p><p className="text-muted">{t("commencement", locale)}</p></div>
        {children}
      </div>
    </main>
  </PublicLocaleProvider>
}
const list = (items: string[]) => <ul className="list-disc pl-5 space-y-1">{items.map((s, i) => <li key={i}>{s}</li>)}</ul>
function Summary({ terms, locale, incomplete = false }: { terms: TransactionTerms; locale: Locale; incomplete?: boolean }) {
  return <section className="space-y-6 border border-line rounded-2xl p-5 sm:p-8">
    <h2 className="font-display text-3xl font-semibold">{terms.service_name}</h2>
    <dl className="space-y-5">
      <div><dt className="text-muted">{incomplete ? (locale === "en" ? "Catalog price (confirmation required)" : "Harga katalog (perlu konfirmasi)") : t("price", locale)}</dt><dd className="font-display text-2xl">IDR {new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID").format(terms.amount_idr)}</dd></div>
      {(["scope", "deliverables", "exclusions", "requirements"] as const).map(k => <div key={k}><dt className="font-semibold mb-2">{t(k, locale)}</dt><dd className="text-muted">{list(terms[k])}</dd></div>)}
      <div><dt className="font-semibold">{t("duration", locale)}</dt><dd className="text-muted">{terms.estimated_duration}</dd></div>
      <div><dt className="font-semibold">{t("revisions", locale)}</dt><dd className="text-muted">{terms.revision_rule.description}</dd></div>
      {terms.milestones.length > 0 && <div><dt className="font-semibold">{t("milestones", locale)}</dt><dd className="text-muted">{list(terms.milestones.map(m => m.label + " — IDR " + new Intl.NumberFormat(locale).format(m.amount_idr)))}</dd></div>}
      {terms.cost_disclosure && <div><dt className="font-semibold">{t("fees", locale)}</dt><dd className="text-muted whitespace-pre-wrap">{terms.cost_disclosure}</dd></div>}
    </dl>
  </section>
}
function Policies({ locale, bundle }: { locale: Locale; bundle: ReturnType<typeof policyBundle> }) {
  return <section className="space-y-4"><h2 className="font-display text-2xl">{t("policies", locale)}</h2>{bundle.map(p => {
    const definition = policyDefinitions.find(d => d.id === p.policy_type)!
    const content = JSON.parse(p.content) as PolicyContent
    return <details key={p.policy_type} className="border border-line rounded-xl p-4"><summary className="min-h-11 py-2 cursor-pointer">{definition.title[locale]} — {t("version", locale)} {p.version} · {t("effective", locale)} {new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(p.effective_date + "T00:00:00Z"))}</summary>
      <div className="space-y-5 pt-3 font-longform text-muted">{content.sections.map(s => <section key={s.id}><h3 className="font-display text-xl text-soft mb-3">{s.title}</h3><div className="space-y-3">{s.blocks.map((b, i) => <PolicyBlockContent key={i} block={b} locale={locale} />)}</div></section>)}</div>
    </details>
  })}</section>
}
async function signedIn(locale: Locale, offerId?: string) {
  const context = await commerceContext()
  if (!context.client || !context.user) redirect(authPaths.login[locale] + (offerId && isUuid(offerId) ? "?offer=" + offerId : ""))
  return { client: context.client, user: context.user }
}
export async function CheckoutPage({ locale, searchParams }: { locale: Locale; searchParams: CommerceSearch }) {
  const query = await searchParams
  const id = typeof query.service === "string" ? query.service : ""
  const catalog = catalogTerms(id, locale)
  if (!catalog) notFound()
  const context = await commerceContext()
  const current = agreement(catalog.terms, locale)
  return <Shell kind="checkout" locale={locale} suffix={"?service=" + encodeURIComponent(id)}>
    <Summary locale={locale} terms={catalog.terms} incomplete={!catalog.eligible} />
    {!catalog.eligible && <div className="space-y-3"><p>{t("missing", locale)}</p>{list(catalog.missing)}<a className="inline-flex min-h-11 items-center underline text-red-bright" href={serviceInquiry(catalog.service, locale)} target="_blank" rel="noopener noreferrer">{t("inquiry", locale)}</a></div>}
    <Policies locale={locale} bundle={current.policies} />
    {!context.user ? <div className="flex flex-col items-start gap-2">{(["login", "register"] as const).map(k => <a key={k} className="inline-flex min-h-11 items-center underline" href={authPaths[k][locale] + "?service=" + encodeURIComponent(id)}>{t(k === "login" ? "signIn" : "register", locale)}</a>)}</div>
      : catalog.eligible && <AcceptanceForm locale={locale} serviceId={id} fingerprint={current.fingerprint} requestKey={randomUUID()} />}
  </Shell>
}
export async function OrdersPage({ locale, id }: { locale: Locale; id?: string }) {
  const { client, user } = await signedIn(locale)
  if (id && !isUuid(id)) notFound()
  if (!id) {
    const { data, error } = await client.from("orders").select("id,service_id,amount_idr,work_status,payment_status,refund_status,created_at").eq("client_id", user.id).order("created_at", { ascending: false }).limit(100)
    return <Shell kind="orders" locale={locale}>{error ? <p role="status">{t("unavailable", locale)}</p> : !data?.length ? <p>{t("empty", locale)}</p> : <ul className="space-y-4">{data.map(o => <li key={o.id} className="border border-line rounded-xl p-5"><a className="inline-flex min-h-11 underline break-all" href={commercePaths.orders[locale] + "/" + o.id}>{o.id}</a><p>IDR {o.amount_idr.toLocaleString(locale)} · {statusLabel(o.work_status, locale)} · {statusLabel(o.payment_status, locale)}</p></li>)}</ul>}</Shell>
  }
  const { data: order, error } = await client.from("orders").select("id,locale,work_status,payment_status,refund_status").eq("id", id).eq("client_id", user.id).maybeSingle()
  if (error) return <Shell kind="orders" locale={locale}><p role="status">{t("unavailable", locale)}</p></Shell>
  if (!order) notFound()
  const [{ data: snapshot, error: snapshotError }, { data: brief }, { data: accepted, error: acceptanceError }] = await Promise.all([
    client.from("order_snapshots").select("selected_package,policy_version_ids,created_at").eq("order_id", id).single(),
    client.from("briefs").select("status").eq("order_id", id).maybeSingle(),
    client.from("policy_acceptances").select("policy_type,version,locale,effective_date,accepted_at").eq("order_id", id).eq("user_id", user.id),
  ])
  const { data: policies, error: policiesError } = await client.from("policy_versions").select("policy_type,version,locale,effective_date,content,content_sha256").in("id", snapshot?.policy_version_ids ?? [])
  const contractLocale = order.locale as Locale
  return <Shell kind="orders" locale={locale} suffix={"/" + id}>
    <p className="break-all">{id}</p><dl className="grid sm:grid-cols-2 gap-5">{([["work", order.work_status], ["paymentStatus", order.payment_status], ["refund", order.refund_status], ["brief", brief?.status ?? "incomplete"]] as const).map(([key, value]) => <div key={key}><dt className="text-muted">{t(key, locale)}</dt><dd>{statusLabel(value, locale)}</dd></div>)}</dl>
    <PaymentPanel orderId={id} locale={locale} ready={paymentReady()} paid={order.payment_status === "paid"} eligible={!["cancelled", "completed"].includes(order.work_status)} />
    {snapshotError || acceptanceError || policiesError || !snapshot?.selected_package?.terms ? <p role="status">{t("unavailable", locale)}</p> : <>
      <h2 className="font-display text-2xl">{t("terms", locale)} · {contractLocale === "en" ? "English" : "Bahasa Indonesia"}</h2>
      <p className="text-muted">{locale === "en" ? "The accepted agreement is retained in its original contractual language. Later content changes do not change it." : "Kesepakatan yang disetujui disimpan dalam bahasa kontrak asli. Perubahan konten berikutnya tidak mengubahnya."}</p>
      <div lang={contractLocale}><Summary terms={snapshot.selected_package.terms} locale={contractLocale} /><Policies locale={contractLocale} bundle={policies ?? []} /></div>
      <ul className="text-muted space-y-2">{accepted?.map(a => <li key={a.policy_type}>{policyDefinitions.find(p => p.id === a.policy_type)?.label[locale]} · {t("version", locale)} {a.version} · {new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(a.accepted_at))}</li>)}</ul>
    </>}
  </Shell>
}
export async function OffersPage({ locale, id }: { locale: Locale; id?: string }) {
  const { client, user } = await signedIn(locale, id)
  if (!id) {
    const { data, error } = await client.from("custom_offers").select("id,transaction_terms,status,expires_at").eq("client_id", user.id).neq("status", "draft").order("created_at", { ascending: false }).limit(100)
    return <Shell kind="offers" locale={locale}>{error ? <p role="status">{t("unavailable", locale)}</p> : !data?.length ? <p>{t("empty", locale)}</p> : <ul className="space-y-4">{data.map(o => <li key={o.id} className="border border-line rounded-xl p-5"><a className="inline-flex min-h-11 underline" href={commercePaths.offers[locale] + "/" + o.id}>{o.transaction_terms?.[locale]?.service_name ?? o.id}</a><p>{statusLabel(o.status, locale)}</p></li>)}</ul>}</Shell>
  }
  let current: Awaited<ReturnType<typeof offerAgreement>>
  try { current = await offerAgreement(id, locale) } catch { return <Shell kind="offers" locale={locale}><p role="status">{t("unavailable", locale)}</p></Shell> }
  if (!current) notFound()
  const canAccept = current.canAccept
  return <Shell kind="offers" locale={locale} suffix={"/" + id}>
    <p>{t("version", locale)} {current.offer.version} · {statusLabel(current.offer.status, locale)}</p>
    <p>{t("expires", locale)}: {new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(current.offer.expires_at))} WITA</p>
    <Summary terms={current.terms} locale={locale} /><Policies locale={locale} bundle={current.policies} />
    {canAccept ? <AcceptanceForm locale={locale} offerId={id} fingerprint={current.fingerprint} requestKey={randomUUID()} /> : current.offer.order_id ? <a className="inline-flex min-h-11 underline" href={commercePaths.orders[locale] + "/" + current.offer.order_id}>{t("terms", locale)}</a> : <p>{t("changed", locale)}</p>}
  </Shell>
}
export async function OwnerOffersPage({ locale }: { locale: Locale }) {
  await signedIn(locale)
  const context = await ownerContext()
  if (!context?.client || !context.user) notFound()
  const [{ data: clients, error }, { data: offers, error: offerError }] = await Promise.all([
    context.client.from("profiles").select("id,display_name,email").order("created_at", { ascending: false }).limit(200),
    context.client.from("custom_offers").select("id,title,status,expires_at").eq("created_by", context.user.id).order("created_at", { ascending: false }).limit(100),
  ])
  return <Shell kind="owner" locale={locale}>
    {error || offerError ? <p role="status">{t("unavailable", locale)}</p> : <><OwnerOfferForm locale={locale} requestKey={randomUUID()} clients={clients ?? []} /><ul className="space-y-4">{offers?.map(o => <li key={o.id} className="border border-line rounded-xl p-4"><p>{o.title} · {statusLabel(o.status, locale)}</p><p className="text-muted break-all">{commercePaths.offers[locale] + "/" + o.id}</p></li>)}</ul></>}
  </Shell>
}
