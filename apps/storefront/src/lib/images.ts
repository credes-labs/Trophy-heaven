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
  "/images/blog/",
  "/images/about/",
  "/images/footer/",
  "/images/hero/",
]

function recodeToWebp(path: string): string {
  const [pathname, query = ""] = path.split(/(?=[?#])/, 2)
  if (!/\.(jpe?g|png)$/i.test(pathname)) return path
  if (!WEBP_RECODED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return path
  const webp = pathname.replace(/\.(jpe?g|png)$/i, ".webp")
  return webp + query
}

/** Default link-preview card. JPEG, because some link-preview crawlers reject WebP. */
export const SHARE_IMAGE = {
  url: "/images/og/og-share.jpg",
  width: 1200,
  height: 630,
  alt: "Trophy Heaven custom trophies and awards",
}

/** Open Graph images for a page: its own image when crawlers can read it, else the card. */
export function shareImages(url?: string | null) {
  const local = localizeImageUrl(url)
  return [local && !/\.webp(?:[?#]|$)/i.test(local) ? local : SHARE_IMAGE]
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
