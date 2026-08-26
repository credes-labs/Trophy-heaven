import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { PRODUCTION_WORKFLOW } from "../../../../../modules/production-workflow"
import type ProductionWorkflowService from "../../../../../modules/production-workflow/service"
import { TROPHY_CUSTOMIZATION } from "../../../../../modules/trophy-customization"
import type DesignService from "../../../../../modules/trophy-customization/service"

const ApproveSchema = z.object({ note: z.string().max(1000).optional() })

/** POST /admin/design-approvals/:id/approve (API 05.3). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = ApproveSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid payload." } })
  }

  const service = req.scope.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const designs = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const approval = await service.retrieveDesignApproval(req.params.id).catch(() => null)
  if (!approval) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Approval not found." } })
  }

  const reviewerId =
    (req as unknown as { auth_context?: { actor_id?: string } }).auth_context?.actor_id ?? null
  try {
    const design_approval = await service.approve(approval.id, reviewerId, parsed.data.note)
    const design = await designs.updateDesigns({ id: approval.design_id, status: "approved" })

    const eventBus = req.scope.resolve(Modules.EVENT_BUS)
    await eventBus.emit({ name: "design.approved", data: { design_id: approval.design_id } })

    res.json({ design_approval, design: { id: design.id, status: "approved" } })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "CONFLICT") {
      return res.status(409).json({ error: { code: "CONFLICT", message: err.message } })
    }
    throw e
  }
}
