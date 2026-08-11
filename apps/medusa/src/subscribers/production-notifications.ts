import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Sends a customer notification when a production job changes status
 * (FR-NOTIF-3). Routed through the configured Resend/MSG91 providers, falling
 * back to the local provider in dev.
 */
export default async function productionStatusNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ job_id: string; order_id: string; status: string }>) {
  const logger = container.resolve("logger")
  const orderModule = container.resolve(Modules.ORDER)
  const notif = container.resolve(Modules.NOTIFICATION)

  const order = await orderModule.retrieveOrder(data.order_id).catch(() => null)
  if (!order?.email) return

  const readable = data.status.replace(/_/g, " ")
  await notif.createNotifications({
    to: order.email,
    channel: "email",
    template: "production-status",
    data: {
      order_id: order.display_id ?? order.id,
      status: readable,
    },
  })
  logger.info(`production.status_changed: notified ${order.email} (${readable})`)
}

export const config: SubscriberConfig = {
  event: "production.status_changed",
}
