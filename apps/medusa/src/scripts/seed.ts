import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules, ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO, ExecArgs } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"
import { homepageFurnitureProducts } from "./homepage-furniture"

// Medusa's default local file provider won't serve the storefront assets, so in
// dev we point product imagery at the storefront origin (see
// apps/storefront/public/images/manifest.json).
const STOREFRONT_URL = process.env.STOREFRONT_URL ?? "http://localhost:3000"
const productImage = (file: string) => `${STOREFRONT_URL}/images/products/${file}`

/** Soft-deleted on each seed so they do not return in admin / store. */
const RETIRED_SAMPLE_HANDLES = new Set([
  "crystal-star-award",
  "champion-metal-cup",
  "acrylic-award-plaque",
  "walnut-dining-chair",
  "teak-wall-shelf",
  "handmade-ceramic-vase",
])

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
            payment_providers: ["pp_razorpay_razorpay", "pp_system_default"],
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
  try {
    await regionModule.updateRegions(indiaRegion.id, {
      payment_providers: ["pp_razorpay_razorpay", "pp_system_default"],
    } as never)
  } catch (e) {
    logger.warn(`Could not attach Razorpay to India region: ${(e as Error).message}`)
  }

  // ── Stock location + shipping profile ────────────────────────────────────────
  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  let stockLocation: { id: string; name: string } | undefined = existingLocations.find(
    (l: { name: string }) => l.name === "Legacy Crafts Workshop"
  )
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
  if (!stockLocation) {
    throw new Error("Failed to find or create the Legacy Crafts Workshop stock location.")
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
            { currency_code: "inr", amount: 99 },
            { currency_code: "usd", amount: 10 },
            { region_id: indiaRegion.id, amount: 99 },
            { region_id: intlRegion.id, amount: 10 },
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
            { currency_code: "inr", amount: 249 },
            { currency_code: "usd", amount: 20 },
            { region_id: indiaRegion.id, amount: 249 },
            { region_id: intlRegion.id, amount: 20 },
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
    fields: ["id", "title", "handle"],
    pagination: { skip: 0, take: 500 },
  })
  const retiredIds = existingProducts
    .filter((p: { handle?: string | null }) => {
      const handle = p.handle ?? ""
      return handle.startsWith("catalog-trophy-") || RETIRED_SAMPLE_HANDLES.has(handle)
    })
    .map((p: { id: string }) => p.id)
  if (retiredIds.length) {
    const { data: retiredVariants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "product_id"],
      filters: { product_id: retiredIds },
    })
    const retiredVariantIds = (
      retiredVariants as Array<{ id: string }>
    ).map((variant) => variant.id)
    const { data: invLinks } = retiredVariantIds.length
      ? await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["inventory_item_id", "variant_id"],
          filters: { variant_id: retiredVariantIds },
        })
      : { data: [] }
    const retiredInv = new Set(
      (invLinks as Array<{ inventory_item_id: string }>).map(
        (link) => link.inventory_item_id,
      ),
    )
    const { data: reservations } = await query.graph({
      entity: "reservation_item",
      fields: ["id", "inventory_item_id"],
    })
    const reservationIds = (
      reservations as Array<{ id: string; inventory_item_id: string }>
    )
      .filter((row) => retiredInv.has(row.inventory_item_id))
      .map((row) => row.id)
    if (reservationIds.length) {
      const inventory = container.resolve(Modules.INVENTORY) as {
        deleteReservationItems: (ids: string[]) => Promise<unknown>
      }
      await inventory.deleteReservationItems(reservationIds)
      logger.info(`Cleared ${reservationIds.length} inventory reservation(s) on retired SKUs.`)
    }
    const { data: levels } = await query.graph({
      entity: "inventory_level",
      fields: ["id", "inventory_item_id", "location_id", "reserved_quantity"],
    })
    const inventory = container.resolve(Modules.INVENTORY) as {
      updateInventoryLevels: (
        updates: Array<{
          id: string
          inventory_item_id: string
          location_id: string
          reserved_quantity: number
        }>,
      ) => Promise<unknown>
    }
    const levelUpdates = (
      levels as Array<{
        id: string
        inventory_item_id: string
        location_id: string
        reserved_quantity?: number
      }>
    )
      .filter((level) => retiredInv.has(level.inventory_item_id) && (level.reserved_quantity ?? 0) > 0)
      .map((level) => ({
        id: level.id,
        inventory_item_id: level.inventory_item_id,
        location_id: level.location_id,
        reserved_quantity: 0,
      }))
    if (levelUpdates.length) {
      await inventory.updateInventoryLevels(levelUpdates)
      logger.info(`Zeroed reserved quantity on ${levelUpdates.length} inventory level(s).`)
    }
    await deleteProductsWorkflow(container).run({ input: { ids: retiredIds } })
    logger.info(`Removed ${retiredIds.length} retired catalog product(s).`)
  }
  const liveProducts = existingProducts.filter(
    (p: { id: string }) => !retiredIds.includes(p.id),
  )
  const productTitles = new Set(liveProducts.map((p: { title: string }) => p.title))
  const productHandles = new Set(
    liveProducts
      .map((p: { handle?: string | null }) => p.handle)
      .filter((handle: string | null | undefined): handle is string => Boolean(handle)),
  )

  const sizes = [
    { label: 'S (6")', token: "6IN" },
    { label: 'M (8")', token: "8IN" },
    { label: 'L (10")', token: "10IN" },
    { label: 'XL (12")', token: "12IN" },
  ]

  const productsToCreate: CreateProductWorkflowInputDTO[] = []

  if (!productTitles.has("Engraved Wooden Plaque")) {
    productsToCreate.push({
      title: "Engraved Wooden Plaque",
      handle: "engraved-wooden-plaque",
      status: ProductStatus.PUBLISHED,
      category_ids: [categoryByName["Academic"]].filter(Boolean),
      description: "Text-engravable wooden plaque for academic awards.",
      thumbnail: productImage("furniture-oak-table.jpg"),
      images: [{ url: productImage("furniture-oak-table.jpg") }],
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
          { amount: 899, currency_code: "inr" },
          { amount: 1299, currency_code: "usd" },
        ],
        manage_inventory: true,
      })),
    })
  }

  if (!productTitles.has("Oak Side Table")) {
    productsToCreate.push({
      title: "Oak Side Table",
      handle: "oak-side-table",
      status: ProductStatus.PUBLISHED,
      category_ids: [categoryByName["Tables"]].filter(Boolean),
      description: "Solid oak side table — a standard (non-customizable) catalog product.",
      thumbnail: productImage("furniture-oak-table.jpg"),
      images: [
        { url: productImage("furniture-oak-table.jpg") },
        { url: productImage("furniture-walnut-chair.jpg") },
        { url: productImage("furniture-teak-shelf.jpg") },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { customization_level: "none", material: "oak" },
      options: [{ title: "Finish", values: ["Natural", "Walnut"] }],
      variants: ["Natural", "Walnut"].map((finish) => ({
        title: `Oak Side Table — ${finish}`,
        sku: generateSku({ category: "Furn", shape: "Table", material: "Oak", size: finish }),
        options: { Finish: finish },
        prices: [
          { amount: 12999, currency_code: "inr" },
          { amount: 17900, currency_code: "usd" },
        ],
        manage_inventory: true,
      })),
    })
  }

  if (!productTitles.has("Brass Table Lamp")) {
    productsToCreate.push({
      title: "Brass Table Lamp",
      handle: "brass-table-lamp",
      status: ProductStatus.PUBLISHED,
      category_ids: [categoryByName["Lamps"]].filter(Boolean),
      description: "Brass table lamp with a warm metallic patina, hand-polished in our workshop.",
      thumbnail: productImage("art-brass-lamp.jpg"),
      images: [{ url: productImage("art-brass-lamp.jpg") }],
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { customization_level: "none", material: "brass" },
      options: [{ title: "Shade", values: ["Ivory Linen", "Charcoal Linen"] }],
      variants: ["Ivory Linen", "Charcoal Linen"].map((shade) => ({
        title: `Brass Table Lamp — ${shade}`,
        sku: generateSku({ category: "Deco", shape: "Lamp", material: "Brass", size: shade }),
        options: { Shade: shade },
        prices: [
          { amount: 3999, currency_code: "inr" },
          { amount: 55, currency_code: "usd" },
        ],
        manage_inventory: true,
      })),
    })
  }

  if (!productTitles.has("Handwoven Wall Textile")) {
    productsToCreate.push({
      title: "Handwoven Wall Textile",
      handle: "handwoven-wall-textile",
      status: ProductStatus.PUBLISHED,
      category_ids: [categoryByName["Wall Art"]].filter(Boolean),
      description: "Handwoven wall textile in olive and brass tones — a quiet statement piece.",
      thumbnail: productImage("art-wall-textile.jpg"),
      images: [{ url: productImage("art-wall-textile.jpg") }],
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: { customization_level: "none", material: "cotton" },
      options: [{ title: "Size", values: ["90 × 120 cm", "120 × 180 cm"] }],
      variants: ["90 × 120 cm", "120 × 180 cm"].map((size) => ({
        title: `Wall Textile — ${size}`,
        sku: generateSku({ category: "Deco", shape: "Textile", material: "Cotton", size }),
        options: { Size: size },
        prices: [
          { amount: 5999, currency_code: "inr" },
          { amount: 83, currency_code: "usd" },
        ],
        manage_inventory: true,
      })),
    })
  }

  const homepageFurniture = homepageFurnitureProducts({
    salesChannelId: defaultSalesChannel.id,
    categoryByName,
    storefrontUrl: STOREFRONT_URL,
  }).filter(
    (product) =>
      !productTitles.has(product.title) &&
      !(product.handle && productHandles.has(product.handle)),
  )
  productsToCreate.push(...homepageFurniture)

  if (productsToCreate.length) {
    await createProductsWorkflow(container).run({ input: { products: productsToCreate } })
    logger.info(`Created ${productsToCreate.length} sample product(s).`)
  } else {
    logger.info("Sample products already present; skipping product create.")
  }

  // ── Backfill imagery for products seeded before thumbnails were set ────────
  const imageByTitle: Record<string, string> = {
    "Engraved Wooden Plaque": "furniture-oak-table.jpg",
    "Oak Side Table": "furniture-oak-table.jpg",
    "Brass Table Lamp": "art-brass-lamp.jpg",
    "Handwoven Wall Textile": "art-wall-textile.jpg",
  }
  const productModule = container.resolve(Modules.PRODUCT)
  const { data: seededProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail"],
  })
  for (const p of seededProducts as Array<{ id: string; title: string; thumbnail?: string | null }>) {
    const file = imageByTitle[p.title]
    if (!file || p.thumbnail) continue
    const url = productImage(file)
    await productModule.updateProducts(p.id, { thumbnail: url, images: [{ url }] })
    logger.info(`Backfilled imagery for product: ${p.title}`)
  }

  // ── Multi-image PDP gallery (Oak Side Table) ───────────
  const multiImageByTitle: Record<string, string[]> = {
    "Oak Side Table": [
      "furniture-oak-table.jpg",
      "furniture-walnut-chair.jpg",
      "furniture-teak-shelf.jpg",
    ],
  }
  const { data: galleryProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail", "images.id", "images.url"],
  })
  for (const p of galleryProducts as Array<{
    id: string
    title: string
    thumbnail?: string | null
    images?: Array<{ id: string; url: string }>
  }>) {
    const files = multiImageByTitle[p.title]
    if (!files) continue
    const imageCount = p.images?.length ?? 0
    if (imageCount >= files.length) continue
    const urls = files.map((file) => productImage(file))
    await productModule.updateProducts(p.id, {
      thumbnail: urls[0],
      images: urls.map((url) => ({ url })),
    })
    logger.info(`Attached ${urls.length} gallery image(s) to: ${p.title}`)
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

  // ── Promotions (so coupon/promo flows work out of the box) ────────────────
  // Promotions without a campaign stay `draft` in Medusa v2, so each code is
  // created inside (or attached to) an active campaign window.
  const promotionModule = container.resolve(Modules.PROMOTION)
  const campaignWindow = {
    name: "Legacy Offers",
    campaign_identifier: "legacy-offers",
    description: "Storewide Legacy Crafts offers",
    starts_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  }
  const seedPromotions = [
    {
      code: "WELCOME10",
      type: "standard",
      application_method: {
        type: "percentage",
        target_type: "order",
        allocation: "across",
        value: 10,
      },
    },
    {
      code: "LEGACY500",
      type: "standard",
      application_method: {
        type: "fixed",
        target_type: "order",
        allocation: "across",
        value: 500,
        currency_code: "inr",
      },
    },
  ] as const
  for (const promo of seedPromotions) {
    const [existing] = await promotionModule.listPromotions(
      { code: promo.code },
      { relations: ["campaign"] }
    )
    if (existing) {
      if (!existing.campaign) {
        let [campaign] = await promotionModule.listCampaigns({
          campaign_identifier: [campaignWindow.campaign_identifier],
        })
        if (!campaign) {
          campaign = await promotionModule.createCampaigns(campaignWindow as never)
        }
        await promotionModule.addPromotionsToCampaign({
          id: campaign.id,
          promotion_ids: [existing.id],
        } as never)
        logger.info(`Attached promotion to campaign: ${promo.code}`)
      }
      if (existing.status !== "active") {
        await promotionModule.updatePromotions({ id: existing.id, status: "active" } as never)
        logger.info(`Activated promotion: ${promo.code}`)
      }
      continue
    }
    let [campaign] = await promotionModule.listCampaigns({
      campaign_identifier: [campaignWindow.campaign_identifier],
    })
    if (!campaign) {
      campaign = await promotionModule.createCampaigns(campaignWindow as never)
    }
    try {
      await promotionModule.createPromotions({
        ...promo,
        campaign_id: campaign.id,
        status: "active",
      } as never)
      logger.info(`Created promotion: ${promo.code}`)
    } catch {
      logger.info(`Promotion already present: ${promo.code}`)
    }
  }

  logger.info("Seed complete.")
}
