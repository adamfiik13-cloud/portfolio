"use server"
import { revalidatePath } from "next/cache"
import { retryConfirmation } from "./server"

export async function retryConfirmationAction(orderId: string) {
  try {
    const status = await retryConfirmation(orderId)
    revalidatePath("/orders/" + orderId)
    revalidatePath("/id/pesanan/" + orderId)
    return status
  } catch { return "unavailable" as const }
}
