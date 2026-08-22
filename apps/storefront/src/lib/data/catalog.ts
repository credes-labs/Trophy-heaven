import { medusa } from "../medusa"
import { getRegion } from "../regions"
import type { HttpTypes } from "@medusajs/types"

const PRODUCT_FIELDS =
  "*variants,*variants.calculated_price,*variants.options,*options,*options.values,*categories,*images,+metadata,+thumbnail,+variants.inventory_quantity"

/** List published products for a category page or PLP (RSC + ISR). */
export async function listProducts(params: {
  categoryId?: string
  categoryIds?: string[]
  limit?: number
  offset?: number
  q?: string
  order?: string
  countryCode?: string
}): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> {
  const region = await getRegion(params.countryCode)
  const categoryFilter =
    params.categoryIds && params.categoryIds.length
      ? params.categoryIds
      : params.categoryId
        ? [params.categoryId]
        : undefined
  const { products, count } = await medusa.store.product.list({
    limit: params.limit ?? 12,
    offset: params.offset ?? 0,
    q: params.q,
    order: params.order,
    region_id: region?.id,
    fields: PRODUCT_FIELDS,
    ...(categoryFilter ? { category_id: categoryFilter } : {}),
  })
  return { products, count }
}

/** Fetch a single product by handle for a PDP. */
export async function getProductByHandle(
  handle: string,
  countryCode?: string
): Promise<HttpTypes.StoreProduct | null> {
  const region = await getRegion(countryCode)
  const { products } = await medusa.store.product.list({
    handle,
    region_id: region?.id,
    fields: PRODUCT_FIELDS,
    limit: 1,
  })
  return products[0] ?? null
}

/** Fetch a single product by id (used by the customization engine routes). */
export async function getProductById(
  id: string,
  countryCode?: string
): Promise<HttpTypes.StoreProduct | null> {
  const region = await getRegion(countryCode)
  try {
    const { product } = await medusa.store.product.retrieve(id, {
      region_id: region?.id,
      fields: PRODUCT_FIELDS,
    })
    return product ?? null
  } catch {
    return null
  }
}

/** Total product count per category id set (filter sidebar counts). */
export async function countProductsByCategory(
  categoryIdsByKey: Record<string, string[]>,
  countryCode?: string
): Promise<Record<string, number>> {
  const region = await getRegion(countryCode)
  const entries = await Promise.all(
    Object.entries(categoryIdsByKey).map(async ([key, ids]) => {
      if (!ids.length) return [key, 0] as const
      const { count } = await medusa.store.product.list({
        category_id: ids,
        region_id: region?.id,
        fields: "id",
        limit: 1,
      })
      return [key, count] as const
    })
  )
  return Object.fromEntries(entries)
}

/** Category tree for navigation + category pages. */
export async function listCategories(): Promise<HttpTypes.StoreProductCategory[]> {
  const { product_categories } = await medusa.store.category.list({
    fields: "id,name,handle,parent_category_id,*category_children",
    limit: 100,
  })
  return product_categories
}

export async function getCategoryByHandle(
  handle: string
): Promise<HttpTypes.StoreProductCategory | null> {
  const { product_categories } = await medusa.store.category.list({
    handle,
    fields: "id,name,handle,description,parent_category_id,*category_children",
    limit: 1,
  })
  return product_categories[0] ?? null
}

/** Collect a category id plus all direct children (for parent PLPs). */
export function collectCategoryIds(
  category: HttpTypes.StoreProductCategory | null | undefined
): string[] {
  if (!category) return []
  return [category.id, ...(category.category_children?.map((c) => c.id) ?? [])]
}

/**
 * Client-safe product list (cart/shop filters). Uses the shared Medusa SDK;
 * region lookup is optional so calculated prices still resolve when available.
 */
export async function listProductsClient(params: {
  categoryId?: string
  categoryIds?: string[]
  ids?: string[]
  limit?: number
  offset?: number
  q?: string
  order?: string
  regionId?: string
}): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> {
  const categoryFilter =
    params.categoryIds && params.categoryIds.length
      ? params.categoryIds
      : params.categoryId
        ? [params.categoryId]
        : undefined
  const { products, count } = await medusa.store.product.list({
    limit: params.limit ?? 12,
    offset: params.offset ?? 0,
    q: params.q,
    order: params.order,
    region_id: params.regionId,
    fields: PRODUCT_FIELDS,
    ...(categoryFilter ? { category_id: categoryFilter } : {}),
    ...(params.ids?.length ? { id: params.ids } : {}),
  })
  return { products, count }
}
