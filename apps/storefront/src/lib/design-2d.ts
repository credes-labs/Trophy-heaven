import type { Design2DState, Material2D } from "@trophy-heaven/schemas"

export const CANVAS_SIZE = 800

/** Material overlays (FR-2D-7) with a tint used for the live preview. */
export const MATERIALS_2D: { value: Material2D; label: string; tint: string }[] = [
  { value: "gold", label: "Gold", tint: "#d4af37" },
  { value: "silver", label: "Silver", tint: "#c0c0c0" },
  { value: "bronze", label: "Bronze", tint: "#cd7f32" },
  { value: "rose_gold", label: "Rose Gold", tint: "#b76e79" },
  { value: "matte_black", label: "Matte Black", tint: "#2b2b2b" },
  { value: "acrylic", label: "Acrylic", tint: "#e8f4f8" },
]

export const DEFAULT_SAFE_AREA = { x: 120, y: 300, width: 560, height: 220 }

const MAX_ENGRAVING_CHARS = 120
const MIN_LOGO_DPI = 150

type FabricObjectLike = {
  type?: string
  id?: string
  text?: string
  fontFamily?: string
  fontSize?: number
  fill?: string | unknown
  fontWeight?: string | number
  fontStyle?: string
  textAlign?: string
  left?: number
  top?: number
  angle?: number
  scaleX?: number
  scaleY?: number
  opacity?: number
  visible?: boolean
  src?: string
  width?: number
  height?: number
}

/** Build a schema-valid Design2DState from the Fabric object list + editor meta. */
export function buildDesign2DState(
  objects: FabricObjectLike[],
  meta: { material: Material2D | null; baseImageUrl?: string | null }
): Design2DState {
  return {
    version: 1,
    canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, background: "#ffffff" },
    baseImageUrl: meta.baseImageUrl ?? null,
    materialOverlay: meta.material,
    engravingSafeArea: DEFAULT_SAFE_AREA,
    objects: objects
      .map((o) => {
        const type = o.type?.toLowerCase()
        if (type === "i-text" || type === "itext" || type === "text" || type === "textbox") {
          return {
            type: "text" as const,
            id: o.id ?? crypto.randomUUID(),
            text: o.text ?? "",
            fontFamily: o.fontFamily ?? "Inter",
            fontSize: o.fontSize ?? 40,
            fill: typeof o.fill === "string" ? o.fill : "#1a1a1a",
            fontWeight: (o.fontWeight === "bold" || o.fontWeight === 700 ? "bold" : "normal") as
              "bold" | "normal",
            fontStyle: (o.fontStyle === "italic" ? "italic" : "normal") as "italic" | "normal",
            underline: false,
            textAlign: (["left", "center", "right"].includes(o.textAlign ?? "")
              ? o.textAlign
              : "center") as "left" | "center" | "right",
            charSpacing: 0,
            lineHeight: 1.16,
            left: o.left ?? 0,
            top: o.top ?? 0,
            angle: o.angle ?? 0,
            scaleX: o.scaleX ?? 1,
            scaleY: o.scaleY ?? 1,
            locked: false,
            visible: o.visible ?? true,
          }
        }
        if (type === "image") {
          return {
            type: "image" as const,
            id: o.id ?? crypto.randomUUID(),
            src: o.src ?? "",
            originalFormat: "png" as const,
            left: o.left ?? 0,
            top: o.top ?? 0,
            angle: o.angle ?? 0,
            scaleX: o.scaleX ?? 1,
            scaleY: o.scaleY ?? 1,
            opacity: o.opacity ?? 1,
            lockAspectRatio: true,
            locked: false,
            visible: o.visible ?? true,
          }
        }
        return null
      })
      .filter((o): o is NonNullable<typeof o> => o !== null),
  }
}

/** Client-side validation mirroring the server (FR-2D-9): safe area, chars, DPI. */
export function validateDesign2D(
  state: Design2DState,
  logoMeta?: { naturalWidth: number; displayWidthInches: number }[]
): string[] {
  const errors: string[] = []
  const safe = state.engravingSafeArea

  for (const obj of state.objects) {
    if (obj.type === "text") {
      if (!obj.text.trim()) errors.push("A text layer is empty.")
      if (obj.text.length > MAX_ENGRAVING_CHARS)
        errors.push(`Text exceeds ${MAX_ENGRAVING_CHARS} characters.`)
      const withinX = obj.left >= safe.x && obj.left <= safe.x + safe.width
      const withinY = obj.top >= safe.y && obj.top <= safe.y + safe.height
      if (!withinX || !withinY)
        errors.push(`"${obj.text.slice(0, 16)}…" is outside the engraving safe area.`)
    }
  }

  for (const logo of logoMeta ?? []) {
    const dpi = logo.naturalWidth / Math.max(0.01, logo.displayWidthInches)
    if (dpi < MIN_LOGO_DPI)
      errors.push(`Uploaded logo resolution is low (${Math.round(dpi)} DPI, min ${MIN_LOGO_DPI}).`)
  }

  return errors
}

export { MAX_ENGRAVING_CHARS, MIN_LOGO_DPI }
