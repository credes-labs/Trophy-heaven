import { describe, expect, it } from "vitest"
import {
  DEFAULT_ENGRAVE,
  autoLevels,
  burnColor,
  contrastCurve,
  edgeFade,
  engravePixels,
  fitWithin,
  grainNoise,
  sanitizeEngrave,
  toLuminance,
} from "./engrave"

/** Horizontal ramp image, black on the left to white on the right. */
function ramp(w: number, h: number) {
  const px = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = Math.round((x / (w - 1)) * 255)
      px.set([v, v, v, 255], (y * w + x) * 4)
    }
  }
  return px
}

describe("tonal mapping", () => {
  it("reads luminance and treats transparency as white", () => {
    const lum = toLuminance([0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0], 3, 1)
    expect(Array.from(lum)).toEqual([0, 1, 1])
  })

  it("auto levels stretches a narrow range to 0..1", () => {
    const lum = new Float32Array([0.4, 0.45, 0.5, 0.55, 0.6])
    const out = autoLevels(lum, 0)
    expect(out[0]).toBeCloseTo(0, 2)
    expect(out[4]).toBeCloseTo(1, 2)
    expect(out[2]).toBeCloseTo(0.5, 1)
  })

  it("auto levels leaves a flat image alone", () => {
    const lum = new Float32Array([0.3, 0.3, 0.3])
    expect(Array.from(autoLevels(lum))).toEqual(Array.from(lum))
  })

  it("contrast curve is monotonic and pivots on mid-grey", () => {
    expect(contrastCurve(0.5, 0.9)).toBeCloseTo(0.5)
    expect(contrastCurve(0.7, 1)).toBeGreaterThan(contrastCurve(0.7, 0))
    expect(contrastCurve(0.2, 0.5)).toBeLessThan(contrastCurve(0.4, 0.5))
  })

  it("burn ramp is transparent at zero and a deep opaque brown at full burn", () => {
    expect(burnColor(0)[3]).toBe(0)
    const deep = burnColor(1)
    expect(deep[3]).toBeGreaterThan(240)
    expect(deep[0]).toBeGreaterThan(deep[2])
    expect(burnColor(0.6)[3]).toBeLessThan(deep[3])
  })

  it("edge fade keeps the centre and fades the border", () => {
    expect(edgeFade(50, 50, 100, 100, 0.5)).toBe(1)
    expect(edgeFade(0, 0, 100, 100, 0.5)).toBeLessThan(0.1)
    expect(edgeFade(0, 0, 100, 100, 0)).toBe(1)
  })

  it("grain noise is deterministic and bounded", () => {
    expect(grainNoise(3, 7)).toBe(grainNoise(3, 7))
    for (let i = 0; i < 50; i++) {
      const n = grainNoise(i, i * 3)
      expect(n).toBeGreaterThanOrEqual(-0.5)
      expect(n).toBeLessThan(0.5)
    }
  })
})

describe("engravePixels", () => {
  const w = 32
  const h = 8
  const src = ramp(w, h)
  const params = { ...DEFAULT_ENGRAVE, fade: 0 }

  it("burns dark areas and leaves highlights clear", () => {
    const out = engravePixels(src, w, h, params)
    const row = 4 * w * 4
    const darkAlpha = out[row + 1 * 4 + 3]
    const lightAlpha = out[row + (w - 2) * 4 + 3]
    expect(darkAlpha).toBeGreaterThan(180)
    expect(lightAlpha).toBeLessThan(40)
  })

  it("is a copy when disabled", () => {
    const out = engravePixels(src, w, h, { ...params, enabled: false })
    expect(Array.from(out)).toEqual(Array.from(src))
  })

  it("every style produces burn colours (red ≥ blue) of the same size", () => {
    for (const style of ["photo", "sketch", "bold"] as const) {
      const out = engravePixels(src, w, h, { ...params, style })
      expect(out.length).toBe(src.length)
      expect(out[4 * w * 4 + 4]).toBeGreaterThanOrEqual(out[4 * w * 4 + 6])
    }
  })
})

describe("helpers", () => {
  it("fits large photos inside the working edge", () => {
    expect(fitWithin(4000, 3000, 720)).toEqual({ width: 720, height: 540 })
    expect(fitWithin(300, 200, 720)).toEqual({ width: 300, height: 200 })
  })

  it("sanitizes stored params", () => {
    expect(sanitizeEngrave(null)).toEqual(DEFAULT_ENGRAVE)
    expect(sanitizeEngrave({ style: "neon", contrast: 4, enabled: false })).toMatchObject({
      style: "photo",
      contrast: 1,
      enabled: false,
    })
  })
})
