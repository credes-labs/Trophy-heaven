import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { toSmallestUnit, fromSmallestUnit } from "../lib/currency"
import { ADVANCE_COD_PLAN, parsePaymentPlan, splitAdvance } from "../lib/payment-plan"
import { ORDER_DESIGN_NOTES_KEY, collectOrderFiles, renderOwnerOrderEmail } from "../lib/order-files"

/**
 * Sends an order confirmation on `order.placed` (FR-ORD-9). In Phase 5 this is
 * extended with per-status notifications through the Resend/MSG91 providers; for
 * now it dispatches through the configured notification module.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const orderModule = container.resolve(Modules.ORDER)
  const notificationModule = container.resolve(Modules.NOTIFICATION)

  const order = await orderModule.retrieveOrder(data.id, {
    relations: ["items", "shipping_address"],
  })

  // Partial-advance orders: record what was paid online and what is due in cash.
  // The plan comes from the Razorpay session data (server-computed), falling back to
  // the cart metadata for the system provider used without Razorpay keys.
  let paymentSummary: Record<string, unknown> | null = null
  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: rows } = await query.graph({
      entity: "order",
      fields: ["id", "total", "metadata", "payment_collections.payment_sessions.data"],
      filters: { id: data.id },
    })
    const row = rows[0] as {
      total?: unknown
      metadata?: Record<string, unknown> | null
      payment_collections?: Array<{ payment_sessions?: Array<{ data?: Record<string, unknown> }> }>
    }
    const sessionData = row?.payment_collections
      ?.flatMap((c) => c.payment_sessions ?? [])
      .map((s) => s.data ?? {})
      .find((d) => d.payment_plan)
    const plan = parsePaymentPlan(sessionData?.payment_plan ?? row?.metadata?.payment_plan)
    if (plan === ADVANCE_COD_PLAN) {
      const currency = order.currency_code
      const totalPaise = toSmallestUnit(Number(row?.total ?? order.total ?? 0), currency)
      const { advancePaise, codPaise } = splitAdvance(totalPaise)
      paymentSummary = {
        payment_plan: ADVANCE_COD_PLAN,
        advance_amount: fromSmallestUnit(advancePaise, currency),
        cod_amount: fromSmallestUnit(codPaise, currency),
      }
      await orderModule.updateOrders(order.id, {
        metadata: { ...(order.metadata ?? {}), ...paymentSummary },
      })
    }
  } catch (e) {
    logger.warn(`order.placed: could not record payment plan for ${data.id}: ${(e as Error).message}`)
  }

  // The shop owner gets every order with links to the customer's design files and
  // documents (also stored on the order and line-item metadata in the admin).
  const ownerEmail = process.env.ORDER_NOTIFY_EMAIL?.trim()
  if (ownerEmail) {
    try {
      const meta = (order.metadata ?? {}) as Record<string, unknown>
      const items = order.items ?? []
      const files = collectOrderFiles(meta, items)
      const notes = typeof meta[ORDER_DESIGN_NOTES_KEY] === "string" ? meta[ORDER_DESIGN_NOTES_KEY] : null
      const { subject, html } = renderOwnerOrderEmail({
        orderRef: order.display_id ?? order.id,
        email: order.email,
        total: order.total,
        currency: order.currency_code,
        items,
        files,
        notes,
      })
      await notificationModule.createNotifications({
        to: ownerEmail,
        channel: "email",
        template: "order-owner",
        content: { subject, html },
        data: { order_id: order.id, files },
      })
    } catch (e) {
      logger.warn(`order.placed: owner notification failed for ${data.id}: ${(e as Error).message}`)
    }
  }

  if (!order.email) {
    logger.warn(`order.placed: order ${data.id} has no email; skipping confirmation`)
    return
  }

  await notificationModule.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-placed",
    data: {
      order_id: order.display_id ?? order.id,
      items: order.items?.map((i) => ({ title: i.title, quantity: i.quantity })) ?? [],
      total: order.total,
      currency_code: order.currency_code,
      ...(paymentSummary ?? {}),
    },
  })

  logger.info(`order.placed: confirmation queued for order ${order.display_id ?? order.id}`)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
