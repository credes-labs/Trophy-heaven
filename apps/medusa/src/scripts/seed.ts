import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  createShippingProfilesWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules, ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"

/**
 * Seeds the Legacy Crafts catalog: regions (India/INR + International/USD), the
 * category hierarchy from FR-CAT-1, product types, a stock location, and a set
 * of sample products (standard + customizable) with variants, prices, and the
 * customization_level metadata (FR-CAT-5).
 */
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const storeModule = container.resolve(Modules.STORE)

  logger.info("Seeding Legacy Crafts catalog…")

  // ── Sales channel ──────────────────────────────────────────────────────────
  let [defaultSalesChannel] = await salesChannelModule.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!defaultSalesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    })
    defaultSalesChannel = result[0]
  }

  const [store] = await storeModule.listStores()
  if (store) {
    await storeModule.updateStores(store.id, {
      supported_currencies: [
        { currency_code: "inr", is_default: true },
        { currency_code: "usd" },
      ],
      default_sales_channel_id: defaultSalesChannel.id,
    })
  }

  // ── Regions ─────────────────────────────────────────────────────────────────
  await createRegionsWorkflow(container).run({
    input: {
      regions: [
        { name: "India", currency_code: "inr", countries: ["in"], payment_providers: ["pp_system_default"] },
        {
          name: "International",
          currency_code: "usd",
          countries: ["us", "gb", "ca", "au", "ae", "sg"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })

  // ── Stock location + shipping profile ────────────────────────────────────────
  const { result: stockLocations } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        { name: "Legacy Crafts Workshop", address: { city: "Bengaluru", country_code: "IN", address_1: "Workshop Rd" } },
      ],
    },
  })
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocations[0].id, add: [defaultSalesChannel.id] },
  })
  await createShippingProfilesWorkflow(container).run({
    input: { data: [{ name: "Default", type: "default" }] },
  }).catch(() => logger.info("Default shipping profile already exists"))

  // ── Category hierarchy (FR-CAT-1) ─────────────────────────────────────────────
  const topLevel = ["Trophies", "Furniture", "Home Decor", "Gift Sets"]
  const { result: parents } = await createProductCategoriesWorkflow(container).run({
    input: { product_categories: topLevel.map((name) => ({ name, is_active: true })) },
  })
  const parentByName = Object.fromEntries(parents.map((c) => [c.name, c.id]))

  const children: Record<string, string[]> = {
    Trophies: ["Sports", "Corporate", "Academic", "Memorial", "Acrylic", "Crystal", "Metal"],
    Furniture: ["Tables", "Chairs", "Shelves", "Cabinets", "Stools"],
    "Home Decor": ["Vases", "Wall Art", "Lamps", "Mirrors", "Clocks", "Planters"],
  }
  const childInput = Object.entries(children).flatMap(([parent, subs]) =>
    subs.map((name) => ({ name, parent_category_id: parentByName[parent], is_active: true }))
  )
  const { result: subCategories } = await createProductCategoriesWorkflow(container).run({
    input: { product_categories: childInput },
  })
  const categoryByName = {
    ...parentByName,
    ...Object.fromEntries(subCategories.map((c) => [c.name, c.id])),
  }

  // ── Publishable API key linked to the sales channel ──────────────────────────
  const { result: apiKeys } = await createApiKeysWorkflow(container).run({
    input: { api_keys: [{ title: "Storefront", type: "publishable", created_by: "seed" }] },
  }).catch(async () => {
    const keys = await query.graph({ entity: "api_key", fields: ["id", "token", "type"] })
    return { result: keys.data.filter((k: { type: string }) => k.type === "publishable") }
  })
  if (apiKeys[0]) {
    await linkSalesChannelsToApiKeyWorkflow(container)
      .run({ input: { id: apiKeys[0].id, add: [defaultSalesChannel.id] } })
      .catch(() => undefined)
    logger.info(`Publishable API key: ${(apiKeys[0] as { token?: string }).token ?? apiKeys[0].id}`)
  }

  // ── Sample products ───────────────────────────────────────────────────────────
  const sizes = [
    { label: "S (6\")", token: "6IN" },
    { label: "M (8\")", token: "8IN" },
    { label: "L (10\")", token: "10IN" },
    { label: "XL (12\")", token: "12IN" },
  ]

  const crystalStar = {
    title: "Crystal Star Award",
    status: ProductStatus.PUBLISHED,
    category_ids: [categoryByName["Crystal"], categoryByName["Corporate"]].filter(Boolean),
    description: "Fully customizable crystal star trophy with 2D + 3D preview.",
    sales_channels: [{ id: defaultSalesChannel.id }],
    metadata: { customization_level: "full_3d", material: "crystal", occasion: "corporate", shape: "star" },
    options: [
      { title: "Size", values: sizes.map((s) => s.label) },
      { title: "Material", values: ["Clear Crystal"] },
    ],
    variants: sizes.map((s) => ({
      title: `Crystal Star — ${s.label}`,
      sku: generateSku({ category: "Crystal", shape: "Star", material: "Crystal", size: s.token }),
      options: { Size: s.label, Material: "Clear Crystal" },
      prices: [
        { amount: 249900, currency_code: "inr" },
        { amount: 3499, currency_code: "usd" },
      ],
      manage_inventory: true,
    })),
  }

  const woodenPlaque = {
    title: "Engraved Wooden Plaque",
    status: ProductStatus.PUBLISHED,
    category_ids: [categoryByName["Academic"]].filter(Boolean),
    description: "Text-engravable wooden plaque for academic awards.",
    sales_channels: [{ id: defaultSalesChannel.id }],
    metadata: { customization_level: "text_only", material: "wood", occasion: "academic", shape: "plaque" },
    options: [{ title: "Size", values: [sizes[1].label, sizes[2].label] }],
    variants: [sizes[1], sizes[2]].map((s) => ({
      title: `Wooden Plaque — ${s.label}`,
      sku: generateSku({ category: "Acad", shape: "Plaque", material: "Wood", size: s.token }),
      options: { Size: s.label },
      prices: [
        { amount: 89900, currency_code: "inr" },
        { amount: 1299, currency_code: "usd" },
      ],
      manage_inventory: true,
    })),
  }

  const oakSideTable = {
    title: "Oak Side Table",
    status: ProductStatus.PUBLISHED,
    category_ids: [categoryByName["Tables"]].filter(Boolean),
    description: "Solid oak side table — a standard (non-customizable) catalog product.",
    sales_channels: [{ id: defaultSalesChannel.id }],
    metadata: { customization_level: "none", material: "oak" },
    options: [{ title: "Finish", values: ["Natural", "Walnut"] }],
    variants: ["Natural", "Walnut"].map((finish) => ({
      title: `Oak Side Table — ${finish}`,
      sku: generateSku({ category: "Furn", shape: "Table", material: "Oak", size: finish }),
      options: { Finish: finish },
      prices: [
        { amount: 1299900, currency_code: "inr" },
        { amount: 17900, currency_code: "usd" },
      ],
      manage_inventory: true,
    })),
  }

  await createProductsWorkflow(container).run({
    input: { products: [crystalStar, woodenPlaque, oakSideTable] },
  })

  logger.info("Seed complete: 4 top categories, sub-categories, 3 sample products.")
}
