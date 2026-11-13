import type { NextConfig } from "next"

const backendHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").hostname
  } catch {
    return "localhost"
  }
})()

// Site imagery was recoded to WebP (WP-85); old links (emails, shared URLs, caches)
// still ask for .jpg/.png. Five explore photographs duplicated catalog ones.
const WEBP_DIRS = "products|catalog|explore|blog|about|footer|hero"
const DEDUPED_IMAGES: Array<[string, string]> = [
  ["explore/sierra-fabric", "catalog/seating-armchair"],
  ["explore/oslo-leather", "catalog/seating-lounge"],
  ["explore/aria-minimal", "catalog/storage-shelf"],
  ["explore/nova-oak", "catalog/tables-coffee"],
  ["explore/vertex-glass", "catalog/tables-side"],
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Source files are content-stable; keep optimized variants for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Cloudinary + CDN + Medusa file provider hosts (see docs/kit/03 §3.2 perf).
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "http", hostname: backendHost },
      { protocol: "https", hostname: backendHost },
      // Dev servers run on non-default ports, which remotePatterns does not
      // match without an explicit port entry.
      { protocol: "http", hostname: "localhost", port: "3000" },
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "http", hostname: "127.0.0.1", port: "3000" },
      { protocol: "http", hostname: "127.0.0.1", port: "9000" },
    ],
  },
  async redirects() {
    return [
      ...DEDUPED_IMAGES.map(([from, to]) => ({
        source: `/images/${from}.:ext(jpg|jpeg|png|webp)`,
        destination: `/images/${to}.webp`,
        permanent: true,
      })),
      {
        source: `/images/:dir(${WEBP_DIRS})/:file.:ext(jpg|jpeg|png)`,
        destination: "/images/:dir/:file.webp",
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        // Un-hashed public files: cache a day, serve stale while revalidating for a month.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=2592000" }],
      },
    ]
  },
  transpilePackages: ["@legacy-crafts/schemas"],
  experimental: {
    // Keep heavy editor/viewer client chunks out of the server bundle graph.
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
