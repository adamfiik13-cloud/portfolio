"use client"
import { useState } from "react"
import { retryConfirmationAction } from "@/lib/notifications/actions"
import type { ConfirmationStatus } from "@/lib/notifications/server"
import type { Locale } from "@/lib/commerce/rules"
const messages: Record<ConfirmationStatus, [string, string]> = {
  pending: ["Payment confirmation email is queued.", "Email konfirmasi pembayaran sedang antre."],
  sending: ["Payment confirmation email is being processed.", "Email konfirmasi pembayaran sedang diproses."],
  sent: ["The email provider accepted your payment confirmation. Inbox delivery still depends on your email provider.", "Penyedia email menerima konfirmasi pembayaran Anda. Pengiriman ke inbox tetap bergantung pada penyedia email Anda."],
  retryable: ["Payment is verified, but the confirmation email could not be sent. You can retry safely.", "Pembayaran terverifikasi, tetapi email konfirmasi belum terkirim. Anda dapat mencoba kembali dengan aman."],
  manual_review: ["Payment is verified. Email confirmation requires operator review; contact Adam's Work.", "Pembayaran terverifikasi. Email konfirmasi memerlukan pemeriksaan operator; hubungi Adam's Work."],
  unavailable: ["Email confirmation status is temporarily unavailable. Your verified payment is unchanged.", "Status email konfirmasi sementara tidak tersedia. Pembayaran terverifikasi Anda tidak berubah."],
  not_recorded: ["No confirmation notification is recorded for this order. Previously paid orders are not automatically resent.", "Tidak ada notifikasi konfirmasi tercatat untuk pesanan ini. Pesanan yang sudah dibayar sebelumnya tidak dikirim ulang secara otomatis."],
}
export default function ConfirmationPanel({ orderId, locale, initialStatus }: { orderId: string; locale: Locale; initialStatus: ConfirmationStatus }) {
  const [result, setResult] = useState<ConfirmationStatus | null>(null), [busy, setBusy] = useState(false)
  const status = initialStatus === "sent" || initialStatus === "manual_review" ? initialStatus : result ?? initialStatus
  async function retry() {
    if (busy) return
    setBusy(true)
    try { setResult(await retryConfirmationAction(orderId)) } catch { setResult("unavailable") }
    finally { setBusy(false) }
  }
  return <section className="border border-line rounded-xl p-5 space-y-3">
    <h2 className="font-display text-xl">{locale === "en" ? "Payment confirmation email" : "Email konfirmasi pembayaran"}</h2>
    <p role="status" aria-live="polite">{messages[status][locale === "en" ? 0 : 1]}</p>
    {["pending", "retryable", "sending"].includes(status) && <button disabled={busy} onClick={() => void retry()} className="min-h-11 px-5 py-3 border border-line rounded-lg disabled:opacity-60">{busy ? (locale === "en" ? "Processing…" : "Memproses…") : (locale === "en" ? "Retry confirmation email" : "Coba kirim konfirmasi email")}</button>}
  </section>
}
