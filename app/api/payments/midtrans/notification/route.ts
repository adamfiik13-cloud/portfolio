import { boundedJson } from "@/lib/payments/provider"
import { paymentReady, receiveNotification } from "@/lib/payments/server"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" }
  if (!paymentReady()) return Response.json({ ok: false }, { status: 503, headers })
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ ok: false }, { status: 400, headers })
  let body: unknown
  try { body = await boundedJson(new Response(request.body, { headers: request.headers })) }
  catch { return Response.json({ ok: false }, { status: 400, headers }) }
  try { await receiveNotification(body); return Response.json({ ok: true }, { headers }) }
  catch (error) {
    // Fixed messages only, no signature, token, provider body or customer data.
    const invalid = error instanceof Error && ["Invalid notification", "Invalid payment amount", "Payment binding mismatch", "Unrecognized payment status"].includes(error.message)
    return Response.json({ ok: false }, { status: invalid ? 400 : 503, headers })
  }
}
