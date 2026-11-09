import type { BriefField, Locale, TransactionTerms } from "@/lib/commerce/rules"
import { statusLabel } from "@/data/commerce"
import { briefEventLabels, workspaceText as t } from "@/data/workspace"
import { orderDetailText as d } from "@/data/order-detail"
import { BriefForm, ReviewBriefForm, StartWorkForm } from "./BriefForms"
import AttachmentPanel, { type BriefAttachment } from "./AttachmentPanel"
import type { WorkspaceOrder } from "./WorkspaceOverview"
import { editableBrief, type BriefStatus } from "@/lib/workspace/rules"

export type WorkspaceBrief = { status: BriefStatus; responses: Record<string, string>; revision: number; review_note: string | null; submitted_at?: string | null; approved_at?: string | null; approved_by?: string | null }
export type BriefHistory = { id: string; event: string; revision: number; note: string | null; responses: Record<string, string>; actor_id: string | null; created_at: string }
export default function BriefWorkspace({ locale, order, terms, fields, brief, files, asOwner = false }: { locale: Locale; order: WorkspaceOrder; terms: TransactionTerms; fields: BriefField[]; brief: WorkspaceBrief; files: BriefAttachment[]; history?: BriefHistory[]; asOwner?: boolean }) {
  const contractLocale: Locale = order.locale === "id" ? "id" : "en"
  const editable = !asOwner && editableBrief(order.payment_status, order.work_status, order.work_started_at ?? null, brief.status)
  return <section id="order-brief" tabIndex={-1} className="space-y-6">
    <header className="space-y-2"><h2 className="order-heading">{t("brief", locale)}</h2><p className="order-secondary">{statusLabel(brief.status, locale)} · {t("revision", locale)} {brief.revision}</p><p className="order-secondary">{t("contractLanguage", locale)}: {contractLocale === "en" ? "English" : "Bahasa Indonesia"} · {t("outputLanguage", locale)}: {terms.output_language ? terms.output_language === "en" ? "English" : "Bahasa Indonesia" : t("outputUnknown", locale)}</p><p className="order-secondary">{d("originalInputs", locale)}</p></header>
    {editable ? <><p className="order-secondary">{t("noSecrets", locale)}</p><BriefForm locale={locale} contractLocale={contractLocale} orderId={order.id} revision={brief.revision} fields={fields} responses={brief.responses} /></> : <div className="space-y-5">
      <dl lang={contractLocale} className="space-y-5">{fields.map(field => <div key={field.id}><dt className="font-semibold">{field.label} <span lang={locale} className="font-normal order-secondary">({t(field.required ? "required" : "optional", locale)})</span></dt><dd className="space-y-2 mt-2"><p className="order-secondary">{field.instruction}</p><p className="whitespace-pre-wrap break-words">{brief.responses[field.id] || <span lang={locale}>{t("noAnswer", locale)}</span>}</p></dd></div>)}</dl>
    </div>}
    <div className="border-t border-line pt-6"><AttachmentPanel locale={locale} orderId={order.id} revision={brief.revision} files={files} editable={editable} /></div>
    {asOwner && brief.status === "submitted" && <section id="owner-brief-review" tabIndex={-1} className="border-t border-line pt-6 space-y-4"><h3 className="order-heading">{t("reviewTitle", locale)}</h3><ReviewBriefForm locale={locale} orderId={order.id} revision={brief.revision} /></section>}
    {asOwner && !order.work_started_at && order.payment_status === "paid" && order.payment_verified && brief.status === "approved" && ["draft", "awaiting_brief", "brief_review", "ready"].includes(order.work_status) && <section id="owner-start-work" tabIndex={-1} className="border-t border-line pt-6 space-y-4"><StartWorkForm locale={locale} orderId={order.id} revision={brief.revision} /></section>}
  </section>
}
export function BriefHistory({ locale, contractLocale, clientId, fields, history }: { locale: Locale; contractLocale: Locale; clientId: string; fields: BriefField[]; history: BriefHistory[] }) {
  return !history.length ? <p className="order-secondary">{t("noHistory", locale)}</p> : <ol className="space-y-6">{history.map(entry => <li key={entry.id} className="space-y-2 border-b border-line pb-6"><p className="font-semibold">{briefEventLabels[entry.event]?.[locale === "en" ? 0 : 1] ?? statusLabel(entry.event, locale)} · {t("revision", locale)} {entry.revision}</p><p className="order-secondary">{entry.actor_id === clientId ? t("clientActor", locale) : t("ownerActor", locale)} · {new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(entry.created_at))} WITA</p>{entry.note && <p className="whitespace-pre-wrap">{entry.note}</p>}<details><summary>{t("responseHistory", locale)}</summary><dl lang={contractLocale} className="space-y-3">{fields.map(field => <div key={field.id}><dt className="font-semibold">{field.label}</dt><dd className="whitespace-pre-wrap">{entry.responses[field.id] || "—"}</dd></div>)}</dl></details></li>)}</ol>
}
