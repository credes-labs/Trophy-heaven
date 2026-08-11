import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { PRODUCTION_WORKFLOW } from "../../../../../modules/production-workflow"
import type ProductionWorkflowService from "../../../../../modules/production-workflow/service"
import { TROPHY_CUSTOMIZATION } from "../../../../../modules/trophy-customization"
import type DesignService from "../../../../../modules/trophy-customization/service"

const RejectSchema = z.object({
  feedback: z.string().min(1, "Feedback is required."),
  annotated_image_url: z.string().url().optional(),
})

/** POST /admin/design-approvals/:id/reject — feedback required (API 05.3). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = RejectSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Feedback is required to reject a design.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const service = req.scope.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const designs = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const approval = await service.retrieveDesignApproval(req.params.id).catch(() => null)
  if (!approval) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Approval not found." } })
  }

  const reviewerId =
    (req as unknown as { auth_context?: { actor_id?: string } }).auth_context?.actor_id ?? null
  const design_approval = await service.reject(
    approval.id,
    reviewerId,
    parsed.data.feedback,
    parsed.data.annotated_image_url
  )
  const design = await designs.updateDesigns({
    id: approval.design_id,
    status: "rejected_with_feedback",
  })

  const eventBus = req.scope.resolve(Modules.EVENT_BUS)
  await eventBus.emit({
    name: "design.rejected",
    data: { design_id: approval.design_id, feedback: parsed.data.feedback },
  })

  res.json({ design_approval, design: { id: design.id, status: "rejected_with_feedback" } })
}
