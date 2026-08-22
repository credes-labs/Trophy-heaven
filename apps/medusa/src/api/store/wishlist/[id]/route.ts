import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST } from "../../../../modules/wishlist"
import type WishlistService from "../../../../modules/wishlist/service"
import { getActorId } from "../../../../lib/auth-context"

/** DELETE /store/wishlist/:id — remove item (ownership checked). */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }

  const service = req.scope.resolve<WishlistService>(WISHLIST)
  try {
    await service.remove(req.params.id, customerId)
    res.status(204).send()
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } })
    }
    if (err.code === "FORBIDDEN") {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: err.message } })
    }
    throw e
  }
}
