import type { BriefField, Locale, TransactionTerms } from "@/lib/commerce/rules"
import { statusLabel } from "@/data/commerce"
import { briefEventLabels, workspaceText as t } from "@/data/workspace"
import { BriefForm, ReviewBriefForm, StartWorkForm } from "./BriefForms"
import AttachmentPanel, { type BriefAttachment } from "./AttachmentPanel"
import type { WorkspaceOrder } from "./WorkspaceOverview"
import { editableBrief, type BriefStatus } from "@/lib/workspace/rules"

export type WorkspaceBrief = { status: BriefStatus; responses: Record<string, string>; revision: number; review_note: string | null; submitted_at?: string | null; approved_at?: string | null; approved_by?: string | null }
export type BriefHistory = { id: string; event: string; revision: number; note: string | null; responses: Record<string, string>; actor_id: string | null; created_at: string }
export default function BriefWorkspace({ locale, order, terms, fields, brief, files, history, asOwner = false }: { locale: Locale; order: WorkspaceOrder; terms: TransactionTerms; fields: BriefField[]; brief: WorkspaceBrief; files: BriefAttachment[]; history: BriefHistory[]; asOwner?: boolean }) {
  const contractLocale: Locale = order.locale === "id" ? "id" : "en"
  const editable = !asOwner && editableBrief(order.payment_status, order.work_status, order.work_started_at ?? null, brief.status)
  return <section id="order-brief" className="scroll-mt-8 border border-line rounded-2xl p-5 sm:p-8 space-y-6">
    <header className="space-y-2"><h2 className="font-display text-3xl">{t("brief", locale)}</h2><p>{statusLabel(brief.status, locale)} · {t("revision", locale)} {brief.revision}</p><p className="text-sm text-muted">{t("contractLanguage", locale)}: {contractLocale === "en" ? "English" : "Bahasa Indonesia"} · {t("outputLanguage", locale)}: {terms.output_language ? terms.output_language === "en" ? "English" : "Bahasa Indonesia" : t("outputUnknown", locale)}</p><p className="text-sm text-muted">{t("originalInputs", locale)}</p></header>
    <p className="text-muted">{t("noSecrets", locale)}</p>
    {brief.review_note && <div className="border-l-2 border-red pl-4 space-y-2"><h3 className="font-display text-xl">{t("ownerNote", locale)}</h3><p className="whitespace-pre-wrap break-words">{brief.review_note}</p></div>}
    {editable ? <BriefForm locale={locale} contractLocale={contractLocale} orderId={order.id} revision={brief.revision} fields={fields} responses={brief.responses} /> : <div className="space-y-5">
      {!asOwner && <p className="text-muted">{t(order.payment_status === "paid" ? "readOnly" : "unpaidBrief", locale)}</p>}
      <dl lang={contractLocale} className="space-y-5">{fields.map(field => <div key={field.id}><dt className="font-semibold">{field.label} <span lang={locale} className="font-normal text-muted">({t(field.required ? "required" : "optional", locale)})</span></dt><dd className="space-y-2 mt-2"><p className="text-sm text-muted">{field.instruction}</p><p className="whitespace-pre-wrap break-words">{brief.responses[field.id] || <span lang={locale}>{t("noAnswer", locale)}</span>}</p></dd></div>)}</dl>
    </div>}
    <AttachmentPanel locale={locale} orderId={order.id} revision={brief.revision} files={files} editable={editable} />
    {asOwner && brief.status === "submitted" && <section id="owner-brief-review" className="scroll-mt-8 border-t border-line pt-6 space-y-4"><h3 className="font-display text-2xl">{t("reviewTitle", locale)}</h3><p className="text-muted">{t("reviewHelp", locale)}</p><ReviewBriefForm key={brief.revision} locale={locale} orderId={order.id} revision={brief.revision} /></section>}
    {asOwner && order.payment_status === "paid" && order.payment_verified && brief.status === "approved" && ["draft", "awaiting_brief", "brief_review", "ready"].includes(order.work_status) && <section id="owner-start-work" className="scroll-mt-8 border-t border-line pt-6 space-y-4"><h3 className="font-display text-2xl">{t("start", locale)}</h3><StartWorkForm locale={locale} orderId={order.id} revision={brief.revision} /></section>}
    <section className="border-t border-line pt-6 space-y-4"><h3 className="font-display text-2xl">{t("history", locale)}</h3>{!history.length ? <p className="text-muted">{t("noHistory", locale)}</p> : <ol className="space-y-4">{history.map(entry => <li key={entry.id} className="border border-line rounded-lg p-4 space-y-2"><p>{briefEventLabels[entry.event]?.[locale === "en" ? 0 : 1] ?? statusLabel(entry.event, locale)} · {t("revision", locale)} {entry.revision}</p><p className="text-sm text-muted">{entry.actor_id === order.client_id ? t("clientActor", locale) : t("ownerActor", locale)} · {new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(entry.created_at))} WITA</p>{entry.note && <p className="whitespace-pre-wrap break-words">{entry.note}</p>}{Object.keys(entry.responses).length > 0 && <details><summary className="min-h-11 py-3 cursor-pointer">{t("responseHistory", locale)}</summary><dl lang={contractLocale} className="space-y-3">{fields.map(field => <div key={field.id}><dt className="font-semibold">{field.label}</dt><dd className="whitespace-pre-wrap break-words">{entry.responses[field.id] || "—"}</dd></div>)}</dl></details>}</li>)}</ol>}</section>
  </section>
}
