"use server"
import { revalidatePath } from "next/cache"
import { saveBrief, reviewBrief, startWork } from "./server"
import type { Locale } from "@/lib/commerce/rules"
import type { WorkspaceState } from "./rules"

function revision(form: FormData) {
  const value = form.get("revision")
  return typeof value === "string" && /^\d{1,9}$/.test(value) ? Number(value) : -1
}
function failure(error: unknown): WorkspaceState {
  return { message: error instanceof Error && error.message === "Stale brief" ? "stale" : error instanceof Error && ["Invalid brief", "Invalid review"].includes(error.message) ? "invalid" : "unavailable" }
}
function refresh(orderId: string) {
  for (const base of ["/orders", "/id/pesanan", "/owner/orders", "/id/pemilik/pesanan"]) { revalidatePath(base); revalidatePath(base + "/" + orderId) }
}
export async function briefAction(_locale: Locale, orderId: string, _previous: WorkspaceState, form: FormData): Promise<WorkspaceState> {
  const operation = form.get("operation"), answers: Record<string, string> = {}
  if (!["save", "submit"].includes(String(operation))) return { message: "invalid" }
  for (const [name, value] of form.entries()) if (name.startsWith("answer:")) {
    if (typeof value !== "string" || Object.hasOwn(answers, name.slice(7))) return { message: "invalid" }
    Object.defineProperty(answers, name.slice(7), { value, enumerable: true })
  }
  try {
    const saved = await saveBrief(orderId, revision(form), answers, operation === "submit")
    refresh(orderId)
    return { message: operation === "submit" ? "submitted" : "saved", revision: saved.revision }
  } catch (error) { return failure(error) }
}
export async function reviewBriefAction(_locale: Locale, orderId: string, _previous: WorkspaceState, form: FormData): Promise<WorkspaceState> {
  const decision = form.get("decision"), note = form.get("note")
  if ((decision !== "approve" && decision !== "changes_requested") || typeof note !== "string") return { message: "invalid" }
  try {
    const saved = await reviewBrief(orderId, revision(form), decision, note)
    refresh(orderId)
    return { message: decision === "approve" ? "approved" : "changes_requested", revision: saved.revision }
  } catch (error) { return failure(error) }
}
export async function startWorkAction(_locale: Locale, orderId: string, _previous: WorkspaceState, form: FormData): Promise<WorkspaceState> {
  try { await startWork(orderId, revision(form)); refresh(orderId); return { message: "started" } }
  catch (error) { return failure(error) }
}
