import "server-only"

// Fixed Sandbox hosts only. No raw response, credentials or token is logged.
export async function boundedJson(response: Response, limit = 65536): Promise<unknown> {
  if (Number(response.headers.get("content-length")) > limit || !response.body) throw new Error("Invalid payment response")
  const reader = response.body.getReader(), chunks: Uint8Array[] = []
  let size = 0, timedOut = false
  const timer = setTimeout(() => { timedOut = true; void reader.cancel() }, 8000)
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) throw new Error("Payment payload too large")
      chunks.push(value)
    }
    if (timedOut) throw new Error("Payment payload timeout")
    return JSON.parse(Buffer.concat(chunks).toString("utf8"))
  } finally { clearTimeout(timer); await reader.cancel().catch(() => {}) }
}
export function provider(serverKey: string, transport: typeof fetch = fetch) {
  async function request(url: string, body?: object) {
    const response = await transport(url, { method: body ? "POST" : "GET", headers: { Authorization: "Basic " + Buffer.from(serverKey + ":").toString("base64"), Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) })
    const data = await boundedJson(response)
    return { response, data }
  }
  return {
    async create(reference: string, amount: number) {
      const { response, data } = await request("https://app.sandbox.midtrans.com/snap/v1/transactions", { transaction_details: { order_id: reference, gross_amount: amount } })
      const token = data && typeof data === "object" && "token" in data ? data.token : null
      if (!response.ok || typeof token !== "string" || !/^[a-zA-Z0-9_-]{16,512}$/.test(token)) throw new Error("Payment creation uncertain")
      return token
    },
    async status(reference: string) {
      const { response, data } = await request("https://api.sandbox.midtrans.com/v2/" + encodeURIComponent(reference) + "/status")
      // Snap has no Core status until a payment method is selected. Never replace on 404.
      if (response.status === 404 || data && typeof data === "object" && "status_code" in data && data.status_code === "404") return null
      if (!response.ok) throw new Error("Payment status unavailable")
      return data
    },
  }
}
