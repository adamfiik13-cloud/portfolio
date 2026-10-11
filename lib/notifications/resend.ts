import "server-only"
import type { ConfirmationPayload } from "./payment-content"

export type SendResult = { ok: true; providerId: string } | { ok: false; code: "provider_rejected" | "provider_uncertain" }
async function receipt(response: Response): Promise<{ id?: unknown }> {
  const reader = response.body?.getReader(), deadline = Date.now() + 8000
  if (!reader || Number(response.headers.get("content-length") ?? 0) > 8192) throw new Error("Invalid email receipt")
  const chunks: Uint8Array[] = []; let size = 0
  try {
    while (true) {
      let timer: ReturnType<typeof setTimeout> | undefined
      const remaining = deadline - Date.now()
      if (remaining <= 0) throw new Error("Email receipt unavailable")
      const part = await Promise.race([reader.read(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Email receipt unavailable")), remaining) })]).finally(() => clearTimeout(timer))
      if (part.done) break
      size += part.value.byteLength
      if (size > 8192) throw new Error("Invalid email receipt")
      chunks.push(part.value)
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"))
  } finally { await reader.cancel().catch(() => {}) }
}
export async function sendConfirmation(payload: ConfirmationPayload, idempotencyKey: string, key: string, request: typeof fetch = fetch): Promise<SendResult> {
  try {
    const response = await request("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(payload), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) })
    if (!response.ok) return { ok: false, code: "provider_rejected" }
    // Read only the safe provider receipt ID, never persist or log the response body.
    const body = await receipt(response)
    return typeof body.id === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(body.id) ? { ok: true, providerId: body.id } : { ok: false, code: "provider_uncertain" }
  } catch { return { ok: false, code: "provider_uncertain" } }
}
