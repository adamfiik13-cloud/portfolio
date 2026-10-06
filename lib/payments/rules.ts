import { createHash, timingSafeEqual } from "node:crypto"

export const sandboxScript = "https://app.sandbox.midtrans.com/snap/snap.js"
export type Attempt = { id: string; order_id: string; provider_reference: string; merchant_id: string; amount_idr: number; currency: string; status: string; attempt_state: string; snap_token: string | null; transaction_id: string | null }
export type VerifiedStatus = { reference: string; merchant: string; amount: number; currency: "IDR"; transaction: string; status: string; fraud: string; refunded: number }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value)
// Opaque credentials: preserve the exact value; prefixes do not prove environment
// or provider authentication. Reject empty, whitespace and control/format chars.
const credential = (value: unknown): value is string => typeof value === "string" && value.length > 0 && !/[\s\p{Cc}\p{Cf}]/u.test(value)
export function reference(value: unknown): value is string { return typeof value === "string" && /^aw-sbx-[a-f0-9-]{36}$/.test(value) }
export function idr(value: unknown) {
  if (typeof value !== "string" || !/^\d{1,10}(?:\.00)?$/.test(value)) throw new Error("Invalid payment amount")
  const amount = Number(value)
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 1_000_000_000) throw new Error("Invalid payment amount")
  return amount
}
export function paymentConfig(env: Record<string, string | undefined>) {
  if (env.APP_ENV !== "staging" || env.VERCEL_ENV === "production" || env.MIDTRANS_ENVIRONMENT !== "sandbox" ||
      !env.MIDTRANS_MERCHANT_ID || !/^[a-zA-Z0-9_-]{1,80}$/.test(env.MIDTRANS_MERCHANT_ID) ||
      !credential(env.MIDTRANS_CLIENT_KEY) || !credential(env.MIDTRANS_SERVER_KEY)) throw new Error("Sandbox payments unavailable")
  return { merchant: env.MIDTRANS_MERCHANT_ID, clientKey: env.MIDTRANS_CLIENT_KEY, serverKey: env.MIDTRANS_SERVER_KEY }
}
export function notification(value: unknown, serverKey: string) {
  if (!record(value) || !reference(value.order_id) || typeof value.status_code !== "string" || !/^\d{3}$/.test(value.status_code) ||
      typeof value.transaction_status !== "string" || !/^[a-z_]{1,40}$/i.test(value.transaction_status) ||
      typeof value.signature_key !== "string" || !/^[a-f0-9]{128}$/.test(value.signature_key)) throw new Error("Invalid notification")
  idr(value.gross_amount)
  const expected = createHash("sha512").update(value.order_id + value.status_code + value.gross_amount + serverKey).digest()
  if (!timingSafeEqual(expected, Buffer.from(value.signature_key, "hex"))) throw new Error("Invalid notification")
  return { reference: value.order_id, merchant: value.merchant_id, currency: value.currency, amount: idr(value.gross_amount) }
}
export function statusMapping(status: string, fraud: string) {
  if (status === "settlement" && ["", "accept"].includes(fraud) || status === "capture" && fraud === "accept") return "verified"
  if (["refund", "partial_refund"].includes(status)) return "verified"
  if (status === "pending" || status === "capture" && ["", "challenge"].includes(fraud)) return "pending"
  if (["deny", "failure"].includes(status) || status === "capture" && fraud === "deny") return "failed"
  if (status === "expire") return "expired"
  if (status === "cancel") return "cancelled"
  throw new Error("Unrecognized payment status")
}
export function verifiedStatus(value: unknown, attempt: Attempt, merchant: string): VerifiedStatus {
  if (!record(value) || value.order_id !== attempt.provider_reference || value.merchant_id !== merchant || merchant !== attempt.merchant_id ||
      value.currency !== "IDR" || attempt.currency !== "IDR" || idr(value.gross_amount) !== Number(attempt.amount_idr) ||
      typeof value.transaction_id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(value.transaction_id) ||
      attempt.transaction_id && attempt.transaction_id !== value.transaction_id || typeof value.transaction_status !== "string") throw new Error("Payment binding mismatch")
  if (value.fraud_status !== undefined && (typeof value.fraud_status !== "string" || !["accept", "challenge", "deny"].includes(value.fraud_status))) throw new Error("Payment binding mismatch")
  const fraud = typeof value.fraud_status === "string" ? value.fraud_status : ""
  const status = value.transaction_status.toLowerCase()
  statusMapping(status, fraud)
  const refunded = status === "refund" ? Number(attempt.amount_idr) : status === "partial_refund" ? idr(value.refund_amount) : 0
  if (status === "refund" && value.refund_amount !== undefined && idr(value.refund_amount) !== Number(attempt.amount_idr)) throw new Error("Payment binding mismatch")
  if (status === "partial_refund" && (refunded <= 0 || refunded >= Number(attempt.amount_idr))) throw new Error("Payment binding mismatch")
  return { reference: attempt.provider_reference, merchant, amount: Number(attempt.amount_idr), currency: "IDR", transaction: value.transaction_id, status, fraud, refunded }
}
export function eventKey(status: VerifiedStatus) { return createHash("sha256").update(JSON.stringify(status)).digest("hex") }
