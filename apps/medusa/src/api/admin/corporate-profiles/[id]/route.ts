import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { CORPORATE_ACCOUNT } from "../../../../modules/corporate-account"
import type CorporateService from "../../../../modules/corporate-account/service"

const UpdateSchema = z.object({
  credit_limit: z.number().nonnegative().optional(),
  payment_terms: z.enum(["prepaid", "net_30", "net_60"]).optional(),
  account_manager_id: z.string().nullable().optional(),
  is_verified: z.boolean().optional(),
})

/**
 * PUT /admin/corporate-profiles/:id — admin sets credit limit, net terms,
 * account-manager assignment, and verification (API 05.4, `corporate:manage`).
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
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

  const service = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
  const existing = await service.retrieveCorporateProfile(req.params.id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Corporate profile not found." } })
  }

  const corporate_profile = await service.updateCorporateProfiles({
    id: req.params.id,
    ...parsed.data,
  })
  res.json({ corporate_profile })
}
