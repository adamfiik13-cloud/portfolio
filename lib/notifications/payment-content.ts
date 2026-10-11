import { isUuid, validTerms, type Locale } from "@/lib/commerce/rules"
import { validEmail } from "@/lib/auth/rules"

export const PAYMENT_EMAIL_FROM = "Adam's Work <no-reply@adamswork.app>"
export const PAYMENT_EMAIL_REPLY_TO = "adamfiik13@gmail.com"
export type ConfirmationPayload = { from: string; to: string[]; reply_to: string; subject: string; text: string }
type PaymentSnapshot = { selected_package: { terms?: unknown; client?: { email?: unknown } }; agreed_amount_idr: number; currency: string }

// Render only the immutable accepted snapshot, never the current editable catalogue.
// The first provider request payload is then frozen in the durable outbox for retries.
export function paymentConfirmation(order: { id: string; locale: string; amount_idr: number; currency: string }, snapshot: PaymentSnapshot): ConfirmationPayload {
  const terms = snapshot.selected_package?.terms
  const email = snapshot.selected_package?.client?.email
  if (!isUuid(order.id) || !["en", "id"].includes(order.locale) || !validTerms(terms) || terms.amount_idr !== Number(order.amount_idr) || Number(snapshot.agreed_amount_idr) !== Number(order.amount_idr) || order.currency !== "IDR" || snapshot.currency !== "IDR" || typeof email !== "string" || !validEmail(email) || /[\r\n\x00-\x1f\x7f]/.test(email)) throw new Error("Invalid confirmation snapshot")
  const locale = order.locale as Locale
  const extended = terms as typeof terms & { output_language?: Locale; brief_fields?: { id: string; label: string; instruction: string; required: boolean }[]; scheduling_note?: string }
  const outputLanguage = extended.output_language ?? locale
  if (!["en", "id"].includes(outputLanguage)) throw new Error("Invalid confirmation snapshot")
  const checklist = Array.isArray(extended.brief_fields) && extended.brief_fields.length > 0
    ? extended.brief_fields.map(field => {
      if (!field || typeof field.label !== "string" || typeof field.instruction !== "string" || typeof field.required !== "boolean") throw new Error("Invalid confirmation snapshot")
      return `- ${field.label}${field.required ? "" : locale === "en" ? " (if available)" : " (jika tersedia)"}: ${field.instruction}`
    })
    : terms.requirements.map(requirement => "- " + requirement)
  const id = order.id, amount = new Intl.NumberFormat(locale === "en" ? "en-GB" : "id-ID").format(Number(order.amount_idr))
  const link = "https://staging.adamswork.app" + (locale === "id" ? "/id/pesanan/" : "/orders/") + id
  const language = outputLanguage === "en" ? "English" : "Bahasa Indonesia"
  const text = locale === "en"
    ? [`Your Sandbox payment has been verified.`, `Order reference: ${id}`, `Verified amount: IDR ${amount}`, `Package: ${terms.service_name}`, `Output language: ${language}`, "", "Next steps and brief checklist:", ...checklist, "", ...(extended.scheduling_note ? [extended.scheduling_note, ""] : []), "Reply to this email to coordinate the next steps. Do not send passwords or API keys by email. A complete brief submission interface is not yet available.", "Work begins only after verified payment AND admin approval of a complete brief. Payment alone does not start work.", "", "Sign in to review your original agreement and accepted terms:", link]
    : ["Pembayaran Sandbox Anda telah terverifikasi.", `Referensi pesanan: ${id}`, `Jumlah terverifikasi: IDR ${amount}`, `Paket: ${terms.service_name}`, `Bahasa hasil pekerjaan: ${language}`, "", "Langkah berikutnya dan daftar kebutuhan brief:", ...checklist, "", ...(extended.scheduling_note ? [extended.scheduling_note, ""] : []), "Balas email ini untuk mengoordinasikan langkah berikutnya. Jangan mengirim kata sandi atau API key melalui email. Antarmuka pengiriman brief lengkap belum tersedia.", "Pekerjaan dimulai hanya setelah pembayaran terverifikasi DAN brief lengkap disetujui admin. Pembayaran saja tidak memulai pekerjaan.", "", "Login untuk melihat kesepakatan asli dan ketentuan yang Anda setujui:", link]
  return { from: PAYMENT_EMAIL_FROM, to: [email], reply_to: PAYMENT_EMAIL_REPLY_TO, subject: locale === "en" ? "Adam's Work — Sandbox payment confirmed" : "Adam's Work — Pembayaran Sandbox terkonfirmasi", text: text.join("\n") }
}
