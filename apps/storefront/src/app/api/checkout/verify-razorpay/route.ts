import crypto from "node:crypto"
import { NextResponse } from "next/server"

/**
 * POST /api/checkout/verify-razorpay
 *
 * Verifies Razorpay Checkout's success payload before the storefront completes
 * the Medusa cart. Razorpay signs `razorpay_order_id|razorpay_payment_id`
 * with HMAC-SHA256 using the key secret; only a matching signature proves the
 * payment is genuine (FR-PAY-1, R11). The secret never leaves the server.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_CONFIGURED", message: "Razorpay secret missing." } },
      { status: 500 }
    )
  }

  let body: {
    razorpay_order_id?: unknown
    razorpay_payment_id?: unknown
    razorpay_signature?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body." } },
      { status: 400 }
    )
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {}
  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string" ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_REQUEST", message: "Missing Razorpay fields." } },
      { status: 400 }
    )
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex")

  const expectedBuf = Buffer.from(expected, "utf8")
  const actualBuf = Buffer.from(razorpay_signature, "utf8")
  const valid =
    expectedBuf.length === actualBuf.length &&
    crypto.timingSafeEqual(expectedBuf, actualBuf)

  if (!valid) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SIGNATURE_MISMATCH", message: "Payment verification failed." },
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
