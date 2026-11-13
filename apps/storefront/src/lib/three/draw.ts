/**
 * Canvas-2D drawing routines behind the procedural textures. Kept free of
 * three.js so UI (e.g. configurator swatches) can paint the same surfaces
 * without pulling the WebGL bundle.
 */

export function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Wavy vertical grain lines over a flat base colour. */
export function drawWood(
  ctx: CanvasRenderingContext2D,
  s: number,
  base: string,
  dark: string,
  light: string,
  seed: number,
) {
  const random = rng(seed)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, s, s)
  for (let i = 0; i < 320; i++) {
    const x0 = random() * s
    const amp = 2 + random() * 12
    const f = 0.01 + random() * 0.03
    const ph = random() * 6.28
    ctx.strokeStyle = random() > 0.5 ? dark : light
    ctx.globalAlpha = 0.04 + random() * 0.16
    ctx.lineWidth = 0.5 + random() * 2.8
    ctx.beginPath()
    for (let y = 0; y <= s; y += 8) {
      const x = x0 + Math.sin(y * f + ph) * amp
      if (y === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}
