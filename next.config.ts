import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    formats: ["image/webp", "image/avif"],
    qualities: [75, 85, 90],
  },
}

export default nextConfig
