"use client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { workspaceText as t } from "@/data/workspace"
import type { Locale } from "@/lib/commerce/rules"

export type BriefAttachment = { id: string; original_filename: string; size_bytes: number; mime_type: string; status: string }
// Browser guidance only. The server independently checks actual size and bytes.
const mimeByExtension: Record<string, string> = {
  pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", txt: "text/plain", csv: "text/csv",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}
const button = "min-h-11 px-4 py-3 border border-line rounded-lg font-display disabled:opacity-60"
type FileResult = { ok: boolean; fileId?: string; path?: string; token?: string; signedUrl?: string; ready?: boolean }
async function fileRequest(body: Record<string, unknown>): Promise<FileResult> {
  const response = await fetch("/api/workspace/files", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", cache: "no-store", body: JSON.stringify(body) })
  if (!response.ok) throw new Error("File action unavailable")
  const result = await response.json() as FileResult
  if (!result.ok) throw new Error("File action unavailable")
  return result
}
export default function AttachmentPanel({ locale, orderId, revision, files, editable }: { locale: Locale; orderId: string; revision: number; files: BriefAttachment[]; editable: boolean }) {
  const router = useRouter(), input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false), [message, setMessage] = useState<"uploaded" | "removed" | "fileError" | null>(null)
  async function upload() {
    const file = input.current?.files?.[0]
    if (!file || busy || !editable) return
    setBusy(true); setMessage(null)
    let pendingId: string | undefined
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
      const mime = file.type || mimeByExtension[extension]
      if (!mime || !Object.values(mimeByExtension).includes(mime) || file.size < 1 || file.size > 10 * 1024 * 1024) throw new Error("Invalid file")
      const prepared = await fileRequest({ op: "prepare", orderId, revision, filename: file.name, size: file.size, mime })
      pendingId = prepared.fileId
      if (!pendingId || !prepared.path || !prepared.token) throw new Error("File action unavailable")
      const { error } = await createClient().storage.from("client-briefs").uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: mime, upsert: false })
      if (error) throw new Error("File action unavailable")
      const finalized = await fileRequest({ op: "finalize", orderId, revision, fileId: pendingId })
      if (!finalized.ready) throw new Error("File action unavailable")
      pendingId = undefined
      setMessage("uploaded"); if (input.current) input.current.value = ""; router.refresh()
    } catch {
      if (pendingId) { try { await fileRequest({ op: "discard", orderId, revision, fileId: pendingId }) } catch { /* Pending objects stay unreadable; no secrets or raw errors are logged. */ } }
      setMessage("fileError")
    } finally { setBusy(false) }
  }
  async function act(op: "download" | "discard" | "finalize", fileId: string) {
    if (busy) return
    setBusy(true); setMessage(null)
    try {
      const result = await fileRequest({ op, orderId, revision, fileId })
      if (op === "download") {
        if (!result.signedUrl || new URL(result.signedUrl).protocol !== "https:") throw new Error("File action unavailable")
        window.location.assign(result.signedUrl)
      } else if (op === "finalize") { if (!result.ready) throw new Error("File action unavailable"); setMessage("uploaded"); router.refresh() }
      else { setMessage("removed"); router.refresh() }
    } catch { setMessage("fileError") }
    finally { setBusy(false) }
  }
  const visibleFiles = files.filter(file => ["ready", "pending", "quarantined"].includes(file.status))
  return <section className="space-y-4" aria-labelledby="brief-files-title" aria-busy={busy}>
    <h3 id="brief-files-title" className="font-display text-xl">{t("attachments", locale)}</h3><p className="text-sm text-muted">{t("attachmentHelp", locale)}</p>
    {editable && <div className="space-y-3"><p className="text-sm text-muted">{t("saveBeforeUpload", locale)}</p><label className="block space-y-2"><span>{t("chooseFile", locale)}</span><input ref={input} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.docx,.xlsx" disabled={busy} className="block w-full min-h-11 text-sm file:min-h-11 file:mr-3 file:px-3 file:rounded-lg file:border file:border-line file:bg-surface file:text-soft" /></label><button type="button" disabled={busy} onClick={() => void upload()} className={button}>{busy ? t("uploading", locale) : t("upload", locale)}</button></div>}
    {!visibleFiles.length ? <p className="text-muted">{t("noFiles", locale)}</p> : <ul className="space-y-3">{visibleFiles.map(file => <li key={file.id} className="border border-line rounded-lg p-4 space-y-2"><p className="break-words">{file.original_filename}</p><p className="text-sm text-muted break-all">{Math.ceil(file.size_bytes / 1024)} KiB · {file.mime_type}</p>{file.status !== "ready" && <p className="text-sm text-muted">{t(file.status === "pending" ? "filePending" : "fileQuarantined", locale)}</p>}<div className="flex flex-wrap gap-3">{file.status === "ready" && <button type="button" disabled={busy} className={button} onClick={() => void act("download", file.id)}>{t("download", locale)}</button>}{editable && file.status === "pending" && <button type="button" disabled={busy} className={button} onClick={() => void act("finalize", file.id)}>{t("finalize", locale)}</button>}{editable && file.status !== "ready" && <button type="button" disabled={busy} className={button} onClick={() => void act("discard", file.id)}>{t("remove", locale)}</button>}</div></li>)}</ul>}
    {message && <p role={message === "fileError" ? "alert" : "status"} aria-live="polite">{t(message, locale)}</p>}
  </section>
}
