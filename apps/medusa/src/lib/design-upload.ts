/**
 * Validation for customer design uploads from the cart (order-wide sticker/artwork
 * file or a per-line design). Pure so it can be unit tested without Medusa.
 */
export const DESIGN_UPLOAD_MAX_BYTES = 10 * 1024 * 1024

export const DESIGN_UPLOAD_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const

export type DesignUploadMime = keyof typeof DESIGN_UPLOAD_TYPES

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((b, i) => buf[offset + i] === b)
}

/** Checks the file's magic bytes so a renamed file can't pass as an image or PDF. */
export function sniffDesignMime(buf: Buffer): DesignUploadMime | null {
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png"
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return "image/jpeg"
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8))
    return "image/webp"
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf"
  return null
}

export type DesignUploadCheck =
  | { ok: true; buffer: Buffer; mime: DesignUploadMime; filename: string }
  | { ok: false; code: "EMPTY" | "TOO_LARGE" | "UNSUPPORTED_TYPE"; message: string }

/** Safe display filename: base name only, limited charset, forced extension. */
export function cleanDesignFilename(name: string, mime: DesignUploadMime): string {
  const base = name.split(/[\/]/).pop() ?? "design"
  const stem = base.replace(/\.[^.]*$/, "").replace(/[^\w\- ]+/g, "").trim().slice(0, 60) || "design"
  return `${stem}.${DESIGN_UPLOAD_TYPES[mime]}`
}

export function checkDesignUpload(base64: string, filename: string): DesignUploadCheck {
  const clean = base64.replace(/^data:[^;]+;base64,/, "")
  const buffer = Buffer.from(clean, "base64")
  if (!buffer.length) return { ok: false, code: "EMPTY", message: "The file is empty." }
  if (buffer.length > DESIGN_UPLOAD_MAX_BYTES) {
    return { ok: false, code: "TOO_LARGE", message: "Design files can be up to 10 MB." }
  }
  const mime = sniffDesignMime(buffer)
  if (!mime) {
    return {
      ok: false,
      code: "UNSUPPORTED_TYPE",
      message: "Upload a PNG, JPG, WebP or PDF file.",
    }
  }
  return { ok: true, buffer, mime, filename: cleanDesignFilename(filename, mime) }
}
