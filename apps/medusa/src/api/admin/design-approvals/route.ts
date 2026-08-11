import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCTION_WORKFLOW } from "../../../modules/production-workflow"
import type ProductionWorkflowService from "../../../modules/production-workflow/service"

/** GET /admin/design-approvals — list approvals (defaults to pending). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const { status = "pending", limit = "50", offset = "0" } = req.query as Record<string, string>

  const filters: Record<string, unknown> = {}
  if (status && status !== "all") filters.status = status

  const [design_approvals, count] = await service.listAndCountDesignApprovals(filters, {
    take: Number(limit),
    skip: Number(offset),
    order: { created_at: "DESC" },
  })

  res.json({ design_approvals, count })
}
