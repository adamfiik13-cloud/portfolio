import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  outputFileTracingIncludes: {
    "/typography-checkpoint/[[...asset]]": ["./docs/typography-checkpoint.html", "./app/fonts/*.woff2"],
  },
  images: {
    formats: ["image/webp", "image/avif"],
    qualities: [75, 85, 90],
  },
}

export default nextConfig
