"use client"
import { useActionState } from "react"
import { requestCompatibilityAction, type CommerceState } from "@/lib/commerce/actions"
import type { Locale } from "@/lib/commerce/rules"
import { control } from "./CommerceForms"

export default function CompatibilityForm({ locale, outputLanguage }: { locale: Locale; outputLanguage: Locale }) {
  const [state, action, pending] = useActionState(requestCompatibilityAction.bind(null, locale), {} as CommerceState)
  return <form action={action} className="space-y-4" aria-busy={pending}>
    <input type="hidden" name="outputLanguage" value={outputLanguage} />
    <p>{locale === "en" ? "SEO Foundation requires the owner's technical compatibility review before ordering or payment. This request is not a brief approval or a purchase. Share access through an agreed secure channel; never enter passwords or API keys here." : "Fondasi SEO memerlukan pemeriksaan kompatibilitas teknis oleh owner sebelum pemesanan atau pembayaran. Permintaan ini bukan persetujuan brief atau pembelian. Bagikan akses melalui kanal aman yang disepakati; jangan masukkan password atau API key di sini."}</p>
    <fieldset disabled={pending} className="space-y-4">
      <label className="block space-y-2"><span>Website URL</span><input type="url" name="website" required maxLength={500} placeholder="https://example.com/" className={control} /><span className="text-sm text-muted">{locale === "en" ? "Public URL only, without credentials, query parameters or fragments." : "URL publik saja, tanpa kredensial, query parameter atau fragmen."}</span></label>
      <label className="block space-y-2"><span>{locale === "en" ? "Platform" : "Platform"}</span><select name="platform" className={control}><option value="wordpress">WordPress</option><option value="nextjs">Next.js</option></select></label>
      <button type="submit" className="min-h-11 px-5 py-3 rounded-lg bg-red text-white font-display disabled:opacity-60">{pending ? (locale === "en" ? "Saving…" : "Menyimpan…") : (locale === "en" ? "Request compatibility review" : "Minta pemeriksaan kompatibilitas")}</button>
    </fieldset>
    {state.message && <p role="alert">{locale === "en" ? "The request could not be saved. Contact Adam's Work; no order or payment was created." : "Permintaan belum dapat disimpan. Hubungi Adam's Work; tidak ada pesanan atau pembayaran yang dibuat."}</p>}
  </form>
}
