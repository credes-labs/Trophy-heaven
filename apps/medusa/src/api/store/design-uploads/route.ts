import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "zod"
import { checkDesignUpload } from "../../../lib/design-upload"

const UploadSchema = z.object({
  filename: z.string().min(1).max(200),
  /** File bytes as base64 (a `data:` URL prefix is accepted). */
  data: z.string().min(1),
})

/**
 * POST /store/design-uploads — stores a customer's design file (order-wide sticker
 * artwork from the cart, or a per-line design) through the File module and returns
 * its public URL. The storefront then records the URL on cart or line-item metadata,
 * which is copied to the order. PNG/JPG/WebP/PDF only, ≤10 MB, sniffed by magic bytes.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = UploadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Send a filename and the file data." },
    })
  }

  const checked = checkDesignUpload(parsed.data.data, parsed.data.filename)
  if (!checked.ok) {
    const status = checked.code === "TOO_LARGE" ? 413 : 400
    return res.status(status).json({ error: { code: checked.code, message: checked.message } })
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: [
        {
          filename: checked.filename,
          mimeType: checked.mime,
          content: checked.buffer.toString("base64"),
          access: "public",
        },
      ],
    },
  })

  const file = result[0]
  res.status(201).json({
    file: {
      id: file.id,
      url: file.url,
      filename: checked.filename,
      mime_type: checked.mime,
      size: checked.buffer.length,
    },
  })
}
