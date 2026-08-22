import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { WISHLIST } from "../../../modules/wishlist"
import type WishlistService from "../../../modules/wishlist/service"
import { getActorId } from "../../../lib/auth-context"

const AddSchema = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().optional().nullable(),
  toggle: z.boolean().optional(),
})

/** GET /store/wishlist — authenticated customer's wishlist. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }
  const service = req.scope.resolve<WishlistService>(WISHLIST)
  const result = await service.listByCustomer(customerId)
  res.json(result)
}

/** POST /store/wishlist — add (or toggle) an item. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }
  const parsed = AddSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid wishlist payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const service = req.scope.resolve<WishlistService>(WISHLIST)
  try {
    if (parsed.data.toggle) {
      const result = await service.toggle(
        customerId,
        parsed.data.product_id,
        parsed.data.variant_id
      )
      return res.status(result.action === "added" ? 201 : 200).json(result)
    }
    const item = await service.add(customerId, parsed.data.product_id, parsed.data.variant_id)
    res.status(201).json({ item })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "CONFLICT") {
      return res.status(409).json({ error: { code: "CONFLICT", message: err.message } })
    }
    throw e
  }
}
