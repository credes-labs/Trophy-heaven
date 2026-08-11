import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCTION_WORKFLOW } from "../modules/production-workflow"
import type ProductionWorkflowService from "../modules/production-workflow/service"
import { TROPHY_CUSTOMIZATION } from "../modules/trophy-customization"
import type DesignService from "../modules/trophy-customization/service"

/**
 * On `design.approved`, advance the associated production job(s) from
 * `pending_design_approval` → `design_approved` → `queued` and mark the design
 * approved (docs/kit/03 §3.3, FR-PROD-3).
 */
export default async function designApprovedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ design_id: string }>) {
  const logger = container.resolve("logger")
  const production = container.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const designs = container.resolve<DesignService>(TROPHY_CUSTOMIZATION)

  await designs.updateDesigns({ id: data.design_id, status: "approved" }).catch(() => null)
  const advanced = await production.advanceOnDesignApproved(data.design_id)
  logger.info(`design.approved: advanced ${advanced.length} job(s) for design ${data.design_id}`)
}

export const config: SubscriberConfig = {
  event: "design.approved",
}
