import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { PRODUCTION_WORKFLOW } from "../../../../../modules/production-workflow"
import type ProductionWorkflowService from "../../../../../modules/production-workflow/service"

const StatusSchema = z.object({
  status: z.enum([
    "pending_design_approval",
    "design_approved",
    "queued",
    "in_production",
    "quality_check",
    "packed",
    "completed",
    "on_hold",
    "cancelled",
  ]),
  note: z.string().max(1000).optional(),
  assigned_workshop: z.string().optional(),
})

/**
 * PUT /admin/production-jobs/:id/status — validated status transition; emits a
 * status-change event that drives customer notifications (API 05.3).
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const parsed = StatusSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid status payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const service = req.scope.resolve<ProductionWorkflowService>(PRODUCTION_WORKFLOW)
  const actorId =
    (req as unknown as { auth_context?: { actor_id?: string } }).auth_context?.actor_id ?? null

  try {
    const production_job = await service.transition(req.params.id, parsed.data.status, {
      note: parsed.data.note,
      authorId: actorId,
      assignedWorkshop: parsed.data.assigned_workshop,
    })

    const eventBus = req.scope.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: "production.status_changed",
      data: { job_id: production_job.id, order_id: production_job.order_id, status: parsed.data.status },
    })
    if (parsed.data.status === "in_production") {
      await eventBus.emit({ name: "production.started", data: { job_id: production_job.id } })
    }
    if (parsed.data.status === "completed") {
      await eventBus.emit({ name: "production.completed", data: { job_id: production_job.id } })
    }

    res.json({ production_job })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "CONFLICT") {
      return res.status(409).json({ error: { code: "CONFLICT", message: err.message } })
    }
    throw e
  }
}
