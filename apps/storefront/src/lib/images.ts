/**
 * Product imagery in dev is seeded with absolute URLs pointing at the
 * storefront origin (e.g. http://localhost:3000/images/...). The Next image
 * optimizer rejects absolute same-origin URLs that are not in remotePatterns,
 * while root-relative paths are always allowed — so rewrite same-origin URLs
 * to relative ones and leave true external (CDN/Medusa file provider) URLs
 * untouched.
 *
 * WP-16 recoded photographic PNGs to JPEG. Databases seeded before that still
 * store `.png` paths; remap those known folders so `next/image` can resolve.
 */
const JPEG_RECODED_PREFIXES = [
  "/images/products/",
  "/images/catalog/",
  "/images/explore/",
  "/images/categories/",
  "/images/blog/",
  "/images/about/",
  "/images/footer/",
]

function recodePhotoPngToJpeg(path: string): string {
  if (!path.endsWith(".png")) return path
  if (JPEG_RECODED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return `${path.slice(0, -4)}.jpg`
  }
  return path
}

export function localizeImageUrl<T extends string | null | undefined>(url: T): T {
  if (!url) return url
  const origins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean) as string[]
  let next = url as string
  for (const origin of origins) {
    if (next.startsWith(origin + "/")) {
      next = next.slice(origin.length)
      break
    }
  }
  return recodePhotoPngToJpeg(next) as T
}
