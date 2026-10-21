import { prepareBriefFile, finalizeBriefFile, downloadBriefFile, discardBriefFile } from "@/lib/workspace/files"
import { isUuid } from "@/lib/commerce/rules"
import { validFileRevision, validBriefFile } from "@/lib/workspace/file-rules"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" }
async function json(request: Request): Promise<Record<string, unknown>> {
  const declared = request.headers.get("content-length")
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > 4096) || !request.body) throw new Error("Invalid request")
  const reader = request.body!.getReader(), chunks: Uint8Array[] = []
  let size = 0, expired = false
  const timer = setTimeout(() => { expired = true; void reader.cancel() }, 5000)
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 4096) throw new Error("Invalid request")
      chunks.push(value)
    }
    if (expired) throw new Error("Invalid request")
    const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)))
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid request")
    return value as Record<string, unknown>
  } finally { clearTimeout(timer); await reader.cancel().catch(() => {}) }
}
export async function POST(request: Request) {
  // Fetch from our own browser UI must carry the exact same origin. Cookies or
  // cross-site forms cannot authorize mutations by themselves.
  const origin = request.headers.get("origin")
  if (origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ ok: false }, { status: 403, headers })
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ ok: false }, { status: 400, headers })
  try {
    const body = await json(request)
    if (!isUuid(body.orderId)) throw new Error("Invalid request")
    const orderId = body.orderId
    if (body.op === "download" && isUuid(body.fileId)) return Response.json({ ok: true, ...await downloadBriefFile({ orderId, fileId: body.fileId }) }, { headers })
    if (!validFileRevision(body.revision)) throw new Error("Invalid request")
    if (body.op === "prepare" && validBriefFile({ filename: body.filename, size: body.size, mime: body.mime })) return Response.json({ ok: true, ...await prepareBriefFile({ orderId, revision: body.revision, filename: body.filename as string, size: body.size as number, mime: body.mime as string }) }, { headers })
    if (body.op === "finalize" && isUuid(body.fileId)) return Response.json({ ok: true, ...await finalizeBriefFile({ orderId, revision: body.revision, fileId: body.fileId }) }, { headers })
    if (body.op === "discard" && isUuid(body.fileId)) { await discardBriefFile({ orderId, revision: body.revision, fileId: body.fileId }); return Response.json({ ok: true }, { headers }) }
    throw new Error("Invalid request")
  } catch { return Response.json({ ok: false }, { status: 400, headers }) }
}
