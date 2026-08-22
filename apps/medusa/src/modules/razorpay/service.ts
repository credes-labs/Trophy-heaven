import crypto from "node:crypto"
import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"

type RazorpayOptions = {
  key_id: string
  key_secret: string
  webhook_secret?: string
}

type InjectedDependencies = {
  logger: Logger
}

const RAZORPAY_API = "https://api.razorpay.com/v1"

/**
 * Razorpay payment provider (India — UPI, cards, net banking, wallets, EMI,
 * PayLater; see FR-PAY-1). Implements Medusa's payment-provider contract using
 * Razorpay's REST API. Webhook signature verification + idempotency are handled
 * by the store webhook route (see src/api/webhooks/razorpay) and
 * getWebhookActionAndData below (FR-PAY-8, R11).
 *
 * Amounts are handled in the smallest currency unit (paise for INR), matching
 * both Medusa and Razorpay conventions.
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
  }) {
    const order = await this.request<{ id: string; status: string }>("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: Math.round(input.amount),
        currency: input.currency_code.toUpperCase(),
        notes: input.context ?? {},
      }),
    })

    return {
      id: order.id,
      data: { razorpay_order_id: order.id, status: order.status },
    }
  }

  async authorizePayment(input: { data?: Record<string, unknown> }) {
    // Verify with Razorpay before marking the session authorized: resolve the
    // payment (by payment id, falling back to the order's payment list) and
    // only authorize when Razorpay reports it authorized/captured.
    const data = input.data ?? {}
    if (!this.options_.key_id || !this.options_.key_secret) {
      this.logger_.warn("Razorpay keys not configured — leaving payment pending")
      return { status: PaymentSessionStatus.PENDING, data }
    }

    try {
      let paymentId = (data.razorpay_payment_id as string) || ""
      let payment: { id?: string; status?: string } | null = null

      if (paymentId) {
        payment = await this.request<{ id: string; status: string }>(`/payments/${paymentId}`)
      } else {
        const orderId = (data.razorpay_order_id as string) || ""
        if (!orderId) {
          return { status: PaymentSessionStatus.PENDING, data }
        }
        const list = await this.request<{ items?: Array<{ id: string; status: string }> }>(
          `/orders/${orderId}/payments`
        )
        payment = list.items?.[0] ?? null
        paymentId = payment?.id ?? ""
      }

      if (!payment) {
        return { status: PaymentSessionStatus.PENDING, data }
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

  async capturePayment(input: { data?: Record<string, unknown> }) {
    const paymentId = (input.data?.razorpay_payment_id as string) || ""
    if (!paymentId) {
      return { data: input.data ?? {} }
    }
    if (input.data?.razorpay_status === "captured") {
      // Verified as captured during authorization — capturing again would 400.
      return { data: input.data ?? {} }
    }
    const captured = await this.request<Record<string, unknown>>(
      `/payments/${paymentId}/capture`,
      { method: "POST", body: JSON.stringify({ amount: input.data?.amount }) }
    )
    return { data: { ...(input.data ?? {}), captured } }
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
    const refund = await this.request<Record<string, unknown>>(
      `/payments/${paymentId}/refund`,
      { method: "POST", body: JSON.stringify({ amount: Math.round(input.amount) }) }
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
   * payment action. Idempotency (dedupe by event id) is enforced upstream.
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

    const amount = Number(entity.amount ?? 0)
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
