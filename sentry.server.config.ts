import * as Sentry from "@sentry/nextjs"
import { sanitizeErrorEvent } from "@/lib/monitoring/privacy"
import { backendEnvironment } from "@/lib/backend/environment"

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: backendEnvironment(),
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false, databaseQueryData: false, queues: false, stackFrameVariables: false, frameContextLines: 0, graphQL: { document: false, variables: false }, genAI: { inputs: false, outputs: false } },
    defaultIntegrations: false,
    tracesSampleRate: 0,
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
    maxBreadcrumbs: 0,
    beforeSend: sanitizeErrorEvent,
  })
}
