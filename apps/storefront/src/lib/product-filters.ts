import { studioPieceForHandle } from "./configurator/studio-pieces"
import type { HttpTypes } from "@medusajs/types"
import { isCustomizable } from "@/lib/format"

/** Lowest calculated price across a product's variants (null when unpriced). */
export function productPrice(product: HttpTypes.StoreProduct): number | null {
  const amounts = (product.variants ?? [])
    .map((v) => v.calculated_price?.calculated_amount)
    .filter((n): n is number => typeof n === "number")
  if (!amounts.length) return null
  return Math.min(...amounts)
}

/**
 * Catalogue metadata uses the material that was cast (brass, crystal, wood).
 * The filter menu uses the broader names on the trophies page.
 */
const MATERIAL_ALIASES: Record<string, readonly string[]> = {
  wood: ["wood", "walnut", "oak", "timber"],
  metal: ["metal", "brass", "bronze", "gilt", "gold", "silver", "copper"],
  crystal: ["crystal", "glass"],
  acrylic: ["acrylic"],
  marble: ["marble"],
  leather: ["leather"],
}

/**
 * Loose material match: metadata.material first (including aliases such as
 * brass → Metal), then a text haystack so a title like "Walnut Award" still
 * matches a search for "walnut".
 */
export function matchesMaterial(product: HttpTypes.StoreProduct, material: string): boolean {
  const wanted = material.toLowerCase()
  const aliases = MATERIAL_ALIASES[wanted] ?? [wanted]
  const meta = product.metadata?.material
  if (typeof meta === "string" && aliases.includes(meta.toLowerCase())) return true
  const hay = [
    product.title,
    product.description ?? "",
    ...(product.categories?.map((c) => c.name ?? "") ?? []),
    ...(product.tags?.map((t) => t.value ?? "") ?? []),
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(wanted)
}

/** Price order is applied here. The store API 500s on `variants.calculated_price`. */
export function sortProducts<T extends HttpTypes.StoreProduct>(
  products: T[],
  sort?: string | null
): T[] {
  if (sort !== "price_asc" && sort !== "price_desc") return products
  const direction = sort === "price_asc" ? 1 : -1
  return products.toSorted((a, b) => {
    const left = productPrice(a)
    const right = productPrice(b)
    if (left == null && right == null) return 0
    if (left == null) return 1
    if (right == null) return -1
    return (left - right) * direction
  })
}

/**
 * Store variants expose `inventory_quantity` when `+variants.inventory_quantity`
 * is requested (see PRODUCT_FIELDS in lib/data/catalog.ts). A variant is
 * purchasable when inventory is unmanaged, backorders are allowed, or stock > 0.
 */
export function variantInStock(
  variant: Pick<
    HttpTypes.StoreProductVariant,
    "manage_inventory" | "allow_backorder" | "inventory_quantity"
  >
): boolean {
  if (!variant.manage_inventory) return true
  if (variant.allow_backorder) return true
  return (variant.inventory_quantity ?? 0) > 0
}

export function productInStock(product: HttpTypes.StoreProduct): boolean {
  const variants = product.variants ?? []
  if (!variants.length) return false
  return variants.some(variantInStock)
}

function cheaperVariant(
  a: HttpTypes.StoreProductVariant,
  b: HttpTypes.StoreProductVariant
): HttpTypes.StoreProductVariant {
  const aAmount = a.calculated_price?.calculated_amount ?? Number.POSITIVE_INFINITY
  const bAmount = b.calculated_price?.calculated_amount ?? Number.POSITIVE_INFINITY
  return bAmount < aAmount ? b : a
}

/** Cheapest variant by calculated price, including out-of-stock SKUs (JSON-LD / display). */
export function cheapestPricedVariant(
  product: Pick<HttpTypes.StoreProduct, "variants">
): HttpTypes.StoreProductVariant | undefined {
  const variants = product.variants ?? []
  if (!variants.length) return undefined
  return variants.reduce(cheaperVariant)
}

/** Cheapest in-stock variant — used for ATC so we never default to variants[0] if it is OOS. */
export function cheapestInStockVariant(
  product: Pick<HttpTypes.StoreProduct, "variants">
): HttpTypes.StoreProductVariant | undefined {
  const inStock = (product.variants ?? []).filter(variantInStock)
  if (!inStock.length) return undefined
  return inStock.reduce(cheaperVariant)
}

export function isCustomizableProduct(product: HttpTypes.StoreProduct): boolean {
  return (
    Boolean(studioPieceForHandle(product.handle)) ||
    isCustomizable((product.metadata?.customization_level as string) ?? "none")
  )
}
