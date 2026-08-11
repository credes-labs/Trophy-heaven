import type { Design2DState } from "@legacy-crafts/schemas"

/**
 * PreviewGenerationService — renders a Design2DState to an 800×800 preview
 * (FR-DESIGN-6). Uses @napi-rs/canvas when available (prebuilt, no native build)
 * to rasterize to PNG; otherwise falls back to an inline SVG data URL so the
 * flow always yields a usable preview. The 3D preview is a captured screenshot
 * from the R3F viewer (Phase 3) and is uploaded directly.
 */
const DEFAULT_SIZE = 800

export class PreviewGenerationService {
  async renderDesign2D(
    state: Design2DState,
    opts: { width?: number } = {}
  ): Promise<{ buffer: Buffer; contentType: "image/png" } | { dataUrl: string; contentType: "image/svg+xml" }> {
    const size = opts.width ?? DEFAULT_SIZE
    try {
      // Optional dependency — dynamically imported so the flow works without it.
      const canvasMod = await import("@napi-rs/canvas").catch(() => null)
      if (canvasMod) {
        return { buffer: await this.rasterize(canvasMod, state, size), contentType: "image/png" }
      }
    } catch {
      // fall through to SVG
    }
    return { dataUrl: this.toSvgDataUrl(state, size), contentType: "image/svg+xml" }
  }

  private async rasterize(
    canvasMod: {
      createCanvas: (w: number, h: number) => any
      loadImage: (src: string) => Promise<any>
    },
    state: Design2DState,
    size: number
  ): Promise<Buffer> {
    const scale = size / state.canvas.width
    const canvas = canvasMod.createCanvas(size, size)
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = state.canvas.background ?? "#ffffff"
    ctx.fillRect(0, 0, size, size)

    if (state.baseImageUrl) {
      try {
        const img = await canvasMod.loadImage(state.baseImageUrl)
        ctx.drawImage(img, 0, 0, size, size)
      } catch {
        // ignore missing base image
      }
    }

    for (const obj of state.objects) {
      if (!obj.visible) continue
      if (obj.type === "text") {
        ctx.save()
        ctx.translate(obj.left * scale, obj.top * scale)
        ctx.rotate((obj.angle * Math.PI) / 180)
        ctx.fillStyle = obj.fill
        const weight = obj.fontWeight === "bold" ? "bold " : ""
        const style = obj.fontStyle === "italic" ? "italic " : ""
        ctx.font = `${style}${weight}${obj.fontSize * scale}px ${obj.fontFamily}`
        ctx.textAlign = obj.textAlign as CanvasTextAlign
        ctx.fillText(obj.text, 0, 0)
        ctx.restore()
      } else if (obj.type === "image") {
        try {
          const img = await canvasMod.loadImage(obj.src)
          ctx.save()
          ctx.globalAlpha = obj.opacity
          ctx.translate(obj.left * scale, obj.top * scale)
          ctx.rotate((obj.angle * Math.PI) / 180)
          ctx.drawImage(img, 0, 0, img.width * obj.scaleX * scale, img.height * obj.scaleY * scale)
          ctx.restore()
        } catch {
          // ignore missing logo
        }
      }
    }

    return canvas.toBuffer("image/png")
  }

  private toSvgDataUrl(state: Design2DState, size: number): string {
    const scale = size / state.canvas.width
    const texts = state.objects
      .filter((o): o is Extract<Design2DState["objects"][number], { type: "text" }> => o.type === "text")
      .map(
        (t) =>
          `<text x="${t.left * scale}" y="${t.top * scale}" fill="${t.fill}" font-family="${t.fontFamily}" font-size="${t.fontSize * scale}" text-anchor="${t.textAlign === "center" ? "middle" : t.textAlign === "right" ? "end" : "start"}">${escapeXml(t.text)}</text>`
      )
      .join("")
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${state.canvas.background ?? "#ffffff"}"/>${texts}</svg>`
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
  }
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string
  )
}
