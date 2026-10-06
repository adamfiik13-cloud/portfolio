"use client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { paymentAction } from "@/lib/payments/actions"
import { paymentCopy } from "@/data/payment-copy"

type Snap = { pay: (token: string, options: { language: "en" | "id"; onSuccess: () => void; onPending: () => void; onError: () => void; onClose: () => void }) => void }
declare global { interface Window { snap?: Snap } }
let loading: Promise<void> | null = null
function loadSnap(clientKey: string) {
  if (window.snap) return Promise.resolve()
  if (loading) return loading
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    const timer = setTimeout(() => { script.remove(); loading = null; reject(new Error("Sandbox unavailable")) }, 10000)
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    script.dataset.clientKey = clientKey
    script.onload = () => { clearTimeout(timer); if (window.snap) resolve(); else { loading = null; reject(new Error("Sandbox unavailable")) } }
    script.onerror = () => { clearTimeout(timer); script.remove(); loading = null; reject(new Error("Sandbox unavailable")) }
    document.head.appendChild(script)
  })
  return loading
}
export default function PaymentPanel({ orderId, locale, ready, paid, eligible }: { orderId: string; locale: "en" | "id"; ready: boolean; paid: boolean; eligible: boolean }) {
  const c = paymentCopy[locale], router = useRouter(), running = useRef(false)
  const [busy, setBusy] = useState(false), [message, setMessage] = useState<keyof typeof c | null>(null)
  async function run(operation: "pay" | "check") {
    if (running.current) return
    running.current = true; setBusy(true)
    try {
      const result = await paymentAction(orderId, operation)
      if ("token" in result && typeof result.token === "string" && "clientKey" in result && typeof result.clientKey === "string") {
        await loadSnap(result.clientKey)
        const callback = () => { setMessage("callback"); router.refresh() }
        window.snap!.pay(result.token, { language: locale, onSuccess: callback, onPending: callback, onError: callback, onClose: callback })
      } else if ("message" in result && result.message) setMessage(result.message)
      router.refresh()
    } catch { setMessage("unavailable") }
    finally { running.current = false; setBusy(false) }
  }
  const button = "min-h-11 px-5 py-3 border border-line rounded-lg font-display font-semibold disabled:opacity-60"
  return <section className="border border-line rounded-2xl p-5 space-y-4 font-interface" aria-labelledby="sandbox-payment-title">
    <h2 id="sandbox-payment-title" className="font-display text-2xl">{c.title}</h2><p className="text-muted">{c.intro}</p>
    {!ready ? <p role="status">{c.unavailable}</p> : <div className="flex flex-wrap gap-3">
      {!paid && eligible && <button type="button" className={button + " bg-red text-white"} disabled={busy} onClick={() => void run("pay")}>{busy ? c.busy : c.pay}</button>}
      <button type="button" className={button} disabled={busy} onClick={() => void run("check")}>{busy ? c.busy : c.check}</button>
    </div>}
    {message && <p role="status" aria-live="polite">{c[message]}</p>}
  </section>
}
