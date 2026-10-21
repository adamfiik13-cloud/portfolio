import type { BriefField, TransactionTerms } from "@/lib/commerce/rules"

export type BriefStatus = "incomplete" | "submitted" | "changes_requested" | "approved"
export type WorkspaceMessage = "saved" | "submitted" | "changes_requested" | "approved" | "started" | "stale" | "invalid" | "unavailable"
export type WorkspaceState = { message?: WorkspaceMessage; revision?: number }

// Definitions belong to the accepted contract, never to the current catalogue.
export function briefFields(terms: TransactionTerms): BriefField[] {
  return terms.brief_fields ?? terms.requirements.map((requirement, index) => ({
    id: "requirement_" + (index + 1), label: requirement, instruction: requirement, required: true,
  }))
}
export function validResponses(fields: BriefField[], value: unknown, complete: boolean): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value) || !fields.length || fields.length > 40) return false
  const responses = value as Record<string, unknown>
  if (Object.entries(responses).some(([id, answer]) => !fields.some(field => field.id === id) || typeof answer !== "string" || answer.length > 6000 || /\u0000/.test(answer))) return false
  return !complete || fields.every(field => !field.required || typeof responses[field.id] === "string" && String(responses[field.id]).trim().length > 0)
}
export function editableBrief(payment: string, work: string, started: string | null, status: BriefStatus) {
  return payment === "paid" && !started && !["cancelled", "completed"].includes(work) && ["incomplete", "changes_requested"].includes(status)
}
