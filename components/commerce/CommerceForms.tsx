"use client"

import { useActionState } from "react"
import { acceptOrder, submitOffer, type CommerceState } from "@/lib/commerce/actions"
import { commerceText as t, commercePaths } from "@/data/commerce"
import { catalogServices } from "@/data/service-catalog"
import type { Locale } from "@/lib/commerce/rules"

export const control = "w-full min-h-11 rounded-xl border border-line bg-black px-3 py-3 text-base text-soft disabled:opacity-60"
const button = "inline-flex min-h-11 items-center justify-center rounded-xl bg-red px-6 py-3 font-display font-semibold text-white hover:bg-red-bright disabled:opacity-60 disabled:cursor-not-allowed"
export function AcceptanceForm({ locale, serviceId = "", offerId = "", fingerprint, requestKey }: { locale: Locale; serviceId?: string; offerId?: string; fingerprint: string; requestKey: string }) {
  const [state, action, pending] = useActionState(acceptOrder.bind(null, locale, serviceId, offerId), {} as CommerceState)
  return <form action={action} className="space-y-5" aria-busy={pending}>
    <input type="hidden" name="key" value={requestKey} /><input type="hidden" name="fingerprint" value={fingerprint} />
    <fieldset disabled={pending} className="space-y-5">
      <label className="flex min-h-11 items-start gap-3 py-3"><input type="checkbox" name="agreement" required className="mt-1 size-5 shrink-0 accent-red" /><span>{t("agreement", locale)}</span></label>
      <button type="submit" className={button}>{t(pending ? "pending" : "accept", locale)}</button>
    </fieldset>
    {state.message && <p role="alert" className="border border-line rounded-xl p-4">{t(state.message, locale)}</p>}
  </form>
}
export function OwnerOfferForm({ locale, requestKey, clients }: { locale: Locale; requestKey: string; clients: { id: string; display_name: string; email: string | null }[] }) {
  const [state, action, pending] = useActionState(submitOffer.bind(null, locale), {} as CommerceState)
  return <form action={action} className="space-y-6" aria-busy={pending}>
    <input type="hidden" name="key" value={requestKey} />
    <fieldset disabled={pending || Boolean(state.offerId)} className="space-y-6">
      <label className="block space-y-2"><span>{locale === "en" ? "Intended client" : "Klien yang dituju"}</span><select name="client" required className={control} defaultValue=""><option value="">{locale === "en" ? "Select client" : "Pilih klien"}</option>{clients.map(c => <option key={c.id} value={c.id}>{c.display_name || c.email || c.id}</option>)}</select></label>
      <label className="block space-y-2"><span>{locale === "en" ? "Service" : "Layanan"}</span><select name="service" required className={control}>{catalogServices.map(s => <option key={s.id} value={s.id}>{s.name[locale]}</option>)}</select></label>
      <label className="block space-y-2"><span>{t("price", locale)}</span><input name="amount" type="number" min="1" max="1000000000" step="1" required className={control} /></label>
      <label className="block space-y-2"><span>{t("expires", locale)} (UTC, ISO 8601)</span><input name="expires" placeholder="YYYY-MM-DDTHH:mm:ssZ" required pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z" className={control} /></label>
      <p className="text-muted">{locale === "en" ? "Both language variants must describe the same agreement. One item per line; milestone format: label | IDR value. Values must sum to the agreed total. Sent terms cannot be edited; a changed agreement needs a new offer and acceptance." : "Kedua bahasa harus menjelaskan kesepakatan yang sama. Satu item per baris; format milestone: nama | nilai IDR. Jumlah nilai harus sama dengan total disepakati. Ketentuan terkirim tidak dapat diedit; perubahan memerlukan penawaran dan persetujuan baru."}</p>
      {(["en", "id"] as const).map(lang => <fieldset key={lang} className="space-y-4 border border-line rounded-xl p-4 min-w-0"><legend className="px-2 font-display text-xl">{lang === "en" ? "English" : "Bahasa Indonesia"}</legend>
        <label className="block space-y-2"><span>{locale === "en" ? "Offer title" : "Judul penawaran"}</span><input name={lang + "-title"} required maxLength={160} className={control} /></label>
        {(["scope", "deliverables", "exclusions", "requirements", "duration", "revisions", "milestones", "fees"] as const).map(field => <label key={field} className="block space-y-2"><span>{t(field, locale)}</span><textarea name={lang + "-" + field} required maxLength={6000} rows={3} className={control} /></label>)}
      </fieldset>)}
      <label className="flex min-h-11 items-start gap-3 py-3"><input name="confirmed" type="checkbox" required className="mt-1 size-5 shrink-0 accent-red" /><span>{locale === "en" ? "I confirm these terms and amounts are approved, translations are equivalent, and costs are explicitly disclosed. No payment or work will start from creating this offer." : "Saya mengonfirmasi ketentuan dan nilai ini disetujui, terjemahan setara, dan biaya dijelaskan secara eksplisit. Pembuatan penawaran tidak memulai pembayaran atau pekerjaan."}</span></label>
      <button type="submit" className={button}>{t(pending ? "pending" : "owner", locale)}</button>
    </fieldset>
    {state.message && <p role={state.offerId ? "status" : "alert"}>{t(state.message, locale)}</p>}
    {state.offerId && <a className="inline-flex min-h-11 underline break-all" href={commercePaths.offers[locale] + "/" + state.offerId}>{commercePaths.offers[locale] + "/" + state.offerId}</a>}
  </form>
}
