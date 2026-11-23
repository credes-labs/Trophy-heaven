import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import {
  OTP_RESEND_SECONDS,
  OTP_TTL_SECONDS,
  generateOtp,
  hashOtp,
  maskIdentifier,
  normalizeIdentifier,
  otpCodeVisible,
} from "../../../../lib/otp"
import { otpPepper, otpStore } from "../../../../lib/otp-store"

const RequestSchema = z.object({ identifier: z.string().min(3).max(254) })

/**
 * POST /store/otp/request — sends a 6-digit sign-in code to an email address
 * (email channel → Resend) or an Indian mobile number (sms channel → MSG91).
 * Codes are stored hashed for 10 minutes. `otpCodeVisible` decides when the code is
 * also returned, so local dev and client-test sites work without providers.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = RequestSchema.safeParse(req.body)
  const id = parsed.success ? normalizeIdentifier(parsed.data.identifier) : null
  if (!id) {
    return res.status(400).json({
      error: {
        code: "INVALID_IDENTIFIER",
        message: "Enter a valid email address or 10-digit mobile number.",
      },
    })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const store = otpStore(req.scope)
  const existing = await store.get(id.value)
  const now = Date.now()
  if (existing && now - existing.sentAt < OTP_RESEND_SECONDS * 1000) {
    const wait = Math.ceil((OTP_RESEND_SECONDS * 1000 - (now - existing.sentAt)) / 1000)
    return res.status(429).json({
      error: { code: "OTP_COOLDOWN", message: `Please wait ${wait}s before asking for a new code.` },
      retry_after: wait,
    })
  }

  const code = generateOtp()
  await store.set(id.value, {
    hash: hashOtp(code, id.value, otpPepper(req.scope)),
    attempts: 0,
    sentAt: now,
  })

  const minutes = OTP_TTL_SECONDS / 60
  const text = `${code} is your Trophy Heaven sign-in code. It expires in ${minutes} minutes. Never share it.`
  try {
    const notifications = req.scope.resolve(Modules.NOTIFICATION)
    await notifications.createNotifications({
      to: id.value,
      channel: id.kind === "email" ? "email" : "sms",
      template: "otp-sign-in",
      content: {
        subject: "Your Trophy Heaven sign-in code",
        text,
        html: `<div style="font-family:sans-serif;color:#131111"><p>Your Trophy Heaven sign-in code is</p><p style="font-size:28px;letter-spacing:6px;margin:8px 0"><strong>${code}</strong></p><p style="color:#6B635C">It expires in ${minutes} minutes. If you did not ask for it, ignore this message.</p></div>`,
      },
    })
  } catch (e) {
    logger.warn(`OTP delivery failed for ${id.kind}: ${(e as Error).message}`)
  }

  const devEcho = otpCodeVisible()
  if (devEcho && process.env.NODE_ENV !== "production") {
    logger.info(`[otp] dev code for ${maskIdentifier(id)}: ${code}`)
  }

  res.status(200).json({
    sent: true,
    channel: id.kind,
    destination: maskIdentifier(id),
    expires_in: OTP_TTL_SECONDS,
    resend_in: OTP_RESEND_SECONDS,
    ...(devEcho ? { dev_code: code } : {}),
  })
}
