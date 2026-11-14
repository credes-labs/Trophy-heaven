/**
 * Collects the customer files attached to an order (copied from cart and line-item
 * metadata by the storefront) and renders the owner's new-order email. Pure so it
 * can be unit tested. Metadata keys mirror apps/storefront/src/lib/design-uploads.ts.
 */
export const ORDER_DOCUMENTS_KEY = "order_documents"
export const ORDER_DESIGN_KEY = "order_design_file"
export const ORDER_DESIGN_NOTES_KEY = "order_design_notes"
export const LINE_DESIGN_KEY = "design_upload"
export const STICKER_DESIGN_KEY = "sticker_design"

export type OrderFile = { url: string; filename: string; mime_type?: string; size?: number }
export type AttachedFile = OrderFile & { scope: string }

type Meta = Record<string, unknown> | null | undefined
type ItemLike = { title?: string | null; quantity?: unknown; metadata?: Meta }

function asFile(value: unknown): OrderFile | null {
  if (!value || typeof value !== "object") return null
  const v = value as Partial<OrderFile>
  return typeof v.url === "string" && /^https?:\/\//.test(v.url) && typeof v.filename === "string"
    ? { url: v.url, filename: v.filename, mime_type: v.mime_type, size: v.size }
    : null
}

/** Every file on the order: order-wide documents first, then each item's design. */
export function collectOrderFiles(orderMeta: Meta, items: ItemLike[] = []): AttachedFile[] {
  const files: AttachedFile[] = []
  const docs = orderMeta?.[ORDER_DOCUMENTS_KEY]
  for (const d of Array.isArray(docs) ? docs : []) {
    const f = asFile(d)
    if (f) files.push({ ...f, scope: "Whole order" })
  }
  const legacy = asFile(orderMeta?.[ORDER_DESIGN_KEY])
  if (legacy) files.push({ ...legacy, scope: "Whole order" })
  for (const item of items) {
    const f = asFile(item.metadata?.[LINE_DESIGN_KEY])
    if (f) files.push({ ...f, scope: item.title ?? "Item" })
  }
  return files
}

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  )
}

function kb(size?: number): string {
  if (!size) return ""
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`
}

export function renderOwnerOrderEmail(input: {
  orderRef: string | number
  email?: string | null
  total?: unknown
  currency?: string | null
  items: ItemLike[]
  files: AttachedFile[]
  notes?: string | null
}): { subject: string; html: string } {
  const { orderRef, files } = input
  const subject = `New order #${orderRef}${files.length ? ` with ${files.length} customer file${files.length === 1 ? "" : "s"}` : ""}`
  const itemRows = input.items
    .map((i) => {
      const sticker = i.metadata?.[STICKER_DESIGN_KEY]
      return `<li>${esc(i.title)} × ${esc(i.quantity)}${
        typeof sticker === "string" && sticker ? `<br><small>Sticker: ${esc(sticker)}</small>` : ""
      }</li>`
    })
    .join("")
  const fileRows = files.length
    ? `<ul>${files
        .map(
          (f) =>
            `<li><a href="${esc(f.url)}">${esc(f.filename)}</a> <small>(${esc(f.scope)}${
              f.size ? `, ${kb(f.size)}` : ""
            })</small></li>`
        )
        .join("")}</ul>`
    : "<p>No files attached.</p>"
  const html = `<div style="font-family:sans-serif;color:#331207">
<h2>${esc(subject)}</h2>
<p>Customer: ${esc(input.email ?? "—")}<br>Total: ${esc(input.total)} ${esc((input.currency ?? "").toUpperCase())}</p>
<h3>Items</h3><ul>${itemRows}</ul>
<h3>Customer files</h3>${fileRows}
${input.notes ? `<h3>Design notes</h3><p>${esc(input.notes)}</p>` : ""}
</div>`
  return { subject, html }
}
