import { SAMPLE_LINES, type FontSpec, type LineKey } from "./plaque"

/** Engraving canvas size; matches the plate's aspect (plateRect: 0.72w × 0.4w). */
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
 * Lays the three engraving lines out on a transparent canvas in the plate's ink
 * colour. Empty lines fall back to faint sample copy so the layout reads.
 */
export function drawEngraving(
  ctx: CanvasRenderingContext2D,
  lines: Record<LineKey, string>,
  font: FontSpec,
  family: string,
  ink: string,
) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  const scale = w / ENGRAVING_W
  const maxWidth = w * 0.86
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = ink
  ctx.strokeStyle = ink
  ctx.textAlign = "center"
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
    ctx.fillText(upper, w / 2, h * row.y)
  }

  ctx.globalAlpha = 0.55
  ctx.lineWidth = 2 * scale
  ctx.beginPath()
  ctx.moveTo(w / 2 - 70 * scale, h * 0.67)
  ctx.lineTo(w / 2 + 70 * scale, h * 0.67)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.letterSpacing = "0px"
}
