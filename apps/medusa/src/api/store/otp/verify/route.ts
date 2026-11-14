import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { AuthIdentityDTO, CustomerDTO } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, generateJwtToken } from "@medusajs/framework/utils"
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "zod"
import { OTP_MAX_ATTEMPTS, normalizeIdentifier, otpMatches, phoneVariants } from "../../../../lib/otp"
import { otpPepper, otpStore } from "../../../../lib/otp-store"

const VerifySchema = z.object({
  identifier: z.string().min(3).max(254),
  code: z.string().regex(/^\d{6}$/),
  first_name: z.string().trim().max(80).optional(),
  last_name: z.string().trim().max(80).optional(),
})

const PROVIDER = "otp"

/**
 * POST /store/otp/verify — checks the code, then signs the customer in: uses the
 * customer already linked to this OTP identity, else an existing account with the
 * same email/phone, else creates one (first sign-in). Returns a customer JWT in the
 * same shape Medusa's own /auth routes issue, so the SDK and `/store/customers/me`
 * work unchanged.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = VerifySchema.safeParse(req.body)
  const id = parsed.success ? normalizeIdentifier(parsed.data.identifier) : null
  if (!parsed.success || !id) {
    return res.status(400).json({
      error: { code: "INVALID_REQUEST", message: "Enter the 6-digit code we sent you." },
    })
  }

  const store = otpStore(req.scope)
  const record = await store.get(id.value)
  if (!record) {
    return res.status(400).json({
      error: { code: "OTP_EXPIRED", message: "That code has expired. Ask for a new one." },
    })
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await store.clear(id.value)
    return res.status(429).json({
      error: { code: "OTP_LOCKED", message: "Too many wrong attempts. Ask for a new code." },
    })
  }
  if (!otpMatches(parsed.data.code, id.value, otpPepper(req.scope), record.hash)) {
    const attempts = record.attempts + 1
    await store.set(id.value, { ...record, attempts })
    const left = Math.max(0, OTP_MAX_ATTEMPTS - attempts)
    return res.status(400).json({
      error: {
        code: "OTP_INVALID",
        message: `That code is not right. ${left} ${left === 1 ? "attempt" : "attempts"} left.`,
      },
    })
  }
  await store.clear(id.value)

  const auth = req.scope.resolve(Modules.AUTH)
  const customers = req.scope.resolve(Modules.CUSTOMER)

  // 1. The OTP auth identity for this email/phone (created on first sign-in).
  const providerIdentities = await auth.listProviderIdentities({
    provider: PROVIDER,
    entity_id: id.value,
  })
  let identity: AuthIdentityDTO = providerIdentities[0]?.auth_identity_id
    ? await auth.retrieveAuthIdentity(providerIdentities[0].auth_identity_id)
    : await auth.createAuthIdentities({
        provider_identities: [{ provider: PROVIDER, entity_id: id.value }],
      })

  // 2. The customer: linked to the identity, else an existing account with this email/phone.
  let customer: CustomerDTO | undefined
  const linkedId = identity.app_metadata?.customer_id as string | undefined
  if (linkedId) {
    customer = (await customers.listCustomers({ id: linkedId }, { take: 1 }))[0]
  }
  if (!customer) {
    if (id.kind === "email") {
      customer = (
        await customers.listCustomers(
          { email: id.value, has_account: true },
          { take: 1, order: { created_at: "ASC" } }
        )
      )[0]
    } else {
      // The customer filter types omit `phone`; query.graph filters on the column directly.
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({
        entity: "customer",
        fields: ["id"],
        filters: { phone: phoneVariants(id.value), has_account: true },
        pagination: { take: 1, order: { created_at: "ASC" } },
      })
      const found = data[0] as { id?: string } | undefined
      if (found?.id) customer = await customers.retrieveCustomer(found.id)
    }
  }
  let isNew = false
  if (!customer) {
    const { result } = await createCustomersWorkflow(req.scope).run({
      input: {
        customersData: [
          {
            ...(id.kind === "email" ? { email: id.value } : { phone: id.value }),
            first_name: parsed.data.first_name || undefined,
            last_name: parsed.data.last_name || undefined,
            has_account: true,
          },
        ],
      },
    })
    customer = result[0]
    isNew = true
  }

  if (identity.app_metadata?.customer_id !== customer.id) {
    identity = await auth.updateAuthIdentities({
      id: identity.id,
      app_metadata: { ...(identity.app_metadata ?? {}), customer_id: customer.id },
    })
  }

  const { http } = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE).projectConfig
  const token = generateJwtToken(
    {
      actor_id: customer.id,
      actor_type: "customer",
      auth_identity_id: identity.id,
      auth_provider: PROVIDER,
      app_metadata: { ...(identity.app_metadata ?? {}), customer_id: customer.id },
      user_metadata: {},
    },
    { secret: http.jwtSecret, expiresIn: http.jwtExpiresIn ?? "1d", jwtOptions: http.jwtOptions }
  )

  res.status(200).json({ token, is_new: isNew })
}
