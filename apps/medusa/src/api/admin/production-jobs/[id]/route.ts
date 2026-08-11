import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCTION_WORKFLOW } from "../../../../modules/production-workflow"
import type ProductionWorkflowService from "../../../../modules/production-workflow/service"

/** GET /admin/production-jobs/:id — job detail (API 05.3). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const production_job = await service.retrieveProductionJob(req.params.id).catch(() => null)
  if (!production_job) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Production job not found." } })
  }
  res.json({ production_job })
}
