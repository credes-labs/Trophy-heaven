import type { NextConfig } from "next"

const backendUrl = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "")

const backendHost = (() => {
  try {
    return new URL(backendUrl).hostname
  } catch {
    return "localhost"
  }
})()

const cdnHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_CDN_BASE_URL
      ? new URL(process.env.NEXT_PUBLIC_CDN_BASE_URL).hostname
      : null
  } catch {
    return null
  }
})()

// Site imagery was recoded to WebP (WP-85); old links (emails, shared URLs, caches)
// still ask for .jpg/.png.
const WEBP_DIRS = "products|catalog|blog|about|footer|hero"

// Trophy Heaven sells trophies only; the Legacy Crafts furniture and artwork
// landings (and their catch-all category paths) fold into the trophy collection.
const RETIRED_CATEGORY_PATHS = [
  "/furniture",
  "/artwork",
  "/categories/furniture/:path*",
  "/categories/home-decor/:path*",
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Source files are content-stable; keep optimized variants for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Next 16 refuses to optimize images from private IPs. Product photos live on
    // Medusa's file storage, which is localhost:9000 in development only.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    // Cloudinary + CDN + Medusa file provider hosts (see docs/kit/03 §3.2 perf).
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      ...(cdnHost ? [{ protocol: "https" as const, hostname: cdnHost }] : []),
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
      // The admin is served by Medusa at /app on the backend's own domain.
      { source: "/admin", destination: `${backendUrl}/app`, permanent: false },
      { source: "/admin/:path*", destination: `${backendUrl}/app/:path*`, permanent: false },
      ...RETIRED_CATEGORY_PATHS.map((source) => ({
        source,
        destination: "/trophies",
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
  transpilePackages: ["@trophy-heaven/schemas"],
  experimental: {
    // Keep heavy editor/viewer client chunks out of the server bundle graph.
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
