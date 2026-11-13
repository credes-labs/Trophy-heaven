/**
 * Product imagery in dev is seeded with absolute URLs pointing at the
 * storefront origin (e.g. http://localhost:3000/images/...). The Next image
 * optimizer rejects absolute same-origin URLs that are not in remotePatterns,
 * while root-relative paths are always allowed — so rewrite same-origin URLs
 * to relative ones and leave true external (CDN/Medusa file provider) URLs
 * untouched.
 *
 * Site imagery in public/images is WebP (WP-85). Databases seeded earlier still
 * store `.jpg`/`.png` paths (WP-16 recoded PNG to JPEG, WP-85 recoded both to
 * WebP), so those known folders are remapped to `.webp` here. Campaign ad units
 * and the social-share card stay JPEG and are left alone.
 */
const WEBP_RECODED_PREFIXES = [
  "/images/products/",
  "/images/catalog/",
  "/images/explore/",
  "/images/blog/",
  "/images/about/",
  "/images/footer/",
  "/images/hero/",
]

/** Same photograph was stored twice; the explore copies were removed in WP-85. */
const DEDUPED: Record<string, string> = {
  "/images/explore/sierra-fabric.webp": "/images/catalog/seating-armchair.webp",
  "/images/explore/oslo-leather.webp": "/images/catalog/seating-lounge.webp",
  "/images/explore/aria-minimal.webp": "/images/catalog/storage-shelf.webp",
  "/images/explore/nova-oak.webp": "/images/catalog/tables-coffee.webp",
  "/images/explore/vertex-glass.webp": "/images/catalog/tables-side.webp",
}

function recodeToWebp(path: string): string {
  const [pathname, query = ""] = path.split(/(?=[?#])/, 2)
  if (!/\.(jpe?g|png)$/i.test(pathname)) return path
  if (!WEBP_RECODED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return path
  const webp = pathname.replace(/\.(jpe?g|png)$/i, ".webp")
  return (DEDUPED[webp] ?? webp) + query
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
  return recodeToWebp(next) as T
}
