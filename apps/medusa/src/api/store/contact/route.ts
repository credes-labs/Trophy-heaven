import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const ContactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
})

/**
 * POST /store/contact — contact-form submission. Dispatches a notification
 * through the configured providers; with none registered (or on provider
 * failure) it logs instead of failing the request.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = ContactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid contact payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { name, email, message } = parsed.data

  try {
    const notificationModule = req.scope.resolve(Modules.NOTIFICATION)
    await notificationModule.createNotifications({
      to: email,
      channel: "email",
      template: "contact-form",
      data: { name, email, message },
    })
  } catch (e) {
    logger.info(
      `Contact form (notification unavailable: ${(e as Error).message}) — from=${name} <${email}> message=${message}`
    )
  }

  res.status(200).json({ ok: true })
}
