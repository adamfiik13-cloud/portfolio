import type { Locale } from "@/lib/commerce/rules"
import type { readWorkspace } from "@/lib/workspace/server"
import { PublicLocaleProvider } from "@/components/layout/PublicLocaleProvider"
import BrandSignature from "@/components/ui/BrandSignature"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import { commercePaths, commerceText, statusLabel } from "@/data/commerce"
import { authPaths } from "@/data/auth-content"
import { orderDetailText as t, orderDetailStep } from "@/data/order-detail"
import BriefWorkspace, { BriefHistory } from "./BriefWorkspace"
import OrderRefresh from "./OrderRefresh"
import "./order-detail.css"

type Workspace = NonNullable<Awaited<ReturnType<typeof readWorkspace>>>
export default function OrderDetail({ locale, workspace, asOwner, payment, email, children }: { locale: Locale; workspace: Workspace; asOwner: boolean; payment: React.ReactNode; email: React.ReactNode; children: React.ReactNode }) {
  const { order, terms, brief, fields, files, history } = workspace
  const kind = asOwner ? "ownerOrders" : "orders", step = orderDetailStep(order, brief.status, asOwner)
  const action = step === "pay" ? { href: "#order-payment", label: "payAction" as const } : step === "completeBrief" ? { href: "#order-brief", label: "completeAction" as const } : step === "amend" ? { href: "#order-brief", label: "amendAction" as const } : step === "review" ? { href: "#owner-brief-review", label: "reviewAction" as const } : step === "start" ? { href: "#owner-start-work", label: "startAction" as const } : null
  const help = (step + "Help") as `${typeof step}Help`
  const briefArea = <BriefWorkspace locale={locale} order={order} terms={terms} fields={fields} brief={brief} files={files} asOwner={asOwner} />
  const collapsedBrief = !action && !(asOwner && brief.status === "submitted")
  return <PublicLocaleProvider locale={locale} paths={{ en: commercePaths[kind].en + "/" + order.id, id: commercePaths[kind].id + "/" + order.id }}>
    <div className="order-detail-theme">
      <a className="skip-link" href="#order-main">{t("current", locale)}</a>
      <div className="order-container">
        <header className="order-topbar"><BrandSignature /><span className="order-role">{t(asOwner ? "ownerArea" : "clientArea", locale)}</span><LanguageSwitcher /></header>
        <nav className="order-nav" aria-label={t("navigation", locale)}><a href={commercePaths[kind][locale]} aria-current="page">{commerceText(kind, locale)}</a><a href={commercePaths[asOwner ? "owner" : "offers"][locale]}>{commerceText(asOwner ? "owner" : "offers", locale)}</a><a href={authPaths.account[locale]}>{commerceText("account", locale)}</a></nav>
        <main id="order-main" tabIndex={-1}>
          <h1 className="order-title" lang={order.locale}>{terms.service_name}</h1>
          <p className="order-secondary">{t("sandbox", locale)}</p>
          <OrderRefresh locale={locale} />
          <div className="order-detail-grid">
            <section className="order-notice" aria-labelledby="order-notice-title">
              <h2 id="order-notice-title">{t(step, locale)}</h2><p>{t(help, locale)}</p>
              {brief.status === "changes_requested" && brief.review_note && <div className="order-active-note"><h3 className="font-semibold">{t("note", locale)}</h3><p className="whitespace-pre-wrap">{brief.review_note}</p></div>}
              {action && <a href={action.href} className="order-primary mt-4">{t(action.label, locale)}</a>}
            </section>
            <aside className="order-summary" aria-label={t("summary", locale)}><h2 className="font-semibold mb-4">{t("summary", locale)}</h2><dl><div><dt>{commerceText("price", locale)}</dt><dd className="order-total">IDR {new Intl.NumberFormat(locale).format(order.amount_idr)}</dd></div>{([["paymentStatus", order.payment_status], ["brief", brief.status], ["work", order.work_status]] as const).map(([label, value]) => <div key={label}><dt>{commerceText(label, locale)}</dt><dd>{statusLabel(value, locale)}</dd></div>)}{asOwner && <div><dt>{t("client", locale)}</dt><dd>{workspace.client?.display_name || workspace.client?.email || order.client_id}</dd></div>}</dl></aside>
            <div className="order-work">
              {order.payment_status !== "paid" && !asOwner ? <div id="order-payment" tabIndex={-1}>{payment}</div> : collapsedBrief ? <details><summary>{t("reviewAnswers", locale)}</summary>{briefArea}</details> : briefArea}
            </div>
            <section className="order-extra" aria-labelledby="order-extra-title"><h2 id="order-extra-title" className="order-heading mb-4">{t("additional", locale)}</h2>
              {order.payment_status !== "paid" && !asOwner && <details><summary>{t("reviewAnswers", locale)}</summary>{briefArea}</details>}
              {order.payment_status === "paid" && !asOwner && <details><summary>{t("payment", locale)}</summary><div id="order-payment">{payment}</div></details>}
              {email && <details><summary>{t("email", locale)}</summary>{email}</details>}
              <details><summary>{t("agreement", locale)}</summary><div className="space-y-6 py-4">{children}</div></details>
              <details><summary>{t("briefHistory", locale)}</summary><BriefHistory locale={locale} contractLocale={order.locale} clientId={order.client_id} fields={fields} history={history} /></details>
              <details><summary>{t("reference", locale)}</summary><p className="order-secondary break-all">{order.id}</p><p className="order-secondary mt-2">{commerceText("refund", locale)}: {statusLabel(order.refund_status, locale)}</p>{order.work_started_at && <p className="order-secondary mt-2">{new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(order.work_started_at))} WITA</p>}</details>
            </section>
          </div>
        </main>
      </div>
    </div>
  </PublicLocaleProvider>
}
