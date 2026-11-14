import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"

/** A customer file stored by Medusa and recorded on cart or line-item metadata. */
export type DesignFile = {
  url: string
  filename: string
  mime_type: string
  size: number
}

/**
 * `design`: artwork for one piece (product page, configurator, cart line).
 * `document`: order-wide files from the cart, which may also be office documents.
 * Mirrors apps/medusa/src/lib/design-upload.ts, which re-checks the bytes.
 */
export type UploadKind = "design" | "document"

export const DESIGN_UPLOAD_MAX_BYTES = 10 * 1024 * 1024
/** Most order-wide files a cart can carry. */
export const ORDER_DOCUMENTS_MAX = 10

const DESIGN_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "pdf"]
const DOCUMENT_EXTENSIONS = [
  ...DESIGN_EXTENSIONS,
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "txt",
]

const EXTENSIONS: Record<UploadKind, string[]> = {
  design: DESIGN_EXTENSIONS,
  document: DOCUMENT_EXTENSIONS,
}

/** `accept` attribute for a file input of this kind. */
export function uploadAccept(kind: UploadKind): string {
  const exts = EXTENSIONS[kind].map((e) => `.${e}`)
  const mimes = ["image/png", "image/jpeg", "image/webp", "application/pdf"]
  return [...mimes, ...exts].join(",")
}

export const UPLOAD_HINT: Record<UploadKind, string> = {
  design: "PNG, JPG, WebP or PDF, up to 10 MB.",
  document: "Images, PDF, Word, Excel, PowerPoint, CSV or text, up to 10 MB each.",
}

/** Cart metadata keys. Line items use `LINE_DESIGN_KEY`; order-wide files live on the cart. */
export const ORDER_DOCUMENTS_KEY = "order_documents"
/** Older single order-wide file and notes; still read so existing carts keep them. */
export const ORDER_DESIGN_KEY = "order_design_file"
export const ORDER_DESIGN_NOTES_KEY = "order_design_notes"
export const LINE_DESIGN_KEY = "design_upload"
/** Older free-text sticker brief on a line; still shown on existing cart items. */
export const STICKER_DESIGN_KEY = "sticker_design"

function extensionOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name)
  return m ? m[1].toLowerCase() : ""
}

export function designUploadError(file: File, kind: UploadKind = "design"): string | null {
  if (!EXTENSIONS[kind].includes(extensionOf(file.name))) return `Upload ${UPLOAD_HINT[kind]}`
  if (file.size > DESIGN_UPLOAD_MAX_BYTES) return "Files can be up to 10 MB."
  if (file.size === 0) return "That file is empty."
  return null
}

/** Reads metadata written by the cart; "" (a cleared key) and malformed values read as none. */
export function readDesignFile(value: unknown): DesignFile | null {
  if (!value || typeof value !== "object") return null
  const v = value as Partial<DesignFile>
  return typeof v.url === "string" && v.url && typeof v.filename === "string"
    ? (v as DesignFile)
    : null
}

/** Order-wide files on the cart: the list, plus the older single file if present. */
export function readOrderDocuments(meta: Record<string, unknown> | null | undefined): DesignFile[] {
  const list = meta?.[ORDER_DOCUMENTS_KEY]
  const files = (Array.isArray(list) ? list : []).map(readDesignFile).filter(Boolean) as DesignFile[]
  const legacy = readDesignFile(meta?.[ORDER_DESIGN_KEY])
  return legacy ? [...files, legacy] : files
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^;]*;base64,/, ""))
    reader.onerror = () => reject(new Error("Could not read that file."))
    reader.readAsDataURL(file)
  })
}

export async function uploadDesignFile(file: File, kind: UploadKind = "design"): Promise<DesignFile> {
  const invalid = designUploadError(file, kind)
  if (invalid) throw new Error(invalid)
  const data = await fileToBase64(file)
  const res = await fetch(`${BACKEND_URL}/store/design-uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-publishable-api-key": PUBLISHABLE_KEY },
    body: JSON.stringify({ filename: file.name, data, kind }),
  })
  const body = (await res.json().catch(() => ({}))) as {
    file?: DesignFile
    error?: { message?: string }
  }
  if (!res.ok || !body.file) {
    throw new Error(body.error?.message ?? "Upload failed. Please try again.")
  }
  return body.file
}
