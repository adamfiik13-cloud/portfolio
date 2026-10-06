"use server"
import { revalidatePath } from "next/cache"
import { beginPayment, checkPayment } from "./server"
export async function paymentAction(orderId: string, operation: "pay" | "check") {
  try {
    const result = operation === "pay" ? await beginPayment(orderId) : operation === "check" ? await checkPayment(orderId) : { message: "unavailable" as const }
    revalidatePath("/orders/" + orderId)
    revalidatePath("/id/pesanan/" + orderId)
    return result
  } catch { return { message: "unavailable" as const } }
}
