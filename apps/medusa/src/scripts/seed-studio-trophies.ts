import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createInventoryLevelsWorkflow, createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { trophyCollectionProducts, STUDIO_HANDLES } from "./trophy-collection"

/** Idempotent addition of the two studio awards to an already seeded local catalogue. */
export default async function seedStudioTrophies({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const [channels, categories, profiles, locations, existing] = await Promise.all([
    query.graph({ entity: "sales_channel", fields: ["id"] }),
    query.graph({ entity: "product_category", fields: ["id", "name"] }),
    query.graph({ entity: "shipping_profile", fields: ["id", "type"] }),
    query.graph({ entity: "stock_location", fields: ["id"] }),
    query.graph({ entity: "product", fields: ["id", "handle"] }),
  ])
  const channel = channels.data[0]
  const profile = profiles.data.find((p) => p.type === "default") ?? profiles.data[0]
  const location = locations.data[0]
  if (!channel || !profile || !location)
    throw new Error("Run the base catalogue seed before adding studio trophies.")
  const handles = new Set(existing.data.map((p) => p.handle))
  const products = trophyCollectionProducts({
    salesChannelId: channel.id,
    categoryByName: Object.fromEntries(categories.data.map((c) => [c.name, c.id])),
    storefrontUrl: process.env.STOREFRONT_URL ?? "http://localhost:3000",
  }).filter((p) => p.handle && !handles.has(p.handle))
  if (products.length) {
    await createProductsWorkflow(container).run({
      input: { products: products.map((p) => ({ ...p, shipping_profile_id: profile.id })) },
    })
  }
  const { data: awards } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata", "variants.inventory_items.inventory_item_id"],
    filters: { handle: STUDIO_HANDLES },
  })
  const productModule = container.resolve(Modules.PRODUCT)
  for (const award of awards)
    await productModule.updateProducts(award.id, {
      metadata: {
        ...award.metadata,
        customization_level: "full_3d",
        collection: "trophy",
        material: "brass",
      },
    })
  const itemIds = new Set(
    awards.flatMap(
      (p) =>
        p.variants?.flatMap((v) => v.inventory_items?.map((i) => i?.inventory_item_id) ?? []) ?? []
    )
  )
  const { data: levels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id", "location_id"],
  })
  const stocked = new Set(
    levels.filter((l) => l.location_id === location.id).map((l) => l.inventory_item_id)
  )
  const missing = [...itemIds].filter(
    (id): id is string => typeof id === "string" && !stocked.has(id)
  )
  if (missing.length)
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: missing.map((id) => ({
          inventory_item_id: id,
          location_id: location.id,
          stocked_quantity: 1000,
        })),
      },
    })
  logger.info(
    `Studio awards: created ${products.length}; stocked ${missing.length} item(s) using the local seed quantity.`
  )
}
