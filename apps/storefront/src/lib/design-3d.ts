import type { Design3DState, Material3D, Material2D } from "@legacy-crafts/schemas"

/** The six selectable trophy bases (FR-3D-2). `modelUrl` is used when a GLB
 * asset exists; otherwise the viewer renders procedural geometry of `shape`. */
export type TrophyBase = {
  id: string
  label: string
  shape: "cup" | "star" | "column" | "obelisk" | "plaque" | "globe"
  modelUrl?: string
}

export const TROPHY_BASES: TrophyBase[] = [
  { id: "classic-cup", label: "Classic Cup", shape: "cup" },
  { id: "rising-star", label: "Rising Star", shape: "star" },
  { id: "grand-column", label: "Grand Column", shape: "column" },
  { id: "obelisk", label: "Crystal Obelisk", shape: "obelisk" },
  { id: "wall-plaque", label: "Wall Plaque", shape: "plaque" },
  { id: "world-globe", label: "World Globe", shape: "globe" },
]

export function getBase(id: string): TrophyBase {
  return TROPHY_BASES.find((b) => b.id === id) ?? TROPHY_BASES[0]
}

/** PBR parameters for each 3D material (FR-3D-4). */
export const MATERIALS_3D: Record<
  Material3D,
  { label: string; color: string; metalness: number; roughness: number; transmission?: number }
> = {
  polished_gold: { label: "Polished Gold", color: "#d4af37", metalness: 1, roughness: 0.12 },
  brushed_silver: { label: "Brushed Silver", color: "#c7ccd1", metalness: 1, roughness: 0.35 },
  antique_bronze: { label: "Antique Bronze", color: "#cd7f32", metalness: 0.9, roughness: 0.45 },
  matte_black: { label: "Matte Black", color: "#1e1e1e", metalness: 0.2, roughness: 0.8 },
  clear_crystal: { label: "Clear Crystal", color: "#eaf6ff", metalness: 0, roughness: 0.03, transmission: 0.9 },
  white_acrylic: { label: "White Acrylic", color: "#f4f6f8", metalness: 0, roughness: 0.5 },
  rose_gold: { label: "Rose Gold", color: "#b76e79", metalness: 1, roughness: 0.18 },
}

export const MATERIAL_3D_OPTIONS = Object.entries(MATERIALS_3D).map(([value, m]) => ({
  value: value as Material3D,
  ...m,
}))

/** Geometry detail per LOD level (FR-3D-2/FR-3D-11). */
export const LOD_SEGMENTS: Record<"high" | "low", number> = { high: 64, low: 16 }

/** Maps a 2D material choice onto the closest 3D PBR material and back, for the
 * 2D<->3D shared-state sync (docs/kit/14 §E envelope). */
const MATERIAL_2D_TO_3D: Record<Material2D, Material3D> = {
  gold: "polished_gold",
  silver: "brushed_silver",
  bronze: "antique_bronze",
  rose_gold: "rose_gold",
  matte_black: "matte_black",
  acrylic: "white_acrylic",
}
const MATERIAL_3D_TO_2D: Record<Material3D, Material2D> = {
  polished_gold: "gold",
  brushed_silver: "silver",
  antique_bronze: "bronze",
  matte_black: "matte_black",
  clear_crystal: "acrylic",
  white_acrylic: "acrylic",
  rose_gold: "rose_gold",
}

export function material2DTo3D(m: Material2D | null | undefined): Material3D {
  return m ? MATERIAL_2D_TO_3D[m] : "polished_gold"
}
export function material3DTo2D(m: Material3D): Material2D {
  return MATERIAL_3D_TO_2D[m]
}

export type Editor3DValues = {
  baseModelId: string
  material: Material3D
  environment: "studio" | "none"
  engravingText: string
  engravingFont: string
  logoUrl: string | null
  lod: "auto" | "high" | "low"
}

export function buildDesign3DState(v: Editor3DValues): Design3DState {
  return {
    version: 1,
    baseModelId: v.baseModelId,
    lod: v.lod,
    material: v.material,
    environment: v.environment,
    engraving: v.engravingText.trim()
      ? {
          text: v.engravingText,
          fontFamily: v.engravingFont,
          method: "texture",
          surfaceAnchor: "front",
        }
      : null,
    logo: v.logoUrl
      ? { src: v.logoUrl, surfaceAnchor: "front", scale: 1, rotation: 0 }
      : null,
  }
}

export function editorValuesFromState(state: Design3DState): Editor3DValues {
  return {
    baseModelId: state.baseModelId,
    material: state.material,
    environment: state.environment ?? "studio",
    engravingText: state.engraving?.text ?? "",
    engravingFont: state.engraving?.fontFamily ?? "Cinzel",
    logoUrl: state.logo?.src ?? null,
    lod: state.lod ?? "auto",
  }
}

export const MAX_3D_ENGRAVING_CHARS = 60

export function validateDesign3D(state: Design3DState): string[] {
  const errors: string[] = []
  if (state.engraving && state.engraving.text.length > MAX_3D_ENGRAVING_CHARS) {
    errors.push(`Engraving exceeds ${MAX_3D_ENGRAVING_CHARS} characters.`)
  }
  if (!TROPHY_BASES.some((b) => b.id === state.baseModelId)) {
    errors.push("Select a trophy base.")
  }
  return errors
}
