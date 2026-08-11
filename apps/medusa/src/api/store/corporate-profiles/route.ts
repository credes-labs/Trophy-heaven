import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { CORPORATE_ACCOUNT } from "../../../modules/corporate-account"
import type CorporateService from "../../../modules/corporate-account/service"
import { getActorId } from "../../../lib/auth-context"

const CreateSchema = z.object({
  company_name: z.string().min(1).max(160),
  tax_id: z.string().min(1).max(40),
  billing_address: z.record(z.string(), z.unknown()).optional(),
})

/** POST /store/corporate-profiles — create a company profile (API 05.4). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }
  const parsed = CreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid corporate profile payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const service = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
  const corporate_profile = await service.createCorporateProfiles({
    customer_id: customerId,
    company_name: parsed.data.company_name,
    tax_id: parsed.data.tax_id,
    billing_address: parsed.data.billing_address ?? null,
    credit_limit: 0,
    payment_terms: "prepaid",
    is_verified: false,
  })

  res.status(201).json({ corporate_profile })
}

/** GET /store/corporate-profiles — the caller's profile(s). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }
  const service = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
  const corporate_profiles = await service.listCorporateProfiles({ customer_id: customerId })
  res.json({ corporate_profiles })
}
