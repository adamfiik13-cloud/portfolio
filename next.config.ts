import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    formats: ["image/webp", "image/avif"],
  },
}

export default nextConfig
