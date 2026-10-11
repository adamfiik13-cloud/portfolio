import "server-only"
import { createClient } from "@supabase/supabase-js"
import { after } from "next/server"
import { getSupabaseConfig } from "@/lib/supabase/config"
import { assertProjectIsolation } from "@/lib/backend/environment"
import { commerceContext } from "@/lib/commerce/server"
import { isUuid } from "@/lib/commerce/rules"
import { paymentConfirmation, type ConfirmationPayload } from "./payment-content"
import { sendConfirmation } from "./resend"

export type ConfirmationStatus = "pending" | "sending" | "sent" | "retryable" | "manual_review" | "unavailable" | "not_recorded"
function notificationClient() {
  const { url } = getSupabaseConfig()
  assertProjectIsolation(url, process.env)
  if (process.env.APP_ENV !== "staging" || process.env.VERCEL_ENV === "production" || new URL(url).hostname !== process.env.SUPABASE_STAGING_PROJECT_REF + ".supabase.co" || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Staging notification unavailable")
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}

// Trusted payment reconciliation invokes this only after authoritative verification.
// SQL independently checks Paid + matching verified record, and does not backfill
// old orders. Every error is isolated from payment success; no raw errors/logging.
export async function deliverPaymentConfirmation(orderId: string): Promise<void> {
  try {
    if (!isUuid(orderId)) return
    const client = notificationClient()
    const { data: job, error: jobError } = await client.from("payment_notifications").select("status").eq("order_id", orderId).eq("notification_type", "payment_confirmation").maybeSingle()
    if (jobError || !job || job.status === "sent" || job.status === "manual_review") return
    const key = process.env.RESEND_API_KEY
    if (!key || /[\s\p{Cc}\p{Cf}]/u.test(key)) {
      await client.rpc("payment_notification_unavailable", { p_order: orderId })
      return
    }
    const [{ data: order, error: orderError }, { data: snapshot, error: snapshotError }] = await Promise.all([
      client.from("orders").select("id,locale,amount_idr,currency,payment_status").eq("id", orderId).maybeSingle(),
      client.from("order_snapshots").select("selected_package,agreed_amount_idr,currency").eq("order_id", orderId).maybeSingle(),
    ])
    if (orderError || snapshotError || !order || !snapshot || order.payment_status !== "paid") return
    let payload: ConfirmationPayload
    try { payload = paymentConfirmation(order, snapshot) } catch {
      await client.rpc("payment_notification_invalid", { p_order: orderId })
      return
    }
    const { data: claimed, error: claimError } = await client.rpc("payment_notification_claim", { p_order: orderId, p_payload: payload })
    if (claimError || !claimed) return
    const result = await sendConfirmation(claimed.payload as ConfirmationPayload, claimed.idempotency_key, key)
    await client.rpc("payment_notification_finish", { p_order: orderId, p_lease: claimed.lease, p_provider_id: result.ok ? result.providerId : null, p_code: result.ok ? null : result.code })
  } catch { /* The durable outbox remains retryable; verified payment is untouched. */ }
}

// Let the authenticated route/action acknowledge verified payment promptly.
// Scheduling failure leaves the atomic outbox pending for an authorized retry.
export function schedulePaymentConfirmation(orderId: string): void {
  try { after(() => deliverPaymentConfirmation(orderId)) } catch { /* Durable outbox remains pending. */ }
}

// Read via session + RLS; expose only bounded operational labels, not email content.
export async function readConfirmationStatus(orderId: string): Promise<ConfirmationStatus> {
  try {
    if (!isUuid(orderId)) return "unavailable"
    const { client, user } = await commerceContext()
    if (!client || !user) return "unavailable"
    const { data, error } = await client.from("payment_notifications").select("status").eq("order_id", orderId).eq("notification_type", "payment_confirmation").maybeSingle()
    if (error) return "unavailable"
    return data ? data.status as ConfirmationStatus : "not_recorded"
  } catch { return "unavailable" }
}

export async function retryConfirmation(orderId: string): Promise<ConfirmationStatus> {
  if (!isUuid(orderId)) return "unavailable"
  const { client, user } = await commerceContext()
  if (!client || !user) return "unavailable"
  const [{ data: order, error }, { data: staff }] = await Promise.all([
    client.from("orders").select("id,client_id,payment_status").eq("id", orderId).maybeSingle(),
    client.from("staff_access").select("role,active").eq("user_id", user.id).maybeSingle(),
  ])
  if (error || !order || order.payment_status !== "paid" || order.client_id !== user.id && !(staff?.active && staff.role === "owner")) return "unavailable"
  await deliverPaymentConfirmation(orderId)
  return readConfirmationStatus(orderId)
}
