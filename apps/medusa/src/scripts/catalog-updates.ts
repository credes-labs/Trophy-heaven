import type { ExecArgs, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createAndLinkProductOptionsToProductWorkflow,
  createProductCategoriesWorkflow,
  createProductVariantsWorkflow,
  createProductsWorkflow,
  deleteProductVariantsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { WOODEN_PRICE_LIST, type WoodenItem, type WoodenSize } from "./data/wooden-price-list"

/**
 * One-off changes to an already seeded catalogue, applied by `bootstrap` once each and
 * recorded in the store's `metadata.catalog_updates`. Unlike the seed (which only creates
 * what is missing on a first run), an update may change existing products, so each one
 * must leave products the owner has since edited alone.
 */
export const CATALOG_UPDATES: Array<{ id: string; run: (container: MedusaContainer) => Promise<void> }> = [
  { id: "2026-11-25-wooden-price-list", run: applyWoodenPriceList },
]

export async function applyCatalogUpdates(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeModule = container.resolve(Modules.STORE)
  for (const update of CATALOG_UPDATES) {
    const [store] = await storeModule.listStores()
    const done = Array.isArray(store?.metadata?.catalog_updates)
      ? (store.metadata.catalog_updates as string[])
      : []
    if (!store || done.includes(update.id)) continue
    await update.run(container)
    await storeModule.updateStores(store.id, {
      metadata: { ...(store.metadata ?? {}), catalog_updates: [...done, update.id] },
    })
    logger.info(`catalog-updates: applied ${update.id}`)
  }
}

export default async function runCatalogUpdates({ container }: ExecArgs) {
  await applyCatalogUpdates(container)
}

const WOODEN_CATEGORY = "Wooden"
const IMAGE_ORIGIN = (process.env.STOREFRONT_URL ?? "http://localhost:3000").replace(/\/$/, "")

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

/** "A · 34 × 40 cm", "B · 29 cm", or just "C" when the sheet has no dimensions. */
export function sizeLabel(size: WoodenSize): string {
  const dims =
    size.width != null && size.height != null
      ? `${fmt(size.width)} × ${fmt(size.height)} cm`
      : size.height != null
        ? `${fmt(size.height)} cm`
        : null
  return dims ? `${size.code} · ${dims}` : size.code
}

export function woodenSku(item: WoodenItem, size: WoodenSize): string {
  return `TH-WOOD-${item.itemNo}-${size.code}`.toUpperCase().replace(/[^A-Z0-9-]/g, "")
}

function woodenVariants(item: WoodenItem) {
  return item.sizes.map((size) => ({
    title: `${item.title} — ${sizeLabel(size)}`,
    sku: woodenSku(item, size),
    options: { Size: sizeLabel(size) },
    ...(size.width != null ? { width: size.width } : {}),
    ...(size.height != null ? { height: size.height } : {}),
    metadata: { size_code: size.code, dimension_unit: "cm" },
    prices: [
      { amount: size.price, currency_code: "inr" },
      { amount: Math.max(1, Math.round(size.price / 85)), currency_code: "usd" },
    ],
    // Made to order: no stock count to run out.
    manage_inventory: false,
  }))
}

function woodenDescription(item: WoodenItem): string {
  const kind = /plaque|citation|stand|frame/i.test(item.title) ? "plaque" : "memento"
  return (
    `A wooden ${kind} from the workshop's own collection, finished by hand and ready for an ` +
    `engraved name, logo or citation. Available in ${item.sizes.length} size${item.sizes.length > 1 ? "s" : ""}. ` +
    `Item No. ${item.itemNo}.`
  )
}

/**
 * The owner's wooden price list: 63 new mementos and plaques, plus real sizes and prices
 * for the three wooden pieces already in the shop (4228, 4264, 4275) while they still
 * carry their single placeholder variant.
 */
async function applyWoodenPriceList(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const [{ data: categories }, { data: channels }, { data: profiles }, { data: products }] =
    await Promise.all([
      query.graph({ entity: "product_category", fields: ["id", "name"] }),
      query.graph({ entity: "sales_channel", fields: ["id", "name"] }),
      query.graph({ entity: "shipping_profile", fields: ["id", "type"] }),
      query.graph({
        entity: "product",
        fields: [
          "id",
          "handle",
          "variants.id",
          "variants.sku",
          "categories.id",
          "options.id",
          "options.title",
          "options.values.value",
        ],
        pagination: { skip: 0, take: 2000 },
      }),
    ])
  const categoryByName: Record<string, string> = Object.fromEntries(
    (categories as Array<{ id: string; name: string }>).map((c) => [c.name, c.id])
  )
  const channel =
    (channels as Array<{ id: string; name: string }>).find((c) => c.name === "Default Sales Channel") ??
    channels[0]
  const profile =
    (profiles as Array<{ id: string; type: string }>).find((p) => p.type === "default") ?? profiles[0]
  if (!channel || !profile || !categoryByName["Trophies"]) {
    logger.warn("catalog-updates: catalogue not seeded yet; wooden price list skipped")
    return
  }

  if (!categoryByName[WOODEN_CATEGORY]) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          { name: WOODEN_CATEGORY, parent_category_id: categoryByName["Trophies"], is_active: true },
        ],
      },
    })
    categoryByName[WOODEN_CATEGORY] = result[0].id
  }

  type Row = {
    id: string
    handle?: string | null
    variants?: Array<{ id: string; sku?: string | null } | null> | null
    categories?: Array<{ id: string } | null> | null
    options?: Array<{ id: string; title: string; values?: Array<{ value: string } | null> | null } | null> | null
  }
  const byHandle = new Map((products as Row[]).map((p) => [p.handle, p]))
  const categoryIds = (item: WoodenItem) =>
    [categoryByName[WOODEN_CATEGORY], categoryByName[item.category]].filter(Boolean) as string[]

  const toCreate = WOODEN_PRICE_LIST.filter((item) => !item.existing && !byHandle.has(item.handle))
  if (toCreate.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: toCreate.map((item) => {
          const url = `${IMAGE_ORIGIN}/images/collection/wooden/${item.handle}-1.webp`
          return {
            title: item.title,
            handle: item.handle,
            status: ProductStatus.PUBLISHED,
            description: woodenDescription(item),
            category_ids: categoryIds(item),
            thumbnail: url,
            images: [{ url }],
            sales_channels: [{ id: channel.id }],
            shipping_profile_id: profile.id,
            metadata: {
              item_no: item.itemNo,
              material: "wood",
              collection: "trophy",
              customization_level: "text_only",
            },
            options: [{ title: "Size", values: item.sizes.map(sizeLabel) }],
            variants: woodenVariants(item),
          }
        }),
      },
    })
  }

  // The three pieces seeded earlier with one "STD" placeholder variant get the real sizes.
  let resized = 0
  for (const item of WOODEN_PRICE_LIST.filter((i) => i.existing)) {
    const product = byHandle.get(item.handle)
    const skus = (product?.variants ?? []).map((v) => v?.sku ?? "")
    if (!product || skus.length !== 1 || !skus[0].endsWith("-STD")) continue
    const keep = (product.categories ?? []).map((c) => c?.id).filter(Boolean) as string[]
    const placeholder = product.variants?.[0]?.id as string
    // Every variant needs a value for every option, so new sizes keep the existing
    // single-value options (the seeded "Finish") and the placeholder goes last.
    const fixed = Object.fromEntries(
      (product.options ?? [])
        .filter((o): o is NonNullable<typeof o> => Boolean(o?.values?.[0]?.value))
        .map((o) => [o.title, o.values![0]!.value])
    )
    await createAndLinkProductOptionsToProductWorkflow(container).run({
      input: { product_id: product.id, add: [{ title: "Size", values: item.sizes.map(sizeLabel), is_exclusive: true }] },
    })
    await createProductVariantsWorkflow(container).run({
      input: {
        product_variants: woodenVariants(item).map((v) => ({
          ...v,
          product_id: product.id,
          options: { ...fixed, ...v.options },
        })),
      },
    })
    await deleteProductVariantsWorkflow(container).run({ input: { ids: [placeholder] } })
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: {
          category_ids: [...new Set([...keep, ...categoryIds(item)])],
          metadata: { item_no: item.itemNo, material: "wood", collection: "trophy", customization_level: "text_only" },
        },
      },
    })
    resized++
  }
  logger.info(
    `catalog-updates: wooden price list created ${toCreate.length} product(s), resized ${resized} existing`
  )
}
