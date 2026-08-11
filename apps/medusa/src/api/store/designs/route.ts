import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { TROPHY_CUSTOMIZATION } from "../../../modules/trophy-customization"
import type DesignService from "../../../modules/trophy-customization/service"
import { validateDesignState } from "../../../lib/design-validation"
import { getActorId } from "../../../lib/auth-context"

const CreateDesignSchema = z.object({
  name: z.string().min(1).max(120),
  mode: z.enum(["2d", "3d"]),
  product_id: z.string().min(1),
  variant_id: z.string().optional(),
  state_json: z.unknown(),
})

/** POST /store/designs — create a design (customer or guest). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = CreateDesignSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid design payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const stateCheck = validateDesignState(parsed.data.mode, parsed.data.state_json)
  if (!stateCheck.success) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid design state.", details: stateCheck.issues },
    })
  }

  const service = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const customerId = getActorId(req)

  const design = await service.createDesigns({
    name: parsed.data.name,
    mode: parsed.data.mode,
    product_id: parsed.data.product_id,
    variant_id: parsed.data.variant_id ?? null,
    state_json: parsed.data.state_json as Record<string, unknown>,
    customer_id: customerId,
    status: "draft",
    is_template: false,
  })

  res.status(201).json({ design })
}

/** GET /store/designs — list the caller's designs. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }

  const { limit = "20", offset = "0", status, is_template } = req.query as Record<string, string>
  const filters: Record<string, unknown> = { customer_id: customerId }
  if (status) filters.status = status
  if (is_template != null) filters.is_template = is_template === "true"

  const [designs, count] = await service.listAndCountDesigns(filters, {
    take: Number(limit),
    skip: Number(offset),
    order: { created_at: "DESC" },
  })

  res.json({ designs, count })
}
