"use client"
import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { briefAction, reviewBriefAction, startWorkAction } from "@/lib/workspace/actions"
import type { WorkspaceState } from "@/lib/workspace/rules"
import type { BriefField, Locale } from "@/lib/commerce/rules"
import { workspaceText as t } from "@/data/workspace"

const control = "w-full min-h-11 rounded-xl border border-line bg-black px-3 py-3 text-base text-soft disabled:opacity-60"
const button = "min-h-11 px-5 py-3 rounded-lg border border-line font-display font-semibold disabled:opacity-60"
function Feedback({ state, locale }: { state: WorkspaceState; locale: Locale }) {
  return state.message ? <p role={["invalid", "stale", "unavailable"].includes(state.message) ? "alert" : "status"} aria-live="polite" className="border border-line rounded-lg p-4">{t(state.message, locale)}</p> : null
}
function useRefreshAfterSuccess(state: WorkspaceState) {
  const router = useRouter()
  useEffect(() => { if (state.message && !["invalid", "stale", "unavailable"].includes(state.message)) router.refresh() }, [state.message, state.revision, router])
}
export function BriefForm({ locale, contractLocale, orderId, revision, fields, responses }: { locale: Locale; contractLocale: Locale; orderId: string; revision: number; fields: BriefField[]; responses: Record<string, string> }) {
  const [state, action, pending] = useActionState(async (previous: WorkspaceState, form: FormData) => {
    const result = await briefAction(locale, orderId, previous, form)
    return { ...result, revision: result.revision ?? previous.revision }
  }, { revision } as WorkspaceState)
  const [answers, setAnswers] = useState(() => ({ ...responses }))
  useRefreshAfterSuccess(state)
  return <form action={action} className="space-y-5" aria-busy={pending}>
    <input type="hidden" name="revision" value={state.revision} />
    <fieldset disabled={pending} className="space-y-5">
      {fields.map(field => <label key={field.id} className="block space-y-2" lang={contractLocale}>
        <span className="font-semibold">{field.label} <span lang={locale} className="font-normal text-muted">({t(field.required ? "required" : "optional", locale)})</span></span>
        <span id={"help-" + field.id} className="block text-sm text-muted">{field.instruction}</span>
        <textarea name={"answer:" + field.id} value={answers[field.id] ?? ""} onChange={event => setAnswers(previous => ({ ...previous, [field.id]: event.target.value }))} rows={4} maxLength={6000} aria-required={field.required} aria-describedby={"help-" + field.id} className={control + " resize-y"} />
      </label>)}
      <div className="flex flex-wrap gap-3">
        <button name="operation" value="save" className={button}>{pending ? t("saving", locale) : t("save", locale)}</button>
        <button name="operation" value="submit" className={button + " bg-red text-white"}>{pending ? t("saving", locale) : t("submit", locale)}</button>
      </div>
    </fieldset>
    <Feedback state={state} locale={locale} />
  </form>
}
export function ReviewBriefForm({ locale, orderId, revision }: { locale: Locale; orderId: string; revision: number }) {
  const [state, action, pending] = useActionState(reviewBriefAction.bind(null, locale, orderId), {} as WorkspaceState)
  const [decision, setDecision] = useState("")
  const [note, setNote] = useState("")
  useRefreshAfterSuccess(state)
  return <form action={action} className="space-y-4" aria-busy={pending}>
    <input type="hidden" name="revision" value={revision} />
    <fieldset disabled={pending} className="space-y-4">
      <label className="block space-y-2"><span>{t("decision", locale)}</span><select name="decision" required className={control} value={decision} onChange={event => setDecision(event.target.value)}><option value="">{t("chooseDecision", locale)}</option><option value="approve">{t("approve", locale)}</option><option value="changes_requested">{t("requestChanges", locale)}</option></select></label>
      <label className="block space-y-2"><span>{t("note", locale)}</span><textarea name="note" value={note} onChange={event => setNote(event.target.value)} rows={4} maxLength={5000} required={decision === "changes_requested"} className={control + " resize-y"} /></label>
      <button className={button + " bg-red text-white"}>{pending ? t("saving", locale) : t("saveReview", locale)}</button>
    </fieldset>
    <Feedback state={state} locale={locale} />
  </form>
}
export function StartWorkForm({ locale, orderId, revision }: { locale: Locale; orderId: string; revision: number }) {
  const [state, action, pending] = useActionState(startWorkAction.bind(null, locale, orderId), {} as WorkspaceState)
  useRefreshAfterSuccess(state)
  return <form action={action} className="space-y-4" aria-busy={pending}><input type="hidden" name="revision" value={revision} /><p className="text-muted">{t("startGuard", locale)}</p><button disabled={pending} className={button + " bg-red text-white"}>{pending ? t("saving", locale) : t("start", locale)}</button><Feedback state={state} locale={locale} /></form>
}
