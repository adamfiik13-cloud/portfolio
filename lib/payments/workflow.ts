import { statusMapping, verifiedStatus, type Attempt, type VerifiedStatus } from "./rules"

export type PaymentDependencies = {
  merchant: string
  reserve: (replace?: string) => Promise<{ attempt: Attempt; create: boolean }>
  saveToken: (id: string, token: string | null) => Promise<boolean>
  create: (reference: string, amount: number) => Promise<string>
  status: (reference: string) => Promise<unknown | null>
  apply: (status: VerifiedStatus) => Promise<string>
}
export async function reconcile(attempt: Attempt, deps: Pick<PaymentDependencies, "merchant" | "status" | "apply">) {
  const raw = await deps.status(attempt.transaction_id ?? attempt.provider_reference)
  if (raw === null) return null
  const verified = verifiedStatus(raw, attempt, deps.merchant)
  return { state: await deps.apply(verified), observed: statusMapping(verified.status, verified.fraud) }
}
export async function initiate(deps: PaymentDependencies) {
  let reserved = await deps.reserve()
  if (!reserved.create) {
    // Exactly one reserver owns the creation request; concurrent callers wait.
    if (reserved.attempt.attempt_state === "creating") return { message: "uncertain" as const }
    const state = await reconcile(reserved.attempt, deps)
    if (state?.state === "verified") return { message: "verified" as const }
    // A stored terminal status retained by monotonic reconciliation is not proof
    // that the latest provider response is terminal (e.g. an older pending read).
    if (state && state.observed === state.state && ["failed", "expired", "cancelled"].includes(state.observed)) reserved = await deps.reserve(reserved.attempt.id)
    else if (reserved.attempt.status === "pending" && reserved.attempt.attempt_state === "ready" && reserved.attempt.snap_token) return { token: reserved.attempt.snap_token }
    else return { message: "uncertain" as const }
  }
  if (!reserved.create) return { message: "uncertain" as const }
  try {
    const token = await deps.create(reserved.attempt.provider_reference, Number(reserved.attempt.amount_idr))
    if (!await deps.saveToken(reserved.attempt.id, token)) throw new Error("Payment changed")
    return { token }
  } catch {
    // Including provider rejection/timeout and DB token-save failure. Never send
    // another creation request for the reference or release its reservation.
    await deps.saveToken(reserved.attempt.id, null).catch(() => false)
    return { message: "uncertain" as const }
  }
}
