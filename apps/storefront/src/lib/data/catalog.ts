import { medusa } from "../medusa"
import { getRegion } from "../regions"
import type { HttpTypes } from "@medusajs/types"

const PRODUCT_FIELDS =
  "*variants,*variants.calculated_price,*variants.options,*options,*options.values,*categories,*images,+metadata,+thumbnail"

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
