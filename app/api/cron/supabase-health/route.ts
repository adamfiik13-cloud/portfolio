import { handleHealth } from "@/lib/backend/health-handler"
import { checkSupabaseHealth } from "@/lib/supabase/health"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 15

export async function GET(request: Request) {
  return handleHealth(request, {
    secret: process.env.CRON_SECRET,
    check: checkSupabaseHealth,
    reportFailure: async () => {
      if (!process.env.SENTRY_DSN) return
      const Sentry = await import("@sentry/nextjs")
      Sentry.captureMessage("Supabase health check failed", "error")
      await Sentry.flush(2000)
    },
  })
}
