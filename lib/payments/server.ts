import "server-only"
import { createClient } from "@supabase/supabase-js"
import { commerceContext } from "@/lib/commerce/server"
import { isUuid } from "@/lib/commerce/rules"
import { getSupabaseConfig } from "@/lib/supabase/config"
import { assertProjectIsolation } from "@/lib/backend/environment"
import { paymentConfig, eventKey, notification, type Attempt, type VerifiedStatus } from "./rules"
import { provider } from "./provider"
import { initiate, reconcile } from "./workflow"
import { schedulePaymentConfirmation } from "@/lib/notifications/server"

export function sandboxConfig() {
  const config = paymentConfig(process.env)
  const { url } = getSupabaseConfig()
  assertProjectIsolation(url, process.env)
  if (new URL(url).hostname !== process.env.SUPABASE_STAGING_PROJECT_REF + ".supabase.co" || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Sandbox unavailable")
  return config
}
export function paymentReady() { try { sandboxConfig(); return true } catch { return false } }
function gateway() {
  const config = sandboxConfig(), { url } = getSupabaseConfig()
  // Module-private privileged mutations/provider reads only. UI reads use RLS.
  const client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const api = provider(config.serverKey)
  async function rpc(name: string, args: Record<string, unknown>) {
    const { data, error } = await client.rpc(name, args)
    if (error) throw new Error("Sandbox payments unavailable")
    return data
  }
  const apply = (s: VerifiedStatus) => rpc("payments_apply", { p_reference: s.reference, p_merchant: s.merchant, p_amount: s.amount, p_currency: s.currency, p_transaction: s.transaction, p_status: s.status, p_fraud: s.fraud, p_refunded: s.refunded, p_event: eventKey(s) }) as Promise<string>
  return { config, client, rpc, apply, ...api }
}
async function ownedOrder(id: string) {
  if (!isUuid(id)) throw new Error("Unauthorized payment")
  const { client, user } = await commerceContext()
  if (!client || !user) throw new Error("Unauthorized payment")
  const { data, error } = await client.from("orders").select("id,client_id,payment_status,work_status").eq("id", id).eq("client_id", user.id).maybeSingle()
  if (error || !data) throw new Error("Unauthorized payment")
  return { client, user, order: data }
}
export async function beginPayment(id: string) {
  const { user, order } = await ownedOrder(id)
  if (["cancelled", "completed"].includes(order.work_status)) throw new Error("Ineligible payment")
  const g = gateway()
  if (order.payment_status === "paid") {
    schedulePaymentConfirmation(id)
    return { message: "verified" as const }
  }
  const result = await initiate({ merchant: g.config.merchant, reserve: replace => g.rpc("payments_reserve", { p_client: user.id, p_order: id, p_merchant: g.config.merchant, p_replace: replace ?? null }), saveToken: (attemptId, token) => g.rpc("payments_token", { p_id: attemptId, p_token: token }), create: g.create, status: g.status, apply: g.apply })
  if ("message" in result && result.message === "verified") schedulePaymentConfirmation(id)
  return "token" in result ? { token: result.token, clientKey: g.config.clientKey } : result
}
export async function checkPayment(id: string) {
  const { client, order } = await ownedOrder(id), g = gateway()
  const { data, error } = await client.from("payment_records").select("id,order_id,provider_reference,merchant_id,amount_idr,currency,status,attempt_state,transaction_id").eq("order_id", id).eq("provider", "midtrans-sandbox").order("attempt_number", { ascending: false }).limit(1).maybeSingle()
  if (error) throw new Error("Sandbox payments unavailable")
  if (!data) {
    if (order.payment_status === "paid") schedulePaymentConfirmation(id)
    return { message: order.payment_status === "paid" ? "verified" as const : "unselected" as const }
  }
  const state = await reconcile({ ...data, snap_token: null } as Attempt, { merchant: g.config.merchant, status: g.status, apply: g.apply })
  if (state?.state === "verified" || order.payment_status === "paid") schedulePaymentConfirmation(id)
  return { message: state?.state === "verified" ? "verified" as const : state === null ? "unselected" as const : "checked" as const }
}
export async function receiveNotification(body: unknown) {
  const g = gateway(), signed = notification(body, g.config.serverKey)
  if (signed.merchant !== undefined && signed.merchant !== g.config.merchant || signed.currency !== undefined && signed.currency !== "IDR") throw new Error("Invalid notification")
  const { data, error } = await g.client.from("payment_records").select("id,order_id,provider_reference,merchant_id,amount_idr,currency,status,attempt_state,transaction_id").eq("provider", "midtrans-sandbox").eq("provider_reference", signed.reference).maybeSingle()
  if (error || !data || Number(data.amount_idr) !== signed.amount) throw new Error("Invalid notification")
  // BI SNAP/DANA status lookup requires a transaction ID. The response must still
  // bind to our reference, merchant, currency/amount and any already-known ID.
  const reportedId = body && typeof body === "object" && "transaction_id" in body ? body.transaction_id : null
  if (reportedId !== null && (typeof reportedId !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(reportedId))) throw new Error("Invalid notification")
  const state = await reconcile({ ...data, transaction_id: data.transaction_id ?? reportedId, snap_token: null } as Attempt, { merchant: g.config.merchant, status: g.status, apply: g.apply })
  if (state === null) throw new Error("Payment status unavailable")
  if (state.state === "verified") schedulePaymentConfirmation(data.order_id)
}
