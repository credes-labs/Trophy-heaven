import { SAMPLE_LINES, type AlignId, type EmblemId, type FontSpec, type LineKey } from "./plaque"

/** Engraving canvas size; matches the plate's aspect (shapes.PLATE_ASPECT). */
export const ENGRAVING_W = 1024
export const ENGRAVING_H = 576

/** Resolves a next/font CSS variable (e.g. --font-playfair) to a canvas-usable family stack. */
export function resolveFontFamily(cssVar: string): string {
  if (typeof document === "undefined") return "serif"
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return value || "serif"
}

export function fontShorthand(font: FontSpec, family: string, px: number, weight = font.weight) {
  return `${font.style} ${weight} ${px}px ${family}`
}

/** Waits for the faces the engraving uses so the first draw isn't in a fallback font. */
export async function loadEngravingFonts(font: FontSpec, family: string): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return
  await Promise.all([
    document.fonts.load(fontShorthand(font, family, 64)),
    document.fonts.load(fontShorthand(font, family, 64, 500)),
  ]).catch(() => undefined)
}

type Row = { key: LineKey; y: number; px: number; caps: boolean; tracking: number }

const ROWS: Row[] = [
  { key: "title", y: 0.24, px: 44, caps: true, tracking: 0.18 },
  { key: "name", y: 0.5, px: 96, caps: false, tracking: 0 },
  { key: "detail", y: 0.8, px: 40, caps: false, tracking: 0.04 },
]

/**
 * Lays the three engraving lines out on a transparent canvas in the ink colour.
 * Empty lines fall back to faint sample copy so the layout reads.
 */
export function drawEngraving(
  ctx: CanvasRenderingContext2D,
  lines: Record<LineKey, string>,
  font: FontSpec,
  family: string,
  ink: string,
  options: { align?: AlignId; widthRatio?: number } = {},
) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  const scale = w / ENGRAVING_W
  const ratio = options.widthRatio ?? 0.86
  const maxWidth = w * ratio
  const left = options.align === "left"
  const x = left ? (w * (1 - ratio)) / 2 : w / 2
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = ink
  ctx.strokeStyle = ink
  ctx.textAlign = left ? "left" : "center"
  ctx.textBaseline = "middle"

  for (const row of ROWS) {
    const real = lines[row.key]
    const text = real || SAMPLE_LINES[row.key]
    const upper = row.caps || font.caps ? text.toUpperCase() : text
    let px = row.px * scale
    const weight = row.key === "name" ? font.weight : 400
    const tracking = row.caps || font.caps ? Math.max(row.tracking, 0.08) : row.tracking
    for (;;) {
      ctx.font = fontShorthand(font, family, px, weight)
      ctx.letterSpacing = `${(px * tracking).toFixed(1)}px`
      if (ctx.measureText(upper).width <= maxWidth || px <= 12 * scale) break
      px *= 0.94
    }
    ctx.globalAlpha = real ? 1 : 0.24
    ctx.fillText(upper, x, h * row.y)
  }

  ctx.globalAlpha = 0.55
  ctx.lineWidth = 2 * scale
  ctx.beginPath()
  const ruleStart = left ? x : w / 2 - 70 * scale
  ctx.moveTo(ruleStart, h * 0.67)
  ctx.lineTo(ruleStart + 140 * scale, h * 0.67)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.letterSpacing = "0px"
}

/** Draws a 2D-editor layout (transparent PNG) contain-fitted inside the plate's text width. */
export function drawLayout(ctx: CanvasRenderingContext2D, image: CanvasImageSource & { width: number; height: number }, widthRatio = 0.86) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.clearRect(0, 0, w, h)
  const boxW = w * widthRatio
  const boxH = h * 0.86
  const scale = Math.min(boxW / image.width, boxH / image.height)
  const dw = image.width * scale
  const dh = image.height * scale
  ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

/** Emblem motif on a square transparent canvas: laurel wreath, star or monogram. */
export function drawEmblem(
  ctx: CanvasRenderingContext2D,
  kind: Exclude<EmblemId, "none">,
  ink: string,
  initials: string,
  family: string,
) {
  const s = ctx.canvas.width
  const c = s / 2
  ctx.clearRect(0, 0, s, s)
  ctx.fillStyle = ink
  ctx.strokeStyle = ink

  if (kind === "star") {
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? s * 0.16 : s * 0.38
      const a = -Math.PI / 2 + (i * Math.PI) / 5
      ctx.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fill()
    return
  }

  if (kind === "monogram") {
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = `italic 500 ${s * (initials.length > 1 ? 0.4 : 0.52)}px ${family}`
    ctx.fillText(initials, c, c + s * 0.02)
    ctx.lineWidth = s * 0.018
    ctx.beginPath()
    ctx.arc(c, c, s * 0.42, 0, Math.PI * 2)
    ctx.stroke()
    return
  }

  // Laurel: two arcs of leaves meeting under a small knot.
  const radius = s * 0.34
  ctx.lineWidth = s * 0.02
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(c, c, radius, Math.PI / 2 + side * 0.25, Math.PI / 2 + side * 2.6, side < 0)
    ctx.stroke()
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 + side * (0.45 + i * 0.32)
      const x = c + Math.cos(a) * radius
      const y = c + Math.sin(a) * radius
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(a + (side > 0 ? Math.PI * 0.85 : Math.PI * 0.15))
      ctx.beginPath()
      ctx.ellipse(0, 0, s * 0.075, s * 0.03, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
  ctx.beginPath()
  ctx.arc(c, c + radius, s * 0.028, 0, Math.PI * 2)
  ctx.fill()
}
