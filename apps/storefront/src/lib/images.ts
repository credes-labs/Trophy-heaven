/**
 * Product imagery in dev is seeded with absolute URLs pointing at the
 * storefront origin (e.g. http://localhost:3000/images/...). The Next image
 * optimizer rejects absolute same-origin URLs that are not in remotePatterns,
 * while root-relative paths are always allowed — so rewrite same-origin URLs
 * to relative ones and leave true external (CDN/Medusa file provider) URLs
 * untouched.
 */
export function localizeImageUrl<T extends string | null | undefined>(url: T): T {
  if (!url) return url
  const origins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean) as string[]
  for (const origin of origins) {
    if (url.startsWith(origin + "/")) {
      return url.slice(origin.length) as T
    }
  }
  return url
}
