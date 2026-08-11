import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCTION_WORKFLOW } from "../../../../../modules/production-workflow"
import type ProductionWorkflowService from "../../../../../modules/production-workflow/service"
import { createShipment } from "../../../../../lib/shipping"

/**
 * POST /admin/production-jobs/:id/ship — create a shipping label + tracking for a
 * packed job and transition it toward completion (FR-SHIP-1).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const logger = req.scope.resolve("logger")
  const job = await service.retrieveProductionJob(req.params.id).catch(() => null)
  if (!job) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Production job not found." } })
  }
  if (job.status !== "packed") {
    return res.status(409).json({ error: { code: "CONFLICT", message: "Job must be packed before shipping." } })
  }

  const shipment = await createShipment({ orderId: job.order_id }, logger)
  const production_job = await service.updateProductionJobs({
    id: job.id,
    tracking_number: shipment.tracking_number,
    shipping_carrier: shipment.carrier,
  })

  const eventBus = req.scope.resolve(Modules.EVENT_BUS)
  await eventBus.emit({
    name: "production.status_changed",
    data: { job_id: job.id, order_id: job.order_id, status: "shipped" },
  })

  res.json({ production_job, shipment })
}
