import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { CORPORATE_ACCOUNT } from "../../../../../modules/corporate-account"
import type CorporateService from "../../../../../modules/corporate-account/service"
import { getActorId } from "../../../../../lib/auth-context"

const AddMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "manager"]).optional(),
})

/** POST /store/corporate-profiles/:id/team-members — invite a seat (API 05.4). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
  const profile = await service.retrieveCorporateProfile(req.params.id).catch(() => null)
  if (!profile) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Corporate profile not found." } })
  }
  if (profile.customer_id !== getActorId(req)) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Only the account owner can invite." } })
  }

  const parsed = AddMemberSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid member payload." },
    })
  }

  try {
    const team_member = await service.inviteMember(profile.id, parsed.data.email, parsed.data.role)

    // Fire an invite notification (best-effort).
    try {
      const { Modules } = await import("@medusajs/framework/utils")
      const notif = req.scope.resolve(Modules.NOTIFICATION)
      await notif.createNotifications([
        {
          to: parsed.data.email,
          channel: "email",
          template: "corporate-invite",
          data: { company_name: profile.company_name },
        },
      ])
    } catch {
      // notification best-effort
    }

    res.status(201).json({ team_member })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "CONFLICT") {
      return res.status(409).json({ error: { code: "CONFLICT", message: err.message } })
    }
    throw e
  }
}
