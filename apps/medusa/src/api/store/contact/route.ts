import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const TOPICS = {
  contact: "Contact message",
  quote: "Corporate quote request",
  return: "Return request",
} as const

const ContactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  /** Which site form sent it; picks the subject line. */
  topic: z.enum(["contact", "quote", "return"]).optional(),
})

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  )
}

/**
 * POST /store/contact — contact, corporate-quote and return-request forms. Emails the
 * shop owner (`ORDER_NOTIFY_EMAIL`) with the sender's details. Without an owner inbox
 * or a working provider it logs the full message, so nothing is lost locally.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = ContactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please fill in your name, a valid email and a message.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { name, email, message, topic = "contact" } = parsed.data
  const subject = `${TOPICS[topic]} from ${name}`
  const owner = process.env.ORDER_NOTIFY_EMAIL?.trim()
  const logLine = `${subject} <${email}>: ${message}`

  if (!owner) {
    logger.info(`store/contact (ORDER_NOTIFY_EMAIL not set) — ${logLine}`)
    return res.status(200).json({ ok: true })
  }

  try {
    const notificationModule = req.scope.resolve(Modules.NOTIFICATION)
    await notificationModule.createNotifications({
      to: owner,
      channel: "email",
      template: "contact-form",
      content: {
        subject,
        html: `<div style="font-family:sans-serif;color:#331207"><h2>${esc(subject)}</h2><p>From: ${esc(
          name
        )} &lt;${esc(email)}&gt;</p><pre style="white-space:pre-wrap;font-family:inherit">${esc(
          message
        )}</pre></div>`,
      },
      data: { name, email, message, topic },
    })
  } catch (e) {
    logger.warn(`store/contact (notification failed: ${(e as Error).message}) — ${logLine}`)
  }

  res.status(200).json({ ok: true })
}
