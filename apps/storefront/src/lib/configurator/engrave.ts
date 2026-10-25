/**
 * Photo → laser-engraving look, as pure pixel functions (no DOM) so the tonal
 * mapping is unit-tested and production can regenerate it from the stored
 * params. Output is burn-coloured RGBA whose alpha carries the darkness, so the
 * surface under it (wood, plate) shows through the highlights.
 */

export type EngraveStyle = "photo" | "sketch" | "bold"

export type EngraveParams = {
  enabled: boolean
  style: EngraveStyle
  /** 0..1 */
  contrast: number
  /** 0..1 — sharpening (photo/bold) or line weight (sketch). */
  detail: number
  /** 0..1 — how far the edges fade into the surface. */
  fade: number
}

export const ENGRAVE_STYLES: { id: EngraveStyle; label: string }[] = [
  { id: "photo", label: "Photo" },
  { id: "sketch", label: "Sketch" },
  { id: "bold", label: "Bold" },
]

export const DEFAULT_ENGRAVE: EngraveParams = { enabled: true, style: "photo", contrast: 0.5, detail: 0.5, fade: 0.35 }

/** Longest edge the effect works at (and the size stored with a design). */
export const ENGRAVE_WORKING_EDGE = 720
/** Uploads above this are refused rather than decoded. */
export const MAX_UPLOAD_PIXELS = 12_000_000

/** Light burn → deep burn; highlights are fully transparent. */
const BURN_LIGHT: [number, number, number] = [122, 74, 42]
const BURN_DEEP: [number, number, number] = [59, 36, 20]

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export function sanitizeEngrave(value: unknown): EngraveParams {
  const v = (value && typeof value === "object" ? value : {}) as Partial<EngraveParams>
  const num = (n: unknown, fallback: number) => (typeof n === "number" && Number.isFinite(n) ? clamp01(n) : fallback)
  return {
    enabled: typeof v.enabled === "boolean" ? v.enabled : DEFAULT_ENGRAVE.enabled,
    style: ENGRAVE_STYLES.some((s) => s.id === v.style) ? (v.style as EngraveStyle) : DEFAULT_ENGRAVE.style,
    contrast: num(v.contrast, DEFAULT_ENGRAVE.contrast),
    detail: num(v.detail, DEFAULT_ENGRAVE.detail),
    fade: num(v.fade, DEFAULT_ENGRAVE.fade),
  }
}

/** Scales (w, h) down so the longest edge is at most `maxEdge`. */
export function fitWithin(w: number, h: number, maxEdge: number) {
  const s = Math.min(1, maxEdge / Math.max(w, h))
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) }
}

/** Rec. 709 luminance 0..1; transparent pixels count as white (nothing to burn). */
export function toLuminance(rgba: ArrayLike<number>, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const a = rgba[i * 4 + 3] / 255
    const l = (0.2126 * rgba[i * 4] + 0.7152 * rgba[i * 4 + 1] + 0.0722 * rgba[i * 4 + 2]) / 255
    out[i] = l * a + (1 - a)
  }
  return out
}

/** Stretches the lum range so the `clip` darkest/lightest fraction hits 0 and 1. */
export function autoLevels(lum: Float32Array, clip = 0.01): Float32Array {
  const bins = new Uint32Array(256)
  for (const v of lum) bins[Math.round(clamp01(v) * 255)]++
  const target = lum.length * clip
  let lo = 0
  for (let acc = 0; lo < 255 && acc + bins[lo] <= target; lo++) acc += bins[lo]
  let hi = 255
  for (let acc = 0; hi > 0 && acc + bins[hi] <= target; hi--) acc += bins[hi]
  const out = new Float32Array(lum.length)
  if (hi <= lo) {
    out.set(lum)
    return out
  }
  const low = lo / 255
  const span = (hi - lo) / 255
  for (let i = 0; i < lum.length; i++) out[i] = clamp01((lum[i] - low) / span)
  return out
}

function boxBlur(src: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(src.length)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= h) continue
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= w) continue
          sum += src[yy * w + xx]
          n++
        }
      }
      out[y * w + x] = sum / n
    }
  }
  return out
}

/** Unsharp mask: emphasises the fine detail a laser picks out. */
export function sharpen(lum: Float32Array, w: number, h: number, amount: number): Float32Array {
  if (amount <= 0) return lum
  const blur = boxBlur(lum, w, h)
  const out = new Float32Array(lum.length)
  for (let i = 0; i < lum.length; i++) out[i] = clamp01(lum[i] + amount * (lum[i] - blur[i]))
  return out
}

