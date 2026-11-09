"use client"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Locale } from "@/lib/commerce/rules"
import { orderDetailText as t } from "@/data/order-detail"

export default function OrderRefresh({ locale }: { locale: Locale }) {
  const router = useRouter(), [pending, startTransition] = useTransition()
  return <div className="order-refresh"><button type="button" className="order-button" disabled={pending} aria-describedby="order-refresh-help" aria-busy={pending} onClick={() => startTransition(() => router.refresh())}>{t(pending ? "refreshing" : "refresh", locale)}</button><p id="order-refresh-help" className="order-secondary">{t("refreshHelp", locale)}</p></div>
}
