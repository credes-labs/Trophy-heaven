import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules, ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"

/**
 * Seeds the Legacy Crafts catalog: regions (India/INR + International/USD), the
 * category hierarchy from FR-CAT-1, product types, a stock location, fulfillment
 * set + shipping options, inventory stock levels, and sample products (standard
 * + customizable). Safe to re-run — guarded by existence checks.
 */
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const storeModule = container.resolve(Modules.STORE)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const regionModule = container.resolve(Modules.REGION)

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
  let regions = await regionModule.listRegions({}, { take: 10 })
  if (regions.length === 0) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries: ["in"],
            payment_providers: ["pp_system_default"],
          },
          {
            name: "International",
            currency_code: "usd",
            countries: ["us", "gb", "ca", "au", "ae", "sg"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    regions = result
  }
  const indiaRegion = regions.find((r) => r.currency_code === "inr") ?? regions[0]
  const intlRegion = regions.find((r) => r.currency_code === "usd") ?? regions[0]

  // ── Stock location + shipping profile ────────────────────────────────────────
  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  let stockLocation = existingLocations.find((l: { name: string }) => l.name === "Legacy Crafts Workshop")
  if (!stockLocation) {
    const { result: stockLocations } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Legacy Crafts Workshop",
            address: { city: "Bengaluru", country_code: "IN", address_1: "Workshop Rd" },
          },
        ],
      },
    })
    stockLocation = stockLocations[0]
  }

  await linkSalesChannelsToStockLocationWorkflow(container)
    .run({ input: { id: stockLocation.id, add: [defaultSalesChannel.id] } })
    .catch(() => undefined)

  // Link the manual fulfillment provider to the stock location (idempotent).
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })
  } catch {
    // already linked
  }

  let shippingProfiles = await fulfillmentModule.listShippingProfiles({ type: "default" })
  if (!shippingProfiles.length) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default", type: "default" }] },
    })
    shippingProfiles = result
  }
  const shippingProfile = shippingProfiles[0]

  // ── Fulfillment set + service zone + shipping options ───────────────────────
  let fulfillmentSets = await fulfillmentModule.listFulfillmentSets(
    { name: "Legacy Crafts Workshop delivery" },
    { relations: ["service_zones"] }
  )
  let fulfillmentSet = fulfillmentSets[0]
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
      name: "Legacy Crafts Workshop delivery",
      type: "shipping",
      service_zones: [
        {
          name: "India + International",
          geo_zones: [
            { country_code: "in", type: "country" },
            { country_code: "us", type: "country" },
            { country_code: "gb", type: "country" },
            { country_code: "ca", type: "country" },
            { country_code: "au", type: "country" },
            { country_code: "ae", type: "country" },
            { country_code: "sg", type: "country" },
          ],
        },
      ],
    })
  }

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })
  } catch {
    // already linked
  }

  // Reload with service zones in case we just created it.
  fulfillmentSets = await fulfillmentModule.listFulfillmentSets(
    { id: fulfillmentSet.id },
    { relations: ["service_zones"] }
  )
  fulfillmentSet = fulfillmentSets[0]
  const serviceZoneId = fulfillmentSet.service_zones?.[0]?.id

  const existingOptions = await fulfillmentModule.listShippingOptions({}, { take: 10 })
  if (serviceZoneId && existingOptions.length === 0) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Ship in 3–5 business days.",
            code: "standard",
          },
          prices: [
            { currency_code: "inr", amount: 9900 },
            { currency_code: "usd", amount: 999 },
            { region_id: indiaRegion.id, amount: 9900 },
            { region_id: intlRegion.id, amount: 999 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Ship in 1–2 business days.",
            code: "express",
          },
          prices: [
            { currency_code: "inr", amount: 24900 },
            { currency_code: "usd", amount: 1999 },
            { region_id: indiaRegion.id, amount: 24900 },
            { region_id: intlRegion.id, amount: 1999 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })
    logger.info("Created Standard + Express shipping options.")
  } else {
    logger.info(`Shipping options already present (${existingOptions.length}); skipping.`)
  }

  // ── Category hierarchy (FR-CAT-1) ─────────────────────────────────────────────
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "parent_category_id"],
  })
  const categoryByName: Record<string, string> = Object.fromEntries(
    existingCategories.map((c: { name: string; id: string }) => [c.name, c.id])
  )

  if (!categoryByName["Trophies"]) {
    const topLevel = ["Trophies", "Furniture", "Home Decor", "Gift Sets"]
    const { result: parents } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: topLevel.map((name) => ({ name, is_active: true })) },
    })
    for (const c of parents) categoryByName[c.name] = c.id

    const children: Record<string, string[]> = {
      Trophies: ["Sports", "Corporate", "Academic", "Memorial", "Acrylic", "Crystal", "Metal"],
      Furniture: ["Tables", "Chairs", "Shelves", "Cabinets", "Stools"],
      "Home Decor": ["Vases", "Wall Art", "Lamps", "Mirrors", "Clocks", "Planters"],
    }
    const childInput = Object.entries(children).flatMap(([parent, subs]) =>
      subs.map((name) => ({ name, parent_category_id: categoryByName[parent], is_active: true }))
    )
    const { result: subCategories } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: childInput },
    })
    for (const c of subCategories) categoryByName[c.name] = c.id
  }

  // ── Publishable API key linked to the sales channel ──────────────────────────
  const { result: apiKeys } = await createApiKeysWorkflow(container)
    .run({
      input: { api_keys: [{ title: "Storefront", type: "publishable", created_by: "seed" }] },
    })
    .catch(async () => {
      const keys = await query.graph({ entity: "api_key", fields: ["id", "token", "type"] })
      return { result: keys.data.filter((k: { type: string }) => k.type === "publishable") }
    })
  if (apiKeys[0]) {
    await linkSalesChannelsToApiKeyWorkflow(container)
      .run({ input: { id: apiKeys[0].id, add: [defaultSalesChannel.id] } })
      .catch(() => undefined)
    logger.info(`Publishable API key: ${(apiKeys[0] as { token?: string }).token ?? apiKeys[0].id}`)
  }

  // ── Sample products (skip if already seeded) ─────────────────────────────────
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  })
  const productTitles = new Set(existingProducts.map((p: { title: string }) => p.title))

  const sizes = [
    { label: 'S (6")', token: "6IN" },
    { label: 'M (8")', token: "8IN" },
    { label: 'L (10")', token: "10IN" },
    { label: 'XL (12")', token: "12IN" },
  ]

  const productsToCreate = []

  if (!productTitles.has("Crystal Star Award")) {
    productsToCreate.push({
      title: "Crystal Star Award",
      status: ProductStatus.PUBLISHED,
      category_ids: [categoryByName["Crystal"], categoryByName["Corporate"]].filter(Boolean),
      description: "Fully customizable crystal star trophy with 2D + 3D preview.",
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        customization_level: "full_3d",
        material: "crystal",
        occasion: "corporate",
        shape: "star",
      },
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
    })
  }

  if (!productTitles.has("Engraved Wooden Plaque")) {
    productsToCreate.push({
      title: "Engraved Wooden Plaque",
      status: ProductStatus.PUBLISHED,
      category_ids: [categoryByName["Academic"]].filter(Boolean),
      description: "Text-engravable wooden plaque for academic awards.",
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        customization_level: "text_only",
        material: "wood",
        occasion: "academic",
        shape: "plaque",
      },
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
    })
  }

  if (!productTitles.has("Oak Side Table")) {
    productsToCreate.push({
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
    })
  }

  if (productsToCreate.length) {
    await createProductsWorkflow(container).run({ input: { products: productsToCreate } })
    logger.info(`Created ${productsToCreate.length} sample product(s).`)
  } else {
    logger.info("Sample products already present; skipping product create.")
  }

  // ── Inventory levels at the workshop (so manage_inventory variants sell) ────
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })
  const { data: inventoryLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
  })
  const stocked = new Set(
    inventoryLevels.map((l: { inventory_item_id: string; location_id: string }) =>
      `${l.inventory_item_id}:${l.location_id}`
    )
  )
  const levelsToCreate = inventoryItems
    .filter((item: { id: string }) => !stocked.has(`${item.id}:${stockLocation.id}`))
    .map((item: { id: string }) => ({
      inventory_item_id: item.id,
      location_id: stockLocation.id,
      stocked_quantity: 1000,
    }))

  if (levelsToCreate.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: levelsToCreate },
    })
    logger.info(`Stocked ${levelsToCreate.length} inventory item(s) at the workshop.`)
  } else {
    logger.info("Inventory levels already stocked; skipping.")
  }

  // ── Link every product to the default shipping profile (required for checkout)
  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: ["id", "shipping_profile.id"],
  })
  for (const product of allProducts) {
    const already = (product as { shipping_profile?: { id?: string } }).shipping_profile?.id
    if (already) continue
    try {
      await link.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.FULFILLMENT]: { shipping_profile_id: shippingProfile.id },
      })
    } catch {
      // already linked
    }
  }
  logger.info("Ensured products are linked to the default shipping profile.")

  logger.info("Seed complete.")
}
