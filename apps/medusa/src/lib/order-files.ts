/**
 * Collects the customer files attached to an order (copied from cart and line-item
 * metadata by the storefront) and renders the owner's new-order email. Pure so it
 * can be unit tested. Metadata keys mirror apps/storefront/src/lib/design-uploads.ts.
 */
export const ORDER_DOCUMENTS_KEY = "order_documents"
export const ORDER_DESIGN_KEY = "order_design_file"
export const ORDER_DESIGN_NOTES_KEY = "order_design_notes"
export const LINE_DESIGN_KEY = "design_upload"
export const LINE_DESIGN_PIECES_KEY = "design_pieces"
/** Hard ceiling on image designs per order; mirrors the storefront. */
export const ORDER_DESIGNS_MAX = 50
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

function isImage(file: OrderFile): boolean {
  return file.mime_type?.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.filename)
}

function quantityOf(item: ItemLike): number {
  return Math.max(0, Number(item.quantity ?? 0))
}

/** Image on each piece: explicit `design_pieces`, else the line's image on every piece. */
function piecesOf(item: ItemLike): (OrderFile | null)[] {
  const quantity = quantityOf(item)
  const stored = item.metadata?.[LINE_DESIGN_PIECES_KEY]
  if (Array.isArray(stored)) {
    return Array.from({ length: quantity }, (_, i) => {
      const file = asFile(stored[i])
      return file && isImage(file) ? file : null
    })
  }
  const lineFile = asFile(item.metadata?.[LINE_DESIGN_KEY])
  const design = lineFile && isImage(lineFile) ? lineFile : null
  return Array.from({ length: quantity }, () => design)
}

function orderPool(orderMeta: Meta): OrderFile[] {
  const docs = orderMeta?.[ORDER_DOCUMENTS_KEY]
  const pool = (Array.isArray(docs) ? docs : []).map(asFile).filter((f): f is OrderFile => !!f)
  const legacy = asFile(orderMeta?.[ORDER_DESIGN_KEY])
  return legacy ? [...pool, legacy] : pool
}

/**
 * Why this cart may not complete, or null. Images are designs: no more than the trophies
 * ordered, and each on at least one. PDFs and office files are whole-order documents.
 */
export function checkOrderDesigns(orderMeta: Meta, items: ItemLike[] = []): string | null {
  const designs = new Set(orderPool(orderMeta).filter(isImage).map((f) => f.url))
  const used = new Set<string>()
  let pieces = 0
  for (const item of items) {
    pieces += quantityOf(item)
    for (const file of piecesOf(item)) {
      if (!file) continue
      used.add(file.url)
      designs.add(file.url)
    }
  }
  if (designs.size > Math.min(pieces, ORDER_DESIGNS_MAX)) {
    return `This order has ${designs.size} designs for ${pieces} ${pieces === 1 ? "trophy" : "trophies"}. Remove the extra designs in your cart.`
  }
  const unmatched = [...designs].filter((url) => !used.has(url)).length
  return unmatched
    ? `${unmatched} design${unmatched === 1 ? " is" : "s are"} not matched to a trophy. Match them in your cart.`
    : null
}

/** Every file on the order: whole-order documents first, then each trophy's design. */
export function collectOrderFiles(orderMeta: Meta, items: ItemLike[] = []): AttachedFile[] {
  const files: AttachedFile[] = []
  const mapped = new Set(items.flatMap((item) => piecesOf(item).map((f) => f?.url)))
  for (const f of orderPool(orderMeta)) {
    // Images on a trophy are listed under that trophy below.
    if (!mapped.has(f.url)) files.push({ ...f, scope: "Whole order" })
  }
  for (const item of items) {
    const title = item.title ?? "Item"
    const lineFile = asFile(item.metadata?.[LINE_DESIGN_KEY])
    if (lineFile && !isImage(lineFile)) files.push({ ...lineFile, scope: title })
    const pieces = piecesOf(item)
    const first = pieces[0]
    if (first && pieces.every((f) => f?.url === first.url)) {
      files.push({ ...first, scope: pieces.length > 1 ? `${title}, all ${pieces.length}` : title })
      continue
    }
    pieces.forEach((f, i) => {
      if (f) files.push({ ...f, scope: `${title}, trophy ${i + 1} of ${pieces.length}` })
    })
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
