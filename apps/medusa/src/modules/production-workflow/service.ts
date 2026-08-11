import { MedusaService } from "@medusajs/framework/utils"
import { ProductionJob } from "./models/production-job"
import { DesignApproval } from "./models/design-approval"
import {
  canTransition,
  routeWorkshop,
  slaDays,
  type Complexity,
  type ProductionJobStatus,
} from "../../lib/production-routing"

/**
 * ProductionWorkflowService — production jobs + design approvals (API 05.3,
 * FR-PROD-*). Encapsulates queue routing, status transitions, and approval
 * resolution; event emission + notifications are handled by the API routes and
 * subscribers that call these methods.
 */
class ProductionWorkflowService extends MedusaService({
  ProductionJob,
  DesignApproval,
}) {
  /** Create a job for a custom line item and route it to a workshop. */
  async createRoutedJob(input: {
    order_id: string
    order_line_item_id: string
    design_id: string
    complexity: Complexity
    material: string
  }) {
    const workshop = routeWorkshop(input.complexity, input.material)
    const eta = new Date(Date.now() + slaDays(input.complexity) * 24 * 60 * 60 * 1000)
    return this.createProductionJobs({
      order_id: input.order_id,
      order_line_item_id: input.order_line_item_id,
      design_id: input.design_id,
      complexity: input.complexity,
      material: input.material,
      assigned_workshop: workshop,
      estimated_completion: eta,
      status: "pending_design_approval",
      notes: [] as unknown as Record<string, unknown>,
    })
  }

  /** Apply a validated status transition, stamping timestamps + optional note. */
  async transition(
    jobId: string,
    to: ProductionJobStatus,
    opts: { note?: string; authorId?: string | null; assignedWorkshop?: string } = {}
  ) {
    const job = await this.retrieveProductionJob(jobId)
    const from = job.status as ProductionJobStatus
    if (!canTransition(from, to)) {
      const err = new Error(`Invalid transition ${from} → ${to}.`) as Error & { code?: string }
      err.code = "CONFLICT"
      throw err
    }

    const notes = Array.isArray(job.notes) ? [...(job.notes as unknown[])] : []
    if (opts.note) {
      notes.push({ author_id: opts.authorId ?? null, body: opts.note, at: new Date().toISOString() })
    }

    const patch: Record<string, unknown> = { id: jobId, status: to, notes }
    if (opts.assignedWorkshop) patch.assigned_workshop = opts.assignedWorkshop
    if (to === "in_production" && !job.started_at) patch.started_at = new Date()
    if (to === "completed") patch.completed_at = new Date()

    return this.updateProductionJobs(patch)
  }

  /** Advance a job once its design is approved (design.approved subscriber). */
  async advanceOnDesignApproved(designId: string) {
    const jobs = await this.listProductionJobs({
      design_id: designId,
      status: "pending_design_approval",
    })
    const updated: unknown[] = []
    for (const job of jobs) {
      updated.push(await this.transition(job.id, "design_approved", { note: "Design approved." }))
      await this.transition(job.id, "queued", { note: "Queued for production." })
    }
    return updated
  }

  /** Approve a design review (API 05.3). */
  async approve(approvalId: string, reviewerId: string | null, note?: string) {
    return this.updateDesignApprovals({
      id: approvalId,
      status: "approved",
      reviewer_id: reviewerId,
      feedback: note ?? null,
      resolved_at: new Date(),
    })
  }

  /** Reject a design review with required feedback (API 05.3). */
  async reject(
    approvalId: string,
    reviewerId: string | null,
    feedback: string,
    annotatedImageUrl?: string
  ) {
    return this.updateDesignApprovals({
      id: approvalId,
      status: "rejected",
      reviewer_id: reviewerId,
      feedback,
      annotated_image_url: annotatedImageUrl ?? null,
      resolved_at: new Date(),
    })
  }
}

export default ProductionWorkflowService
