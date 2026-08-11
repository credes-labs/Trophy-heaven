import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { TROPHY_CUSTOMIZATION } from "../../../../modules/trophy-customization"
import type DesignService from "../../../../modules/trophy-customization/service"
import { validateDesignState } from "../../../../lib/design-validation"
import { getActorId } from "../../../../lib/auth-context"

const LOCKED_STATUSES = ["approved"]

async function loadOwned(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const { id } = req.params
  const design = await service.retrieveDesign(id).catch(() => null)
  if (!design) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Design not found." } })
    return null
  }
  const customerId = getActorId(req)
  const shareToken = (req.query.share_token as string) || req.headers["x-share-token"]
  // Guest session designs (customer_id null) are owned by an unauthenticated caller.
  const isOwner = design.customer_id === customerId
  const hasShare = design.share_token && design.share_token === shareToken
  if (!isOwner && !hasShare) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Design not found." } })
    return null
  }
  return { service, design, isOwner }
}

/** GET /store/designs/:id — owner or valid share_token. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const ctx = await loadOwned(req, res)
  if (!ctx) return
  res.json({ design: ctx.design })
}

const UpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  variant_id: z.string().nullable().optional(),
  state_json: z.unknown().optional(),
})

/** PUT /store/designs/:id — snapshots a revision, then applies (owner only). */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const ctx = await loadOwned(req, res)
  if (!ctx) return
  if (!ctx.isOwner) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not the design owner." } })
  }
  if (LOCKED_STATUSES.includes(ctx.design.status)) {
    return res.status(409).json({
      error: { code: "CONFLICT", message: `Design is ${ctx.design.status} and locked from edits.` },
    })
  }

  const parsed = UpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid update payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  if (parsed.data.state_json !== undefined) {
    const check = validateDesignState(ctx.design.mode as "2d" | "3d", parsed.data.state_json)
    if (!check.success) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Invalid design state.", details: check.issues },
      })
    }
  }

  await ctx.service.snapshotRevision(ctx.design.id, getActorId(req))
  const { state_json, ...rest } = parsed.data
  const design = await ctx.service.updateDesigns({
    id: ctx.design.id,
    ...rest,
    ...(state_json !== undefined ? { state_json: state_json as Record<string, unknown> } : {}),
  })
  res.json({ design })
}

/** DELETE /store/designs/:id — owner only. */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const ctx = await loadOwned(req, res)
  if (!ctx) return
  if (!ctx.isOwner) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not the design owner." } })
  }
  await ctx.service.deleteDesigns(ctx.design.id)
  res.status(204).send()
}
