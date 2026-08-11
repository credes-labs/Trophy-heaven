import { medusa } from "./medusa"
import type { HttpTypes } from "@medusajs/types"

/**
 * Resolves the storefront region. India (INR) is the default market; the
 * architecture is multi-region ready for global expansion (docs/kit/12 #9).
 */
const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"

let cachedRegions: HttpTypes.StoreRegion[] | null = null

export async function listRegions(): Promise<HttpTypes.StoreRegion[]> {
  if (cachedRegions) return cachedRegions
  const { regions } = await medusa.store.region.list()
  cachedRegions = regions
  return regions
}

export async function getRegion(countryCode = DEFAULT_COUNTRY): Promise<HttpTypes.StoreRegion | undefined> {
  const regions = await listRegions()
  const match = regions.find((r) =>
    r.countries?.some((c) => c.iso_2?.toLowerCase() === countryCode.toLowerCase())
  )
  return match ?? regions[0]
}
