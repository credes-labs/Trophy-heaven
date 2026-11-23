import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { assertCartMayComplete } from "../../lib/cart-complete-guard"
import { CORPORATE_ACCOUNT } from "../../modules/corporate-account"
import type CorporateService from "../../modules/corporate-account/service"

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (opts: unknown) => Promise<{ data: unknown }>
  }

  let snapshotCart = cart as {
    id?: string
    total?: number
    metadata?: Record<string, unknown> | null
    items?: Array<{ title?: string | null; quantity?: unknown; metadata?: Record<string, unknown> | null }>
    payment_collection?: { payment_sessions?: Array<{ provider_id?: string; status?: string }> }
  }

  if (snapshotCart?.id) {
    try {
      const { data } = await query.graph({
        entity: "cart",
        fields: [
          "id",
          "total",
          "metadata",
          "items.title",
          "items.quantity",
          "items.metadata",
          "payment_collection.payment_sessions.provider_id",
          "payment_collection.payment_sessions.status",
        ],
        filters: { id: snapshotCart.id },
      })
      const rows = data as typeof snapshotCart[]
      if (rows?.[0]) snapshotCart = rows[0]
    } catch {
      // Fall back to the hook's cart payload.
    }
  }

  const corporate = container.resolve<CorporateService>(CORPORATE_ACCOUNT)

  await assertCartMayComplete(
    {
      total: Number(snapshotCart?.total ?? 0),
      metadata: snapshotCart?.metadata ?? null,
      items: snapshotCart?.items,
      paymentSessions: snapshotCart?.payment_collection?.payment_sessions ?? [],
    },
    {
      razorpayConfigured,
      testPaymentsAllowed:
        process.env.NODE_ENV !== "production" || process.env.ALLOW_TEST_PAYMENTS === "true",
      verifyNetTerms: async (profileId, terms, amount) => {
        const termsOk = await corporate.canUsePaymentTerms(profileId, terms)
        if (!termsOk.ok) return termsOk
        return corporate.assertWithinCreditLimit(profileId, amount)
      },
    }
  )
})
