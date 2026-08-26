import crypto from "node:crypto"
import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import { fromSmallestUnit, toSmallestUnit } from "../../lib/currency"

type RazorpayOptions = {
  key_id: string
  key_secret: string
  webhook_secret?: string
}

type InjectedDependencies = {
  logger: Logger
}

const RAZORPAY_API = "https://api.razorpay.com/v1"

type RazorpayPayment = {
  id?: string
  status?: string
  amount?: number
  currency?: string
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) return Number(value)
  if (value && typeof value === "object" && "numeric" in value) {
    return Number((value as { numeric: unknown }).numeric)
  }
  return 0
}

/**
 * Razorpay payment provider (India — UPI, cards, net banking, wallets, EMI,
 * PayLater; see FR-PAY-1). Implements Medusa's payment-provider contract using
 * Razorpay's REST API. Webhook signature verification + idempotency are handled
 * by the store webhook route (see src/api/webhooks/razorpay).
 *
 * Medusa v2 session amounts are major units (₹). Razorpay Orders/Payments use
 * the smallest currency unit (paise for INR) — same conversion Stripe's
 * provider applies via getSmallestUnit.
 */
class RazorpayProviderService extends AbstractPaymentProvider<RazorpayOptions> {
  static identifier = "razorpay"

  protected readonly options_: RazorpayOptions
  protected readonly logger_: Logger

