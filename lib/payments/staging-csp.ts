import { STAGING_ANALYTICS_CSP } from "../analytics/staging-csp"
// Only the order detail interface gets Sandbox connect/frame resources. The
// cross-origin Snap iframe owns its inner resources; GA4 collection stays blocked.
export const STAGING_PAYMENT_CSP = STAGING_ANALYTICS_CSP
  .replace("connect-src 'self'", "connect-src 'self' https://app.sandbox.midtrans.com https://api.sandbox.midtrans.com")
  .replace("frame-src 'self'", "frame-src 'self' https://app.sandbox.midtrans.com")
