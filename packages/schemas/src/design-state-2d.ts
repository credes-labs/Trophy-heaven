import { z } from "zod"
import { zId } from "./shared.js"

/** Material overlays available for the 2D base preview (see FR-2D-7). */
export const Material2D = z.enum([
  "gold",
  "silver",
  "bronze",
  "rose_gold",
  "matte_black",
  "acrylic",
])
export type Material2D = z.infer<typeof Material2D>

/** A text object on the 2D canvas (Fabric.js-compatible, see docs/kit/06 §6.7). */
export const Text2DObject = z.object({
  type: z.literal("text"),
  id: zId,
  text: z.string(),
  fontFamily: z.string(),
  fontSize: z.number().positive(),
  fill: z.string(), // hex/oklch
  fontWeight: z.enum(["normal", "bold"]).default("normal"),
  fontStyle: z.enum(["normal", "italic"]).default("normal"),
  underline: z.boolean().default(false),
  textAlign: z.enum(["left", "center", "right"]).default("center"),
  charSpacing: z.number().default(0),
  lineHeight: z.number().default(1.16),
  curve: z.object({ enabled: z.boolean(), radius: z.number() }).optional(),
  shadow: z.string().nullable().optional(),
  stroke: z.object({ color: z.string(), width: z.number() }).nullable().optional(),
  left: z.number(),
  top: z.number(),
  angle: z.number().default(0),
  scaleX: z.number().default(1),
  scaleY: z.number().default(1),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
})
export type Text2DObject = z.infer<typeof Text2DObject>

/** An uploaded logo/image object on the 2D canvas (see docs/kit/06 §6.7). */
export const Image2DObject = z.object({
  type: z.literal("image"),
  id: zId,
  src: z.string().url(), // stored logo URL
  originalFormat: z.enum(["png", "jpg", "svg"]),
  left: z.number(),
  top: z.number(),
  angle: z.number().default(0),
  scaleX: z.number().default(1),
  scaleY: z.number().default(1),
  opacity: z.number().min(0).max(1).default(1),
  lockAspectRatio: z.boolean().default(true),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
})
export type Image2DObject = z.infer<typeof Image2DObject>

/** A serialized 2D design (see docs/kit/06 §6.7). */
export const Design2DState = z.object({
  version: z.literal(1),
  canvas: z.object({
    width: z.number(),
    height: z.number(),
    background: z.string().nullable(),
  }),
  baseImageUrl: z.string().url().nullable(), // trophy base preview
  materialOverlay: Material2D.nullable(),
  engravingSafeArea: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  objects: z.array(z.discriminatedUnion("type", [Text2DObject, Image2DObject])),
})
export type Design2DState = z.infer<typeof Design2DState>
