// Client-safe editor state. A refreshed page must not silently replace a draft
// or rebase unsaved answers onto a newer server revision.
export type BriefDraft = { revision: number; answers: Record<string, string>; saved: Record<string, string> }
export function createBriefDraft(revision: number, answers: Record<string, string>): BriefDraft {
  return { revision, answers: { ...answers }, saved: { ...answers } }
}
export function sameAnswers(a: Record<string, string>, b: Record<string, string>) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].every(key => (a[key] ?? "") === (b[key] ?? ""))
}
export function hasUnsavedAnswers(draft: BriefDraft) { return !sameAnswers(draft.answers, draft.saved) }
export function receiveBrief(draft: BriefDraft, revision: number, answers: Record<string, string>, pending: boolean) {
  return !pending && revision > draft.revision && !hasUnsavedAnswers(draft) ? createBriefDraft(revision, answers) : draft
}
export function acknowledgeBrief(draft: BriefDraft, revision: number, answers: Record<string, string>, keepDraft: boolean): BriefDraft {
  return { revision, answers: { ...(keepDraft ? draft.answers : answers) }, saved: { ...answers } }
}
export function confirmedBrief(draft: BriefDraft, revision: number, sent: Record<string, string>): BriefDraft {
  return { ...draft, revision, saved: { ...sent } }
}
