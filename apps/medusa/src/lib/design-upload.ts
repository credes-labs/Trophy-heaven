/**
 * Validation for customer uploads that travel with an order: a design on a product
 * (images or PDF) or order-wide files from the cart (designs plus office documents
 * and spreadsheets). Pure so it can be unit tested without Medusa.
 */
export const DESIGN_UPLOAD_MAX_BYTES = 10 * 1024 * 1024

/** `design`: artwork for one piece. `document`: any file for the whole order. */
export type UploadKind = "design" | "document"

export const DESIGN_UPLOAD_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const

export const DOCUMENT_UPLOAD_TYPES = {
  ...DESIGN_UPLOAD_TYPES,
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/csv": "csv",
  "text/plain": "txt",
} as const

export type DesignUploadMime = keyof typeof DESIGN_UPLOAD_TYPES
export type UploadMime = keyof typeof DOCUMENT_UPLOAD_TYPES

const BY_EXTENSION: Record<string, UploadMime> = Object.fromEntries(
  Object.entries(DOCUMENT_UPLOAD_TYPES).map(([mime, ext]) => [ext, mime as UploadMime])
)
BY_EXTENSION.jpeg = "image/jpeg"

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((b, i) => buf[offset + i] === b)
}

function extensionOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name.trim())
  return m ? m[1].toLowerCase() : ""
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

/**
 * Office and text formats. The bytes decide the family (OOXML zip, legacy OLE
 * compound file, or plain text) and the extension picks the type within it, so a
 * renamed executable or archive is still rejected.
 */
export function sniffDocumentMime(buf: Buffer, filename: string): UploadMime | null {
  const design = sniffDesignMime(buf)
  if (design) return design
  const ext = extensionOf(filename)
  const isZip = startsWith(buf, [0x50, 0x4b, 0x03, 0x04])
  if (isZip && ["docx", "xlsx", "pptx"].includes(ext)) {
    // Every OOXML package lists its parts in [Content_Types].xml.
    return buf.includes("[Content_Types].xml") ? BY_EXTENSION[ext] : null
  }
  const isOle = startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
  if (isOle && ["doc", "xls", "ppt"].includes(ext)) return BY_EXTENSION[ext]
  if (["csv", "txt"].includes(ext) && !isZip && !isOle) {
    // Text only: no NUL bytes in the sample.
    return buf.subarray(0, 8192).includes(0) ? null : BY_EXTENSION[ext]
  }
  return null
}

export type DesignUploadCheck =
  | { ok: true; buffer: Buffer; mime: UploadMime; filename: string }
  | { ok: false; code: "EMPTY" | "TOO_LARGE" | "UNSUPPORTED_TYPE"; message: string }

/** Safe display filename: base name only, limited charset, forced extension. */
export function cleanDesignFilename(name: string, mime: UploadMime): string {
  const base = name.split(/[\\/]/).pop() ?? "design"
  const stem = base.replace(/\.[^.]*$/, "").replace(/[^\w\- ]+/g, "").trim().slice(0, 60) || "design"
  return `${stem}.${DOCUMENT_UPLOAD_TYPES[mime]}`
}

const TYPE_MESSAGE: Record<UploadKind, string> = {
  design: "Upload a PNG, JPG, WebP or PDF file.",
  document: "Upload an image, PDF, Word, Excel, PowerPoint, CSV or text file.",
}

export function checkDesignUpload(
  base64: string,
  filename: string,
  kind: UploadKind = "design"
): DesignUploadCheck {
  const clean = base64.replace(/^data:[^;]+;base64,/, "")
  const buffer = Buffer.from(clean, "base64")
  if (!buffer.length) return { ok: false, code: "EMPTY", message: "The file is empty." }
  if (buffer.length > DESIGN_UPLOAD_MAX_BYTES) {
    return { ok: false, code: "TOO_LARGE", message: "Files can be up to 10 MB." }
  }
  const mime = kind === "document" ? sniffDocumentMime(buffer, filename) : sniffDesignMime(buffer)
  if (!mime) return { ok: false, code: "UNSUPPORTED_TYPE", message: TYPE_MESSAGE[kind] }
  return { ok: true, buffer, mime, filename: cleanDesignFilename(filename, mime) }
}
