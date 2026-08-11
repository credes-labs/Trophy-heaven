import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { TROPHY_CUSTOMIZATION } from "../modules/trophy-customization"
import type DesignService from "../modules/trophy-customization/service"

/**
 * Notifies the customer when their design is rejected with feedback so they can
 * revise it (FR-NOTIF-3, FR-PROD-2). Approval simply advances the job silently.
 */
export default async function designRejectedNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ design_id: string; feedback: string }>) {
  const logger = container.resolve("logger")
  const designs = container.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const customerModule = container.resolve(Modules.CUSTOMER)
  const notif = container.resolve(Modules.NOTIFICATION)

  const design = await designs.retrieveDesign(data.design_id).catch(() => null)
  if (!design?.customer_id) return

  const customer = await customerModule.retrieveCustomer(design.customer_id).catch(() => null)
  if (!customer?.email) return

  await notif.createNotifications({
    to: customer.email,
    channel: "email",
    template: "design-rejected",
    data: { design_name: design.name, feedback: data.feedback },
  })
  logger.info(`design.rejected: feedback sent to ${customer.email}`)
}

export const config: SubscriberConfig = {
  event: "design.rejected",
}
