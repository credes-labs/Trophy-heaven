/**
 * Canonical public origin for metadata, JSON-LD, sitemap, and OG images.
 * Prefer an explicit env; fall back to Vercel system URLs so production never
 * ships `http://localhost:3000` when NEXT_PUBLIC_BASE_URL is unset.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) {
    return production.startsWith("http") ? production.replace(/\/$/, "") : `https://${production}`
  }

  const preview = process.env.VERCEL_URL?.trim()
  if (preview) {
    return preview.startsWith("http") ? preview.replace(/\/$/, "") : `https://${preview}`
  }

  return "http://localhost:3000"
}
