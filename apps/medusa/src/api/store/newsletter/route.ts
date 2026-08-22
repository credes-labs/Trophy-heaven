import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const NewsletterSchema = z.object({
  email: z.string().email(),
})

/**
 * POST /store/newsletter — newsletter signup. Dispatches a notification
 * through the configured providers; with none registered (or on provider
 * failure) it logs instead of failing the request.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = NewsletterSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "A valid email address is required.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { email } = parsed.data

  try {
    const notificationModule = req.scope.resolve(Modules.NOTIFICATION)
    await notificationModule.createNotifications({
      to: email,
      channel: "email",
      template: "newsletter-signup",
      data: { email },
    })
  } catch (e) {
    logger.info(
      `Newsletter signup (notification unavailable: ${(e as Error).message}) — email=${email}`
    )
  }

  res.status(200).json({ ok: true })
}
