import type { ErrorEvent } from "@sentry/nextjs"

// Strict allowlist: strip user/request/headers/cookies, breadcrumbs, URLs,
// original messages, stack locals, attachments and arbitrary SDK contexts.
export function sanitizeErrorEvent(event: ErrorEvent): ErrorEvent {
  return {
    type: undefined,
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: "javascript",
    level: "error",
    message: event.message === "Supabase health check failed" ? "Supabase health check failed" : "Application error (details withheld)",
    environment: event.environment === "production" ? "production" : event.environment === "staging" ? "staging" : "development",
  }
}
