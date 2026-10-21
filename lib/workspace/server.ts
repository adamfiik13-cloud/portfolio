import "server-only"
import { createClient } from "@supabase/supabase-js"
import { commerceContext, ownerContext } from "@/lib/commerce/server"
import { getSupabaseConfig } from "@/lib/supabase/config"
import { isUuid, validTerms } from "@/lib/commerce/rules"
import { briefFields, editableBrief, validResponses, type BriefStatus } from "./rules"

export type WorkspaceOrder = { id: string; client_id: string; service_id: string; locale: "en" | "id"; amount_idr: number; currency: string; payment_status: string; work_status: string; refund_status: string; work_started_at: string | null }
export type WorkspaceBrief = { status: BriefStatus; responses: Record<string, string>; revision: number; review_note: string | null; submitted_at: string | null; approved_at: string | null; approved_by: string | null }
export type BriefRevision = { id: string; event: string; revision: number; note: string | null; responses: Record<string, string>; actor_id: string; created_at: string }
export type BriefFile = { id: string; original_filename: string; size_bytes: number; mime_type: string; status: string }

export async function workspaceContext(orderId: string, asOwner = false) {
  if (!isUuid(orderId)) return null
  const context = asOwner ? await ownerContext() : await commerceContext()
  if (!context?.client || !context.user) return null
  let query = context.client.from("orders").select("id,client_id,service_id,locale,amount_idr,currency,payment_status,work_status,refund_status,work_started_at").eq("id", orderId)
  if (!asOwner) query = query.eq("client_id", context.user.id)
  const { data, error } = await query.maybeSingle()
  if (error) throw new Error("Workspace unavailable")
  return data ? { client: context.client, user: context.user, order: data as WorkspaceOrder } : null
}
export async function readWorkspace(orderId: string, asOwner = false) {
  const context = await workspaceContext(orderId, asOwner)
  if (!context) return null
  const { client, order } = context
  const [snapshot, brief, history, files, payment] = await Promise.all([
    client.from("order_snapshots").select("selected_package").eq("order_id", orderId).maybeSingle(),
    client.from("briefs").select("status,responses,revision,review_note,submitted_at,approved_at,approved_by").eq("order_id", orderId).maybeSingle(),
    client.from("brief_revisions").select("id,event,revision,note,responses,actor_id,created_at").eq("order_id", orderId).order("revision", { ascending: false }).limit(100),
    client.from("order_files").select("id,original_filename,size_bytes,mime_type,status").eq("order_id", orderId).eq("bucket_id", "client-briefs").eq("visibility", "client").in("status", ["ready", "pending", "quarantined"]).order("status", { ascending: true }).order("created_at", { ascending: false }).limit(100),
    client.from("payment_records").select("id").eq("order_id", orderId).eq("status", "verified").eq("amount_idr", order.amount_idr).eq("currency", order.currency).limit(1),
  ])
  if ([snapshot, brief, history, files, payment].some(result => result.error) || !brief.data || !validTerms(snapshot.data?.selected_package?.terms)) throw new Error("Workspace unavailable")
  const terms = snapshot.data.selected_package.terms
  return { order: { ...order, payment_verified: !!payment.data?.length }, terms, fields: briefFields(terms), brief: brief.data as WorkspaceBrief, history: (history.data ?? []) as BriefRevision[], files: (files.data ?? []) as BriefFile[], client: snapshot.data.selected_package.client as { display_name: string | null; email: string } | undefined }
}
function mutationClient() {
  const { url } = getSupabaseConfig()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("Workspace unavailable")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
function rpcError(error: { message?: string } | null) {
  if (error) throw new Error(error.message === "Stale brief" ? "Stale brief" : "Workspace unavailable")
}
export async function saveBrief(orderId: string, revision: number, responses: Record<string, string>, submit: boolean) {
  const workspace = await readWorkspace(orderId)
  if (!workspace || !Number.isSafeInteger(revision) || revision < 0) throw new Error("Invalid brief")
  if (revision !== workspace.brief.revision) throw new Error("Stale brief")
  if (typeof submit !== "boolean" || !validResponses(workspace.fields, responses, submit) || !editableBrief(workspace.order.payment_status, workspace.order.work_status, workspace.order.work_started_at, workspace.brief.status)) throw new Error("Invalid brief")
  const context = await workspaceContext(orderId)
  if (!context) throw new Error("Unauthorized")
  const { data, error } = await mutationClient().rpc("workspace_save_brief", { p_actor: context.user.id, p_order: orderId, p_revision: revision, p_responses: responses, p_submit: submit })
  rpcError(error)
  if (!data || !Number.isSafeInteger(data.revision)) throw new Error("Workspace unavailable")
  return data as { revision: number; status: BriefStatus }
}
export async function reviewBrief(orderId: string, revision: number, decision: "approve" | "changes_requested", note: string) {
  const context = await workspaceContext(orderId, true)
  if (!context) throw new Error("Unauthorized")
  if (!Number.isSafeInteger(revision) || revision < 0 || !["approve", "changes_requested"].includes(decision) || typeof note !== "string" || note.length > 5000 || decision === "changes_requested" && !note.trim()) throw new Error("Invalid review")
  const { data, error } = await mutationClient().rpc("workspace_review_brief", { p_actor: context.user.id, p_order: orderId, p_revision: revision, p_decision: decision, p_note: note })
  rpcError(error)
  if (!data || !Number.isSafeInteger(data.revision)) throw new Error("Workspace unavailable")
  return data as { revision: number; status: BriefStatus }
}
export async function startWork(orderId: string, revision: number) {
  const context = await workspaceContext(orderId, true)
  if (!context || !Number.isSafeInteger(revision) || revision < 0) throw new Error("Unauthorized")
  const { data, error } = await mutationClient().rpc("workspace_start_work", { p_actor: context.user.id, p_order: orderId, p_revision: revision })
  rpcError(error)
  if (typeof data !== "string" || !Number.isFinite(Date.parse(data))) throw new Error("Workspace unavailable")
  return data
}
