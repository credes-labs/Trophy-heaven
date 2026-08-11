import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCTION_WORKFLOW } from "../modules/production-workflow"
import type ProductionWorkflowService from "../modules/production-workflow/service"
import { TROPHY_CUSTOMIZATION } from "../modules/trophy-customization"
import type DesignService from "../modules/trophy-customization/service"
import { inferComplexity } from "../lib/production-routing"

/**
 * On `order.placed`, create a ProductionJob + pending DesignApproval for every
 * custom line item (one that references a `design_id` in its metadata). Jobs are
 * routed by complexity + material and start in `pending_design_approval`
 * (docs/kit/03 §3.3, API 05.3, FR-PROD-1).
 */
export default async function orderPlacedProductionHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const orderModule = container.resolve(Modules.ORDER)
  const production = container.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const designs = container.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const eventBus = container.resolve(Modules.EVENT_BUS)

  const order = await orderModule.retrieveOrder(data.id, { relations: ["items"] })

  for (const item of order.items ?? []) {
    const designId = (item.metadata?.design_id as string) || null
    if (!designId) continue

    const design = await designs.retrieveDesign(designId).catch(() => null)
    if (!design) {
      logger.warn(`order.placed: design ${designId} for line ${item.id} not found; skipping job`)
      continue
    }

    const complexity =
      (design.complexity as "simple" | "medium" | "complex" | null) ??
      inferComplexity(design.mode, design.state_json)
    const material =
      (item.metadata?.material as string) ||
      ((design.state_json as { materialOverlay?: string; material?: string })?.material ??
        (design.state_json as { materialOverlay?: string })?.materialOverlay ??
        "general")

    const job = await production.createRoutedJob({
      order_id: order.id,
      order_line_item_id: item.id,
      design_id: designId,
      complexity,
      material,
    })

    // Open a pending design approval and mark the design submitted for review.
    await production.createDesignApprovals({ design_id: designId, status: "pending" })
    await designs.updateDesigns({ id: designId, status: "submitted_for_review" })

    await eventBus.emit({ name: "design.submitted", data: { design_id: designId, job_id: job.id } })
    logger.info(`order.placed: production job ${job.id} created for design ${designId}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