/** Sobel gradient magnitude, normalised to 0..1. */
export function edges(lum: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(lum.length)
  const at = (x: number, y: number) => lum[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))]
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)
      out[y * w + x] = Math.min(1, Math.hypot(gx, gy) / 4)
    }
  }
  return out
}

/** Contrast curve around mid-grey; 0.5 is neutral-ish, 1 is punchy. */
export function contrastCurve(t: number, contrast: number): number {
  const k = 0.6 + contrast * 1.6
  return clamp01(0.5 + (t - 0.5) * k)
}

/** 1 in the middle, easing to 0 at the edges (elliptical), so the photo melts into the surface. */
export function edgeFade(x: number, y: number, w: number, h: number, fade: number): number {
  if (fade <= 0) return 1
  const nx = (x + 0.5) / w - 0.5
  const ny = (y + 0.5) / h - 0.5
  const r = Math.hypot(nx, ny) * 2 // 0 centre, ~1 at the edge midpoints
  const inner = 1 - fade * 0.9
  if (r <= inner) return 1
  const outer = Math.max(inner + 0.01, 1.05)
  const t = clamp01((r - inner) / (outer - inner))
  return 1 - t * t * (3 - 2 * t)
}

/** Burn tone (0 = untouched, 1 = deepest burn) → RGBA. */
export function burnColor(tone: number): [number, number, number, number] {
  const t = clamp01(tone)
  const mix = clamp01((t - 0.35) / 0.65)
  return [
    Math.round(BURN_LIGHT[0] + (BURN_DEEP[0] - BURN_LIGHT[0]) * mix),
    Math.round(BURN_LIGHT[1] + (BURN_DEEP[1] - BURN_LIGHT[1]) * mix),
    Math.round(BURN_LIGHT[2] + (BURN_DEEP[2] - BURN_LIGHT[2]) * mix),
    Math.round(255 * Math.min(0.97, t * 1.05)),
  ]
}

/** Deterministic per-pixel noise in [-0.5, 0.5): the fine grain of a burned dot pattern. */
export function grainNoise(x: number, y: number): number {
  let n = (x * 374761393 + y * 668265263) | 0
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296 - 0.5
}

/** Burn tone per pixel (0..1) for the given style. */
export function engraveTones(rgba: ArrayLike<number>, w: number, h: number, params: EngraveParams): Float32Array {
  const lum = autoLevels(toLuminance(rgba, w, h))
  const tones = new Float32Array(w * h)
  if (params.style === "sketch") {
    const soft = sharpen(lum, w, h, 0.5)
    const e = edges(soft, w, h)
    const gain = 1.2 + params.detail * 3
    for (let i = 0; i < tones.length; i++) {
      const line = clamp01(e[i] * gain)
      tones[i] = Math.max(contrastCurve(line, params.contrast), (1 - soft[i]) * 0.22)
    }
  } else {
    const sharp = sharpen(lum, w, h, params.detail * 1.6)
    const bold = params.style === "bold"
    for (let i = 0; i < tones.length; i++) {
      const dark = 1 - sharp[i]
      if (bold) {
        const width = 0.22 - params.contrast * 0.17
        const t = clamp01((dark - (0.5 - width)) / (2 * width))
        tones[i] = t * t * (3 - 2 * t)
      } else {
        tones[i] = contrastCurve(Math.pow(dark, 1.15 - params.contrast * 0.4), params.contrast)
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      tones[i] = clamp01(tones[i] * edgeFade(x, y, w, h, params.fade) + grainNoise(x, y) * 0.07 * (tones[i] > 0.02 ? 1 : 0))
    }
  }
  return tones
}

/** Full pipeline: source RGBA → burn-coloured RGBA (same size). Disabled returns a copy. */
export function engravePixels(rgba: ArrayLike<number>, w: number, h: number, params: EngraveParams): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4)
  if (!params.enabled) {
    for (let i = 0; i < out.length; i++) out[i] = rgba[i]
    return out
  }
  const tones = engraveTones(rgba, w, h, params)
  for (let i = 0; i < tones.length; i++) {
    const [r, g, b, a] = burnColor(tones[i])
    out[i * 4] = r
    out[i * 4 + 1] = g
    out[i * 4 + 2] = b
    // Shallow emboss: burned pixels next to lighter ones above read as recessed.
    const above = i >= w ? tones[i - w] : tones[i]
    const depth = Math.max(0, tones[i] - above) * 40
    out[i * 4 + 3] = Math.min(255, Math.round(a * (rgba[i * 4 + 3] / 255) + depth))
  }
  return out
}
