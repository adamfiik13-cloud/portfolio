import "server-only"
import { createHash, randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseConfig } from "@/lib/supabase/config"
import { assertProjectIsolation } from "@/lib/backend/environment"
import { isUuid } from "@/lib/commerce/rules"
import { workspaceContext } from "./server"
import { MAX_BRIEF_FILE_BYTES, validBriefFile, validFileRevision, validateBriefBytes } from "./file-rules"

const BUCKET = "client-briefs"
async function boundedDownload(response: Response) {
  const declared = response.headers.get("content-length")
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BRIEF_FILE_BYTES)) throw new Error("Invalid brief file")
  if (!response.body) throw new Error("Invalid brief file")
  const reader = response.body.getReader(), chunks: Uint8Array[] = []
  let count = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      count += value.byteLength
      if (count > MAX_BRIEF_FILE_BYTES) throw new Error("Invalid brief file")
      chunks.push(value)
    }
  } finally { await reader.cancel().catch(() => {}) }
  return new Response(Buffer.concat(chunks), { status: response.status, headers: response.headers })
}
function fileClient() {
  const { url } = getSupabaseConfig()
  assertProjectIsolation(url, process.env)
  const local = process.env.APP_ENV === "local" && !process.env.VERCEL && ["localhost", "127.0.0.1"].includes(new URL(url).hostname)
  if ((!local && (process.env.APP_ENV !== "staging" || process.env.VERCEL_ENV === "production" || new URL(url).hostname !== process.env.SUPABASE_STAGING_PROJECT_REF + ".supabase.co")) || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Workspace files unavailable")
  // Module-private, only after a verified session/order check. Bound Storage
  // downloads before the SDK creates its Blob; never log provider responses.
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (input, options) => {
      const response = await fetch(input, { ...options, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) })
      const address = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url)
      return response.ok && /^\/storage\/v1\/object\/(?:authenticated\/)?client-briefs\//.test(address.pathname) ? boundedDownload(response) : response
    } },
  })
}
async function fileRpc(client: ReturnType<typeof fileClient>, name: string, args: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, args)
  if (error) throw new Error("Workspace files unavailable")
  return data
}
function validSignedUrl(value: unknown) {
  if (typeof value !== "string") return false
  try {
    const { url } = getSupabaseConfig(), target = new URL(value), base = new URL(url)
    return target.origin === base.origin && target.pathname.startsWith("/storage/v1/object/") && !target.username && !target.password
  } catch { return false }
}
export async function prepareBriefFile(input: { orderId: string; revision: number; filename: string; size: number; mime: string }) {
  if (!isUuid(input.orderId) || !validFileRevision(input.revision) || !validBriefFile(input)) throw new Error("Invalid brief file")
  const context = await workspaceContext(input.orderId)
  if (!context) throw new Error("Unauthorized file")
  const client = fileClient(), fileId = randomUUID()
  const path = await fileRpc(client, "workspace_prepare_file", { p_actor: context.user.id, p_order: input.orderId, p_revision: input.revision, p_id: fileId, p_name: input.filename, p_size: input.size, p_mime: input.mime })
  if (path !== input.orderId + "/" + fileId) throw new Error("Workspace files unavailable")
  const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false })
  if (error || !data || data.path !== path || typeof data.token !== "string" || !data.token || !validSignedUrl(data.signedUrl)) {
    // Preserve unreadable bytes; a failed preparation is logically discardable.
    await fileRpc(client, "workspace_discard_file", { p_actor: context.user.id, p_order: input.orderId, p_revision: input.revision, p_id: fileId }).catch(() => {})
    throw new Error("Workspace files unavailable")
  }
  return { fileId, path, token: data.token, signedUrl: data.signedUrl }
}
export async function finalizeBriefFile(input: { orderId: string; revision: number; fileId: string }) {
  if (!isUuid(input.orderId) || !isUuid(input.fileId) || !validFileRevision(input.revision)) throw new Error("Invalid brief file")
  const context = await workspaceContext(input.orderId)
  if (!context) throw new Error("Unauthorized file")
  const client = fileClient()
  const { data: item, error } = await client.from("order_files").select("id,order_id,uploader_id,bucket_id,storage_path,original_filename,size_bytes,mime_type,status,upload_revision").eq("id", input.fileId).eq("order_id", input.orderId).eq("uploader_id", context.user.id).maybeSingle()
  if (error || !item || item.bucket_id !== BUCKET || item.storage_path !== input.orderId + "/" + input.fileId || item.upload_revision !== input.revision || !["pending", "ready"].includes(item.status)) throw new Error("Invalid brief file")
  const args = { p_actor: context.user.id, p_order: input.orderId, p_revision: input.revision, p_id: input.fileId }
  if (item.status === "ready") {
    if (await fileRpc(client, "workspace_finalize_file", { ...args, p_valid: true, p_hash: null }) !== true) throw new Error("Invalid brief file")
    return { ready: true }
  }
  const { data: blob, error: downloadError } = await client.storage.from(BUCKET).download(item.storage_path)
  if (downloadError || !blob) throw new Error("Workspace files unavailable")
  let digest: string
  try {
    if (blob.size > MAX_BRIEF_FILE_BYTES) throw new Error("Invalid brief file")
    const bytes = new Uint8Array(await blob.arrayBuffer())
    validateBriefBytes(bytes, item)
    digest = createHash("sha256").update(bytes).digest("hex")
  } catch {
    await fileRpc(client, "workspace_finalize_file", { ...args, p_valid: false, p_hash: null })
    throw new Error("Invalid brief file")
  }
  if (await fileRpc(client, "workspace_finalize_file", { ...args, p_valid: true, p_hash: digest }) !== true) throw new Error("Invalid brief file")
  return { ready: true }
}
export async function discardBriefFile(input: { orderId: string; revision: number; fileId: string }) {
  if (!isUuid(input.orderId) || !isUuid(input.fileId) || !validFileRevision(input.revision)) throw new Error("Invalid brief file")
  const context = await workspaceContext(input.orderId)
  if (!context) throw new Error("Unauthorized file")
  if (await fileRpc(fileClient(), "workspace_discard_file", { p_actor: context.user.id, p_order: input.orderId, p_revision: input.revision, p_id: input.fileId }) !== true) throw new Error("Invalid brief file")
}
export async function downloadBriefFile(input: { orderId: string; fileId: string }) {
  if (!isUuid(input.orderId) || !isUuid(input.fileId)) throw new Error("Invalid brief file")
  const context = await workspaceContext(input.orderId) ?? await workspaceContext(input.orderId, true)
  if (!context) throw new Error("Unauthorized file")
  // Session/RLS read first, including ready status. No privileged lookup grants
  // an unrelated client access, and pending bytes never get a signed URL.
  const { data: item, error } = await context.client.from("order_files").select("id,order_id,bucket_id,storage_path,original_filename,status").eq("id", input.fileId).eq("order_id", input.orderId).eq("bucket_id", BUCKET).eq("status", "ready").maybeSingle()
  if (error || !item || item.storage_path !== input.orderId + "/" + input.fileId) throw new Error("Invalid brief file")
  const { data, error: signError } = await fileClient().storage.from(BUCKET).createSignedUrl(item.storage_path, 60, { download: item.original_filename })
  if (signError || !data || !validSignedUrl(data.signedUrl)) throw new Error("Workspace files unavailable")
  return { signedUrl: data.signedUrl }
}
