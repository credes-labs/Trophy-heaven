import type { NextConfig } from "next"

const backendHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").hostname
  } catch {
    return "localhost"
  }
})()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudinary + CDN + Medusa file provider hosts (see docs/kit/03 §3.2 perf).
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "http", hostname: backendHost },
      { protocol: "https", hostname: backendHost },
    ],
  },
  transpilePackages: ["@legacy-crafts/schemas"],
  experimental: {
    // Keep heavy editor/viewer client chunks out of the server bundle graph.
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
