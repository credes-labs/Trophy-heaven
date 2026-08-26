import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { CORPORATE_ACCOUNT } from "../../../../modules/corporate-account"
import type CorporateService from "../../../../modules/corporate-account/service"
import { getActorId } from "../../../../lib/auth-context"

const AcceptSchema = z.object({ token: z.string().min(8) })

/** POST /store/corporate-invites/accept — bind an invited seat to the signed-in customer. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }
  const parsed = AcceptSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invite token required." } })
  }
  const service = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
  try {
    const team_member = await service.acceptInvite(parsed.data.token, customerId)
    res.json({ team_member })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "NOT_FOUND") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } })
    }
    throw e
  }
}
