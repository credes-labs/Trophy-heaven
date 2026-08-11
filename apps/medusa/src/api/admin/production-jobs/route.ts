import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCTION_WORKFLOW } from "../../../modules/production-workflow"
import type ProductionWorkflowService from "../../../modules/production-workflow/service"

/** GET /admin/production-jobs — list with filters (API 05.3). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const { status, workshop, complexity, material, limit = "50", offset = "0" } =
    req.query as Record<string, string>

  const filters: Record<string, unknown> = {}
  if (status) filters.status = status
  if (workshop) filters.assigned_workshop = workshop
  if (complexity) filters.complexity = complexity
  if (material) filters.material = material

  const [production_jobs, count] = await service.listAndCountProductionJobs(filters, {
    take: Number(limit),
    skip: Number(offset),
    order: { created_at: "DESC" },
  })

  res.json({ production_jobs, count })
}
