/** Line metadata must not store data-URL screenshots — they bloat carts and break merge. */
export function cartLinePreviewUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith("data:")) return undefined
  return url
}
