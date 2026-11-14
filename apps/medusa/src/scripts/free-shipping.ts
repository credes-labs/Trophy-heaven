import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

/** Matches the storefront promise "Free shipping on orders above ₹5,000". */
export const FREE_SHIPPING_MIN_INR = 5000

/**
 * Makes Standard Shipping free in India once the cart's item total reaches ₹5,000,
 * by adding a ₹0 price with an `item_total >= 5000` rule beside the flat ₹99 one
 * (Medusa picks the price whose rules match most specifically). Idempotent.
 *
 *   npx medusa exec ./src/scripts/free-shipping.ts
 */
export default async function freeShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const regionModule = container.resolve(Modules.REGION)

  const [india] = await regionModule.listRegions({ name: "India" })
  if (!india) {
    logger.warn("free-shipping: no India region; nothing to do")
    return
  }

  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "prices.id", "prices.amount", "prices.currency_code", "prices.price_rules.*"],
    filters: { name: "Standard Shipping" },
  })
  const standard = options[0] as
    | {
        id: string
        prices?: Array<{
          id: string
          amount: number
          currency_code: string
          price_rules?: Array<{ attribute: string; operator?: string; value: string }>
        }>
      }
    | undefined
  if (!standard) {
    logger.warn("free-shipping: no Standard Shipping option; nothing to do")
    return
  }

  const prices = standard.prices ?? []
  const already = prices.some((p) => p.price_rules?.some((r) => r.attribute === "item_total"))
  if (already) {
    logger.info("free-shipping: Standard Shipping already has an item_total price; skipping")
    return
  }

  await updateShippingOptionsWorkflow(container).run({
    input: [
      {
        id: standard.id,
        prices: [
          ...prices.map((p) => ({ id: p.id })),
          {
            region_id: india.id,
            amount: 0,
            rules: [{ attribute: "item_total", operator: "gte", value: FREE_SHIPPING_MIN_INR }],
          },
        ],
      },
    ],
  })
  logger.info(`free-shipping: Standard Shipping is free in India from ₹${FREE_SHIPPING_MIN_INR}`)
}
