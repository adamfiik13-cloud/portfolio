import type { Locale } from "@/lib/commerce/rules"
import { statusLabel, commerceText } from "@/data/commerce"
import { workspaceNextStep, workspaceText as t } from "@/data/workspace"

export type WorkspaceOrder = { id: string; client_id: string; locale: string; amount_idr: number; work_status: string; payment_status: string; refund_status: string; work_started_at?: string | null; payment_verified?: boolean }
export function OrderStatuses({ locale, payment, brief, work }: { locale: Locale; payment: string; brief: string; work: string }) {
  return <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">{([["paymentStatus", payment], ["brief", brief], ["work", work]] as const).map(([key, value]) => <div key={key}><dt className="text-sm text-muted">{commerceText(key, locale)}</dt><dd className="font-semibold">{statusLabel(value, locale)}</dd></div>)}</dl>
}
export default function WorkspaceOverview({ locale, order, briefStatus, serviceName, asOwner = false, clientName, showServiceTitle = true }: { locale: Locale; order: WorkspaceOrder; briefStatus: string; serviceName: string; asOwner?: boolean; clientName?: string; showServiceTitle?: boolean }) {
  const step = workspaceNextStep(order.payment_status, briefStatus, order.work_status, asOwner, Boolean(order.payment_verified))
  const href = step === "pay" ? "#order-payment" : ["completeBrief", "amend"].includes(step) ? "#order-brief" : step === "review" ? "#owner-brief-review" : step === "start" ? "#owner-start-work" : null
  const help = step === "pay" || step === "ownerPay" ? "payHelp" : ["completeBrief", "waitBrief"].includes(step) ? "briefHelp" : ["review", "waitReview"].includes(step) ? (asOwner ? "reviewHelp" : "waitReviewHelp") : ["amend", "waitAmend"].includes(step) ? "amendHelp" : ["start", "waitStart"].includes(step) ? "waitStartHelp" : "progressHelp"
  return <section className="space-y-6">
    <header className="space-y-3">{showServiceTitle && <h2 lang={order.locale} className="font-display text-3xl sm:text-4xl leading-tight">{serviceName}</h2>}{clientName && <p>{t("client", locale)}: {clientName}</p>}<p className="text-sm text-muted break-all">{t("reference", locale)}: {order.id}</p><p>{t("amount", locale)}: IDR {new Intl.NumberFormat(locale).format(order.amount_idr)}</p></header>
    <OrderStatuses locale={locale} payment={order.payment_status} brief={briefStatus} work={order.work_status} />
    <div className="border border-red rounded-xl p-5 space-y-3"><p className="text-sm text-muted">{t("next", locale)}</p><h3 className="font-display text-2xl">{t(step, locale)}</h3>{!["cancelled", "completed"].includes(step) && <p className="text-muted">{t(help, locale)}</p>}{href && <a href={href} className="inline-flex min-h-11 items-center justify-center px-5 py-3 rounded-lg bg-red text-white font-display font-semibold">{t(step, locale)}</a>}</div>
    {order.work_started_at && <p className="text-sm text-muted">{t("startedAt", locale)}: {new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(order.work_started_at))} WITA</p>}
  </section>
}
