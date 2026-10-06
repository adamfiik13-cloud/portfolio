import type { NextConfig } from "next"
import { STAGING_ANALYTICS_CSP } from "./lib/analytics/staging-csp"
import { STAGING_PAYMENT_CSP } from "./lib/payments/staging-csp"

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return process.env.APP_ENV === "staging" ? [
      { source: "/:path*", headers: [{ key: "Content-Security-Policy", value: STAGING_ANALYTICS_CSP }] },
      ...["/orders/:id", "/id/pesanan/:id"].map(source => ({ source, headers: [{ key: "Content-Security-Policy", value: STAGING_PAYMENT_CSP }] })),
    ] : []
  },
  outputFileTracingIncludes: {
    "/typography-checkpoint/[[...asset]]": ["./docs/typography-checkpoint.html", "./app/fonts/*.woff2"],
  },
  images: {
    formats: ["image/webp", "image/avif"],
    qualities: [75, 85, 90],
  },
}

export default nextConfig
