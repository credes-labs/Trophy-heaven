import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Sends an order confirmation on `order.placed` (FR-ORD-9). In Phase 5 this is
 * extended with per-status notifications through the Resend/MSG91 providers; for
 * now it dispatches through the configured notification module.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const orderModule = container.resolve(Modules.ORDER)
  const notificationModule = container.resolve(Modules.NOTIFICATION)

  const order = await orderModule.retrieveOrder(data.id, {
    relations: ["items", "shipping_address"],
  })

  if (!order.email) {
    logger.warn(`order.placed: order ${data.id} has no email; skipping confirmation`)
    return
  }

  await notificationModule.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-placed",
    data: {
      order_id: order.display_id ?? order.id,
      items: order.items?.map((i) => ({ title: i.title, quantity: i.quantity })) ?? [],
      total: order.total,
      currency_code: order.currency_code,
    },
  })

  logger.info(`order.placed: confirmation queued for order ${order.display_id ?? order.id}`)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
