import { redirect } from "next/navigation"

/** The SHOP nav item is the `/shop` listing; keep `/catalog` URLs (and their filters) working. */
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of Array.isArray(value) ? value : value == null ? [] : [value]) usp.append(key, v)
  }
  const qs = usp.toString()
  redirect(qs ? `/shop?${qs}` : "/shop")
}