  constructor(container: InjectedDependencies, options: RazorpayOptions) {
    super(container, options)
    this.options_ = options
    this.logger_ = container.logger
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.key_id || !options.key_secret) {
      throw new Error("Razorpay provider requires `key_id` and `key_secret`.")
    }
  }

  private authHeader(): string {
    const token = Buffer.from(`${this.options_.key_id}:${this.options_.key_secret}`).toString(
      "base64"
    )
    return `Basic ${token}`
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${RAZORPAY_API}${path}`, {
      ...init,
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Razorpay API ${path} failed: ${res.status} ${body}`)
    }
    return (await res.json()) as T
  }

  async initiatePayment(input: {
    amount: number
    currency_code: string
    context?: Record<string, unknown>
    data?: Record<string, unknown>
  }) {
    const currency = input.currency_code
    const amountPaise = toSmallestUnit(asNumber(input.amount), currency)
    const sessionId =
      (typeof input.data?.session_id === "string" && input.data.session_id) ||
      (typeof input.context?.session_id === "string" && input.context.session_id) ||
      ""

    const order = await this.request<{ id: string; status: string }>("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: amountPaise,
        currency: currency.toUpperCase(),
        notes: {
          medusa_session_id: sessionId,
          ...(input.context ?? {}),
        },
      }),
    })

    return {
      id: order.id,
      data: {
        razorpay_order_id: order.id,
        status: order.status,
        amount_paise: amountPaise,
        currency_code: currency,
        medusa_session_id: sessionId,
      },
    }
  }

  async authorizePayment(input: { data?: Record<string, unknown> }) {
    const data = input.data ?? {}
    if (!this.options_.key_id || !this.options_.key_secret) {
      this.logger_.warn("Razorpay keys not configured — leaving payment pending")
      return { status: PaymentSessionStatus.PENDING, data }
    }

    try {
      let paymentId = (data.razorpay_payment_id as string) || ""
      let payment: RazorpayPayment | null = null

      if (paymentId) {
        payment = await this.request<RazorpayPayment>(`/payments/${paymentId}`)
      } else {
        const orderId = (data.razorpay_order_id as string) || ""
        if (!orderId) {
          return { status: PaymentSessionStatus.PENDING, data }
        }
        const list = await this.request<{ items?: RazorpayPayment[] }>(
          `/orders/${orderId}/payments`
        )
        payment = list.items?.[0] ?? null
        paymentId = payment?.id ?? ""
      }

      if (!payment) {
        return { status: PaymentSessionStatus.PENDING, data }
      }

      const expectedPaise = asNumber(data.amount_paise)
      if (expectedPaise > 0 && asNumber(payment.amount) !== expectedPaise) {
        this.logger_.warn(
          `Razorpay amount mismatch: paid ${payment.amount} expected ${expectedPaise}`
        )
        return {
          status: PaymentSessionStatus.ERROR,
          data: { ...data, razorpay_payment_id: paymentId, razorpay_status: payment.status },
        }
      }

      const merged = { ...data, razorpay_payment_id: paymentId, razorpay_status: payment.status }
      switch (payment.status) {
        case "authorized":
        case "captured":
          return { status: PaymentSessionStatus.AUTHORIZED, data: merged }
        case "failed":
          return { status: PaymentSessionStatus.ERROR, data: merged }
        default:
          return { status: PaymentSessionStatus.PENDING, data: merged }
      }
    } catch (e) {
      this.logger_.warn(`Razorpay authorizePayment verification failed: ${(e as Error).message}`)
      return { status: PaymentSessionStatus.PENDING, data }
    }
  }

  async capturePayment(input: { data?: Record<string, unknown>; amount?: number }) {
    const paymentId = (input.data?.razorpay_payment_id as string) || ""
    if (!paymentId) {
      return { data: input.data ?? {} }
    }
    if (input.data?.razorpay_status === "captured") {
      return { data: input.data ?? {} }
    }
    const currency = String(input.data?.currency_code ?? "inr")
    const amountPaise =
      asNumber(input.data?.amount_paise) ||
      toSmallestUnit(asNumber(input.amount ?? input.data?.amount), currency)
    const captured = await this.request<Record<string, unknown>>(
      `/payments/${paymentId}/capture`,
      {
        method: "POST",
        body: JSON.stringify({
          amount: amountPaise,
          currency: currency.toUpperCase(),
        }),
      }
    )
    return { data: { ...(input.data ?? {}), captured, razorpay_status: "captured" } }
  }

  async cancelPayment(input: { data?: Record<string, unknown> }) {
    return { data: input.data ?? {} }
  }

  async deletePayment(input: { data?: Record<string, unknown> }) {
    return { data: input.data ?? {} }
  }

  async refundPayment(input: { data?: Record<string, unknown>; amount: number }) {
    const paymentId = (input.data?.razorpay_payment_id as string) || ""
    if (!paymentId) {
      throw new Error("Cannot refund: missing razorpay_payment_id")
    }
    const currency = String(input.data?.currency_code ?? "inr")
    const refund = await this.request<Record<string, unknown>>(
      `/payments/${paymentId}/refund`,
      {
        method: "POST",
        body: JSON.stringify({
          amount: toSmallestUnit(asNumber(input.amount), currency),
        }),
      }
    )
    return { data: { ...(input.data ?? {}), refund } }
  }

  async retrievePayment(input: { data?: Record<string, unknown> }) {
    const paymentId = (input.data?.razorpay_payment_id as string) || ""
    if (!paymentId) {
      return { data: input.data ?? {} }
    }
    const payment = await this.request<Record<string, unknown>>(`/payments/${paymentId}`)
    return { data: payment }
  }

  async updatePayment(input: { data?: Record<string, unknown> }) {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(input: { data?: Record<string, unknown> }) {
    const paymentId = (input.data?.razorpay_payment_id as string) || ""
    if (!paymentId) {
      return { status: PaymentSessionStatus.PENDING }
    }
    const payment = await this.request<{ status: string }>(`/payments/${paymentId}`)
    switch (payment.status) {
      case "captured":
        return { status: PaymentSessionStatus.CAPTURED }
      case "authorized":
        return { status: PaymentSessionStatus.AUTHORIZED }
      case "failed":
        return { status: PaymentSessionStatus.ERROR }
      default:
        return { status: PaymentSessionStatus.PENDING }
    }
  }

  /**
   * Verifies the webhook signature and maps the Razorpay event to a Medusa
   * payment action. Amounts returned to Medusa are major units.
   */
  async getWebhookActionAndData(payload: {
    data: Record<string, unknown>
    rawData: string | Buffer
    headers: Record<string, unknown>
  }) {
    const signature = (payload.headers["x-razorpay-signature"] as string) || ""
    const secret = this.options_.webhook_secret

    if (secret) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(payload.rawData)
        .digest("hex")
      if (expected !== signature) {
        this.logger_.warn("Razorpay webhook signature mismatch — rejecting")
        return { action: PaymentActions.NOT_SUPPORTED }
      }
    }

    const event = (payload.data?.event as string) || ""
    const entity =
      ((payload.data?.payload as Record<string, any>)?.payment?.entity as Record<string, any>) ||
      {}

    const currency = String(entity.currency ?? "INR")
    const amount = fromSmallestUnit(Number(entity.amount ?? 0), currency)
    const sessionId = (entity.order_id as string) || ""

    switch (event) {
      case "payment.captured":
        return { action: PaymentActions.SUCCESSFUL, data: { session_id: sessionId, amount } }
      case "payment.authorized":
        return { action: PaymentActions.AUTHORIZED, data: { session_id: sessionId, amount } }
      case "payment.failed":
        return { action: PaymentActions.FAILED, data: { session_id: sessionId, amount } }
      default:
        return { action: PaymentActions.NOT_SUPPORTED }
    }
  }
}

export default RazorpayProviderService
