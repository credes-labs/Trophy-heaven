import { z } from "zod"

/** PBR material choices for the 3D viewer (see FR-3D-4). */
export const Material3D = z.enum([
  "polished_gold",
  "brushed_silver",
  "antique_bronze",
  "matte_black",
  "clear_crystal",
  "white_acrylic",
  "rose_gold",
])
export type Material3D = z.infer<typeof Material3D>

/**
 * A serialized 3D design (see docs/kit/06 §6.8). Captures user choices, not the
 * full mesh — models live in S3/R2 and the viewer reconstructs the scene from this.
 */
export const Design3DState = z.object({
  version: z.literal(1),
  baseModelId: z.string(), // maps to /3d-models/{...}/model.glb
  lod: z.enum(["auto", "high", "low"]).default("auto"),
  material: Material3D,
  environment: z.enum(["studio", "none"]).default("studio"),
  engraving: z
    .object({
      text: z.string(),
      fontFamily: z.string(),
      method: z.enum(["texture", "extrusion"]).default("texture"),
      surfaceAnchor: z.string(), // named UV region / mesh part
    })
    .nullable(),
  logo: z
    .object({
      src: z.string().url(),
      surfaceAnchor: z.string(),
      scale: z.number().default(1),
      rotation: z.number().default(0),
    })
    .nullable(),
  camera: z
    .object({
      position: z.tuple([z.number(), z.number(), z.number()]),
      target: z.tuple([z.number(), z.number(), z.number()]),
    })
    .optional(),
  lighting: z
    .object({
      ambient: z.number().default(0.6),
      directional: z.number().default(1.0),
    })
    .optional(),
})
export type Design3DState = z.infer<typeof Design3DState>
