"use client"
import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { briefAction, reviewBriefAction, startWorkAction } from "@/lib/workspace/actions"
import type { WorkspaceState } from "@/lib/workspace/rules"
import { createBriefDraft, receiveBrief, acknowledgeBrief, confirmedBrief } from "@/lib/workspace/editor"
import type { BriefField, Locale } from "@/lib/commerce/rules"
import { workspaceText as t } from "@/data/workspace"
import { orderDetailText as d } from "@/data/order-detail"

function Feedback({ state, locale }: { state: WorkspaceState; locale: Locale }) {
  return state.message ? <p role={["invalid", "stale", "unavailable"].includes(state.message) ? "alert" : "status"} aria-live="polite" className="order-feedback">{d(state.message, locale)}</p> : null
}
function useRefreshAfterSuccess(state: WorkspaceState) {
  const router = useRouter()
  useEffect(() => { if (state.message && !["invalid", "stale", "unavailable"].includes(state.message)) router.refresh() }, [state.message, state.revision, router])
}
export function BriefForm({ locale, contractLocale, orderId, revision, fields, responses }: { locale: Locale; contractLocale: Locale; orderId: string; revision: number; fields: BriefField[]; responses: Record<string, string> }) {
  const [editor, setEditor] = useState(() => createBriefDraft(revision, responses))
  const [state, action, pending] = useActionState(async (previous: WorkspaceState, form: FormData) => {
    const result = await briefAction(locale, orderId, previous, form)
    const confirmedRevision = result.revision
    if (confirmedRevision !== undefined && ["saved", "submitted"].includes(String(result.message))) {
      const sent = Object.fromEntries(fields.map(field => [field.id, String(form.get("answer:" + field.id) ?? "")]))
      setEditor(current => confirmedBrief(current, confirmedRevision, sent))
    }
    return result
  }, {} as WorkspaceState)
  const current = receiveBrief(editor, revision, responses, pending)
  if (current !== editor) setEditor(current)
  const outdated = revision > current.revision
  useRefreshAfterSuccess(state)
  return <form id="brief-form" action={action} className="space-y-6" aria-busy={pending}>
    <input type="hidden" name="revision" value={current.revision} />
    {outdated && <div role="status" className="order-conflict space-y-3">
      <p>{d("newerBrief", locale)}</p>
      <details><summary>{d("compare", locale)}</summary><dl lang={contractLocale} className="space-y-3">{fields.map(field => <div key={field.id}><dt className="font-semibold">{field.label}</dt><dd className="whitespace-pre-wrap">{responses[field.id] || "—"}</dd></div>)}</dl></details>
      <div className="flex flex-wrap gap-3"><button type="button" disabled={pending} className="order-button" onClick={() => setEditor(value => acknowledgeBrief(value, revision, responses, true))}>{d("keepDraft", locale)}</button><button type="button" disabled={pending} className="order-button" onClick={() => setEditor(value => acknowledgeBrief(value, revision, responses, false))}>{d("loadSaved", locale)}</button></div>
    </div>}
    <fieldset disabled={pending || outdated} className="space-y-6">
      {fields.map(field => <label key={field.id} className="block space-y-2" lang={contractLocale}>
        <span className="font-semibold">{field.label} <span lang={locale} className="font-normal order-secondary">({t(field.required ? "required" : "optional", locale)})</span></span>
        <span id={"help-" + field.id} className="block order-secondary">{field.instruction}</span>
        <textarea name={"answer:" + field.id} value={current.answers[field.id] ?? ""} onChange={event => setEditor(value => ({ ...value, answers: { ...value.answers, [field.id]: event.target.value } }))} rows={4} maxLength={6000} aria-required={field.required} aria-describedby={"help-" + field.id} className="order-input resize-y" />
      </label>)}
      <div className="flex flex-wrap gap-3"><button name="operation" value="submit" className="order-primary">{pending ? t("saving", locale) : t("submit", locale)}</button><button name="operation" value="save" className="order-button">{pending ? t("saving", locale) : t("save", locale)}</button></div>
    </fieldset>
    <Feedback state={state} locale={locale} />
  </form>
}
export function ReviewBriefForm({ locale, orderId, revision }: { locale: Locale; orderId: string; revision: number }) {
  const [state, action, pending] = useActionState(reviewBriefAction.bind(null, locale, orderId), {} as WorkspaceState)
  const [review, setReview] = useState({ revision, decision: "", note: "" })
  if (!pending && revision > review.revision && !review.decision && !review.note) setReview({ ...review, revision })
  const outdated = revision > review.revision
  useRefreshAfterSuccess(state)
  return <form action={action} className="space-y-4" aria-busy={pending}>
    <input type="hidden" name="revision" value={review.revision} />
    {outdated && <div role="status" className="order-conflict space-y-3"><p>{d("newerReview", locale)}</p><button type="button" className="order-button" disabled={pending} onClick={() => setReview(value => ({ ...value, revision }))}>{d("useReview", locale)}</button></div>}
    <fieldset disabled={pending || outdated} className="space-y-4">
      <label className="block space-y-2"><span>{t("decision", locale)}</span><select name="decision" required className="order-input" value={review.decision} onChange={event => setReview(value => ({ ...value, decision: event.target.value }))}><option value="">{t("chooseDecision", locale)}</option><option value="approve">{t("approve", locale)}</option><option value="changes_requested">{t("requestChanges", locale)}</option></select></label>
      <label className="block space-y-2"><span>{t("note", locale)}</span><textarea name="note" value={review.note} onChange={event => setReview(value => ({ ...value, note: event.target.value }))} rows={4} maxLength={5000} required={review.decision === "changes_requested"} className="order-input resize-y" /></label>
      <button className="order-primary">{pending ? t("saving", locale) : t("saveReview", locale)}</button>
    </fieldset>
    <Feedback state={state} locale={locale} />
  </form>
}
export function StartWorkForm({ locale, orderId, revision }: { locale: Locale; orderId: string; revision: number }) {
  const [state, action, pending] = useActionState(startWorkAction.bind(null, locale, orderId), {} as WorkspaceState)
  useRefreshAfterSuccess(state)
  return <form action={action} className="space-y-4" aria-busy={pending}><input type="hidden" name="revision" value={revision} /><p className="order-secondary">{d("startGuard", locale)}</p><button disabled={pending} className="order-primary">{pending ? t("saving", locale) : t("start", locale)}</button><Feedback state={state} locale={locale} /></form>
}
