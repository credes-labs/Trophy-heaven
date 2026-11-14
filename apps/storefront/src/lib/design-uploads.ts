import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"

/** Customer design files attached from the cart (order-wide or per line). */
export type DesignFile = {
  url: string
  filename: string
  mime_type: string
  size: number
}

export const DESIGN_UPLOAD_MAX_BYTES = 10 * 1024 * 1024
export const DESIGN_UPLOAD_ACCEPT = "image/png,image/jpeg,image/webp,application/pdf"
const ALLOWED = new Set(DESIGN_UPLOAD_ACCEPT.split(","))

/** Cart metadata keys. Line items use `LINE_DESIGN_KEY`; the order-wide file and notes live on the cart. */
export const ORDER_DESIGN_KEY = "order_design_file"
export const ORDER_DESIGN_NOTES_KEY = "order_design_notes"
export const LINE_DESIGN_KEY = "design_upload"
export const STICKER_DESIGN_KEY = "sticker_design"

export function designUploadError(file: File): string | null {
  if (!ALLOWED.has(file.type)) return "Upload a PNG, JPG, WebP or PDF file."
  if (file.size > DESIGN_UPLOAD_MAX_BYTES) return "Design files can be up to 10 MB."
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^;]*;base64,/, ""))
    reader.onerror = () => reject(new Error("Could not read that file."))
    reader.readAsDataURL(file)
  })
}

export async function uploadDesignFile(file: File): Promise<DesignFile> {
  const invalid = designUploadError(file)
  if (invalid) throw new Error(invalid)
  const data = await fileToBase64(file)
  const res = await fetch(`${BACKEND_URL}/store/design-uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-publishable-api-key": PUBLISHABLE_KEY },
    body: JSON.stringify({ filename: file.name, data }),
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
