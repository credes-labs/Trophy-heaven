import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "node:crypto"
import { ContainerRegistrationKeys, Modules, PaymentActions } from "@medusajs/framework/utils"
import { WEBHOOK_EVENTS } from "../../../modules/webhook-events"
import type WebhookEventsService from "../../../modules/webhook-events/service"

type RazorpayPaymentEntity = {
  id?: string
  order_id?: string
  amount?: number
  status?: string
}

type RazorpayWebhookBody = {
  event?: string
  id?: string
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity }
  }
}

// The Razorpay provider is registered in medusa-config.ts with id "razorpay" and
// service identifier "razorpay", so Medusa keys it as "pp_razorpay_razorpay".
const RAZORPAY_PROVIDER_ID = "pp_razorpay_razorpay"

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

function getRawBody(req: MedusaRequest): string {
  const raw = (req as MedusaRequest & { rawBody?: string | Buffer }).rawBody
  if (raw) {
    return typeof raw === "string" ? raw : raw.toString("utf8")
  }
  return JSON.stringify(req.body ?? {})
}

/**
 * POST /webhooks/razorpay — HMAC-verified payment event handler (FR-PAY-8).
 * No JWT auth; signature verified via RAZORPAY_WEBHOOK_SECRET. Processed event
 * ids are persisted in the webhook-events module so redeliveries are skipped.
 * Always answers 200 once the signature is valid — processing errors are
 * logged, not retried by Razorpay.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  const signature = (req.headers["x-razorpay-signature"] as string) || ""
  const rawBody = getRawBody(req)

  if (!secret) {
    logger.error("RAZORPAY_WEBHOOK_SECRET is not configured")
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Webhook secret not configured." },
    })
  }

  if (!signature || !verifySignature(rawBody, signature, secret)) {
    logger.warn("Razorpay webhook signature mismatch")
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid webhook signature." },
    })
  }

  const body = (req.body ?? {}) as RazorpayWebhookBody
  const event = body.event || "unknown"
  const eventId = body.id || ""

  // ── Idempotency: skip events we have already processed ─────────────────────
  const webhookEvents = req.scope.resolve<WebhookEventsService>(WEBHOOK_EVENTS)
  if (eventId && (await webhookEvents.hasProcessed("razorpay", eventId))) {
    logger.info(`Razorpay webhook ${eventId} already processed — skipping`)
    return res.status(200).json({ received: true, duplicate: true })
  }

  try {
    await processEvent(req, body, rawBody)
    if (eventId) {
      await webhookEvents.markProcessed("razorpay", eventId).catch((e) => {
        // Unique-constraint race with a concurrent redelivery — harmless.
        logger.warn(`Razorpay webhook ${eventId}: could not record idempotency key (${e})`)
      })
    }
  } catch (e) {
    logger.error(
      `Razorpay webhook ${eventId} (${event}) failed to process: ${(e as Error).message}`
    )
  }

  res.status(200).json({ received: true })
}

async function processEvent(req: MedusaRequest, body: RazorpayWebhookBody, rawBody: string) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const paymentModule = req.scope.resolve(Modules.PAYMENT)

  // Reuse the provider's signature check + event → action mapping.
  const processed = await paymentModule.getWebhookActionAndData({
    provider: RAZORPAY_PROVIDER_ID.replace(/^pp_/, ""),
    payload: {
      data: body as unknown as Record<string, unknown>,
      rawData: rawBody,
      headers: req.headers as Record<string, unknown>,
    },
  })

  const orderId = processed.data?.session_id
  const entity = body.payload?.payment?.entity ?? {}
  const razorpayPaymentId = entity.id || ""

  if (processed.action === PaymentActions.NOT_SUPPORTED || !orderId) {
    logger.info(`Razorpay webhook acknowledged event=${body.event} id=${body.id}`)
    return
  }

  // The provider maps session_id to the Razorpay order id (see
  // modules/razorpay/service.ts getWebhookActionAndData) — resolve the Medusa
  // payment session whose provider data carries that order id.
  const sessions = await paymentModule.listPaymentSessions(
    { provider_id: RAZORPAY_PROVIDER_ID },
    { take: 100, order: { created_at: "DESC" } }
  )
  const session = sessions.find(
    (s) => (s.data as Record<string, unknown> | null)?.razorpay_order_id === orderId
  )
  if (!session) {
    logger.warn(`Razorpay webhook: no payment session found for order ${orderId}`)
    return
  }

  switch (processed.action) {
    case PaymentActions.SUCCESSFUL: {
      // Stash the Razorpay payment id on the session so the provider's
      // authorize/capture calls can address the payment at Razorpay.
      await paymentModule.updatePaymentSession({
        id: session.id,
        currency_code: session.currency_code,
        amount: session.amount,
        data: {
          ...(session.data ?? {}),
          razorpay_payment_id: razorpayPaymentId,
          amount: processed.data?.amount ?? session.amount,
        },
      })

      const [payment] = await paymentModule.listPayments(
        { payment_session_id: session.id },
        { take: 1 }
      )
      const authorized =
        payment ?? (await paymentModule.authorizePaymentSession(session.id, {}))
      if (!authorized) {
        logger.warn(`Razorpay webhook: session ${session.id} authorization still pending`)
        return
      }
      if (!authorized.captured_at) {
        await paymentModule.capturePayment({
          payment_id: authorized.id,
          amount: processed.data?.amount,
        })
      }
      logger.info(
        `Razorpay payment.captured: captured payment ${authorized.id} (order ${orderId})`
      )
      break
    }
    case PaymentActions.AUTHORIZED: {
      const [payment] = await paymentModule.listPayments(
        { payment_session_id: session.id },
        { take: 1 }
      )
      if (!payment) {
        await paymentModule.updatePaymentSession({
          id: session.id,
          currency_code: session.currency_code,
          amount: session.amount,
          data: { ...(session.data ?? {}), razorpay_payment_id: razorpayPaymentId },
        })
        await paymentModule.authorizePaymentSession(session.id, {})
      }
      logger.info(`Razorpay payment.authorized: session ${session.id} (order ${orderId})`)
      break
    }
    case PaymentActions.FAILED: {
      const [payment] = await paymentModule.listPayments(
        { payment_session_id: session.id },
        { take: 1 }
      )
      if (payment && !payment.captured_at && !payment.canceled_at) {
        await paymentModule.cancelPayment(payment.id)
        logger.info(`Razorpay payment.failed: canceled payment ${payment.id} (order ${orderId})`)
      } else {
        logger.info(
          `Razorpay payment.failed: no open payment for session ${session.id} (order ${orderId})`
        )
      }
      break
    }
    default:
      logger.info(`Razorpay webhook action ${processed.action} ignored (order ${orderId})`)
  }
}
