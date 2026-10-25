import type { Design3DState } from "@legacy-crafts/schemas"

/**
 * Option model for the /customize plaque configurator. Pure (no React/three) so
 * the server page, the client panel, the 3D scene, the 2D layout editor and the
 * tests share one whitelist. Every finish is included in the variant price —
 * only size maps to a Medusa variant.
 */

export const PLAQUE_HANDLE = "engraved-wooden-plaque"

export type Option<Id extends string> = { id: Id; label: string }

export const FORMS = [
  { id: "classic", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
  { id: "arch", label: "Arched" },
  { id: "crest", label: "Gothic crest" },
  { id: "octagon", label: "Octagon" },
] as const satisfies readonly Option<string>[]

export const EDGES = [
  { id: "rounded", label: "Rounded" },
  { id: "chamfer", label: "Chamfer" },
  { id: "square", label: "Square" },
] as const satisfies readonly Option<string>[]

export type WoodSpec = Option<string> & {
  /** base / dark grain / light grain — fed to the shared wood drawing routine */
  grain: readonly [string, string, string]
  seed: number
}

export const WOODS = [
  { id: "walnut", label: "Smoked walnut", grain: ["#4a2817", "#24120a", "#8a5a36"], seed: 7 },
  { id: "oak", label: "White oak", grain: ["#c9a679", "#9c7a50", "#e8d3ad"], seed: 13 },
  { id: "teak", label: "Teak", grain: ["#a8763c", "#7f5524", "#e0b87c"], seed: 21 },
  { id: "sheesham", label: "Sheesham", grain: ["#7a3f22", "#3f1c0e", "#b0683e"], seed: 33 },
  { id: "cherry", label: "Cherry", grain: ["#9a4f2f", "#62301b", "#c97a52"], seed: 37 },
  { id: "maple", label: "Maple", grain: ["#e4cfa6", "#c4a87c", "#f4e6c8"], seed: 41 },
  { id: "ebony", label: "Ebonised ash", grain: ["#262019", "#0f0c09", "#4d4237"], seed: 29 },
  { id: "charred", label: "Charred pine", grain: ["#1d1814", "#050403", "#3b2f25"], seed: 45 },
] as const satisfies readonly WoodSpec[]

export const FINISHES = [
  { id: "oil", label: "Matte oil", roughness: 0.72, clearcoat: 0 },
  { id: "satin", label: "Satin lacquer", roughness: 0.5, clearcoat: 0.35 },
  { id: "gloss", label: "High gloss", roughness: 0.3, clearcoat: 1 },
] as const satisfies readonly (Option<string> & { roughness: number; clearcoat: number })[]

export const BORDERS = [
  { id: "none", label: "None" },
  { id: "line", label: "Inlay line" },
  { id: "double", label: "Double rule" },
] as const satisfies readonly Option<string>[]

export type PlateSpec = Option<string> & {
  color: string
  metalness: number
  roughness: number
  /** Colour a natural deep-cut engraving reads in on this plate. */
  ink: string
  brushed: boolean
}

export const PLATES = [
  { id: "brass", label: "Brushed brass", color: "#c9a45c", metalness: 1, roughness: 0.32, ink: "#2b1d10", brushed: true },
  { id: "antique", label: "Antique brass", color: "#9c7a3e", metalness: 1, roughness: 0.48, ink: "#1f150a", brushed: true },
  { id: "rose", label: "Rose gold", color: "#d29a86", metalness: 1, roughness: 0.22, ink: "#3a1c14", brushed: false },
  { id: "copper", label: "Copper", color: "#b8693e", metalness: 1, roughness: 0.3, ink: "#2a120a", brushed: true },
  { id: "nickel", label: "Polished nickel", color: "#d4d2cc", metalness: 1, roughness: 0.16, ink: "#1d1c1a", brushed: false },
  { id: "black", label: "Black bronze", color: "#24211e", metalness: 0.75, roughness: 0.42, ink: "#d9b878", brushed: false },
] as const satisfies readonly PlateSpec[]

export const PLATE_SHAPES = [
  { id: "rect", label: "Rectangle" },
  { id: "oval", label: "Oval" },
  { id: "ribbon", label: "Ribbon" },
  { id: "none", label: "No plate" },
] as const satisfies readonly Option<string>[]

/** Where an uploaded photo is engraved. Price does not change. */
export const ARTWORKS = [
  { id: "plate", label: "On the plate" },
  { id: "wood", label: "On the wood" },
] as const satisfies readonly Option<string>[]

export const EMBLEMS = [
  { id: "laurel", label: "Laurel" },
  { id: "star", label: "Star" },
  { id: "monogram", label: "Monogram" },
  { id: "none", label: "None" },
] as const satisfies readonly Option<string>[]

export const FILLS = [
  { id: "natural", label: "Deep cut" },
  { id: "gold", label: "Gold fill", color: "#d9b46a" },
  { id: "black", label: "Black fill", color: "#141210" },
] as const satisfies readonly (Option<string> & { color?: string })[]

export const ALIGNS = [
  { id: "center", label: "Centred" },
  { id: "left", label: "Left" },
] as const satisfies readonly Option<string>[]

export const MOUNTS = [
  { id: "desk", label: "Desk stand" },
  { id: "wall", label: "Wall hung" },
  { id: "easel", label: "Brass easel" },
  { id: "box", label: "Presentation box" },
] as const satisfies readonly Option<string>[]

export const SIZES = [
  { id: "m", label: '8"', detail: "8 × 10 in", match: /(^m\b|\b8\s*(?:"|in|”))/i },
  { id: "l", label: '10"', detail: "10 × 12 in", match: /(^l\b|\b10\s*(?:"|in|”))/i },
] as const

export type FontSpec = Option<string> & {
  /** CSS custom property holding the next/font family stack. */
  cssVar: string
  /** Matching Google family for the 2D layout editor. */
  family2d: string
  style: "normal" | "italic"
  weight: number
  /** Uppercase + tracked for every line. */
  caps: boolean
}

export const FONTS = [
  { id: "serif", label: "Editorial serif", cssVar: "--font-playfair", family2d: "Playfair Display", style: "normal", weight: 500, caps: false },
  { id: "italic", label: "Serif italic", cssVar: "--font-playfair", family2d: "Playfair Display", style: "italic", weight: 400, caps: false },
  { id: "sans", label: "Modern sans", cssVar: "--font-inter", family2d: "Inter", style: "normal", weight: 500, caps: true },
] as const satisfies readonly FontSpec[]

/** Whether the plate shows the three engraving lines or a layout from the 2D editor. */
export const FACES = [
  { id: "text", label: "Engraving lines" },
  { id: "custom", label: "2D layout" },
] as const satisfies readonly Option<string>[]

export type FormId = (typeof FORMS)[number]["id"]
export type EdgeId = (typeof EDGES)[number]["id"]
export type WoodId = (typeof WOODS)[number]["id"]
export type FinishId = (typeof FINISHES)[number]["id"]
export type BorderId = (typeof BORDERS)[number]["id"]
export type PlateId = (typeof PLATES)[number]["id"]
export type PlateShapeId = (typeof PLATE_SHAPES)[number]["id"]
export type ArtId = (typeof ARTWORKS)[number]["id"]
export type EmblemId = (typeof EMBLEMS)[number]["id"]
export type FillId = (typeof FILLS)[number]["id"]
export type AlignId = (typeof ALIGNS)[number]["id"]
export type MountId = (typeof MOUNTS)[number]["id"]
export type SizeId = (typeof SIZES)[number]["id"]
export type FontId = (typeof FONTS)[number]["id"]
export type FaceId = (typeof FACES)[number]["id"]

export const LINE_LIMITS = { title: 32, name: 28, detail: 36 } as const
export type LineKey = keyof typeof LINE_LIMITS

export type PlaqueConfig = {
  form: FormId
  edge: EdgeId
  size: SizeId
  wood: WoodId
  finish: FinishId
  border: BorderId
  plate: PlateId
  pshape: PlateShapeId
  art: ArtId
  emblem: EmblemId
  font: FontId
  fill: FillId
  align: AlignId
  face: FaceId
  mount: MountId
  title: string
  name: string
  detail: string
}

export const DEFAULT_CONFIG: PlaqueConfig = {
  form: "arch",
  edge: "rounded",
  size: "m",
  wood: "walnut",
  finish: "satin",
  border: "none",
  plate: "brass",
  pshape: "rect",
  art: "plate",
  emblem: "laurel",
  font: "serif",
  fill: "natural",
  align: "center",
  face: "text",
  mount: "desk",
  title: "",
  name: "",
  detail: "",
}

/** Shown faintly on the model while a line is empty; never sent to the cart. */
export const SAMPLE_LINES: Record<LineKey, string> = {
  title: "Excellence Award",
  name: "Your Recipient",
  detail: "Annual Honours 2026",
}

/** Option-group query keys, in URL order. Text lines follow. */
export const OPTION_KEYS = [
  "form",
  "edge",
  "size",
  "wood",
  "finish",
  "border",
  "plate",
  "pshape",
  "art",
  "emblem",
  "font",
  "fill",
  "align",
  "face",
  "mount",
] as const
export type OptionKey = (typeof OPTION_KEYS)[number]

const ids = (options: readonly { id: string }[]) => options.map((o) => o.id)

export const OPTION_IDS: Record<OptionKey, readonly string[]> = {
  form: ids(FORMS),
  edge: ids(EDGES),
  size: ids(SIZES),
  wood: ids(WOODS),
  finish: ids(FINISHES),
  border: ids(BORDERS),
  plate: ids(PLATES),
  pshape: ids(PLATE_SHAPES),
  art: ids(ARTWORKS),
  emblem: ids(EMBLEMS),
  font: ids(FONTS),
  fill: ids(FILLS),
  align: ids(ALIGNS),
  face: ids(FACES),
  mount: ids(MOUNTS),
}

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>

function readParam(source: ParamSource, key: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined
  const value = source[key]
  return Array.isArray(value) ? value[0] : value
}

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g

/** Strips control characters, collapses whitespace and clamps to the line limit. */
export function cleanLine(raw: string, max: number): string {
  return raw.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trimStart().slice(0, max)
}

/** Whitelists every option and sanitises engraving lines; unknown values fall back to defaults. */
export function parseConfig(source: ParamSource): PlaqueConfig {
  const config: PlaqueConfig = { ...DEFAULT_CONFIG }
  for (const key of OPTION_KEYS) {
    const value = readParam(source, key)?.toLowerCase()
    if (value && OPTION_IDS[key].includes(value)) {
      ;(config as Record<OptionKey, string>)[key] = value
    }
  }
  for (const key of Object.keys(LINE_LIMITS) as LineKey[]) {
    const value = readParam(source, key)
    if (value) config[key] = cleanLine(value, LINE_LIMITS[key]).trim()
  }
  return config
}

/** Query string for a configuration. Options are always written so links are explicit; empty lines are omitted. */
export function serializeConfig(config: PlaqueConfig): string {
  const params = new URLSearchParams()
  for (const key of OPTION_KEYS) params.set(key, config[key])
  for (const key of Object.keys(LINE_LIMITS) as LineKey[]) {
    const value = config[key].trim()
    if (value) params.set(key, value)
  }
  return params.toString()
}

export function engravingLines(config: PlaqueConfig): Record<LineKey, string> {
  return { title: config.title.trim(), name: config.name.trim(), detail: config.detail.trim() }
}

export function hasEngraving(config: PlaqueConfig): boolean {
  const lines = engravingLines(config)
  return Boolean(lines.title || lines.name || lines.detail)
}

/** Up to two initials from the recipient (then title) for the monogram emblem. */
export function monogram(config: PlaqueConfig): string {
  const source = config.name.trim() || config.title.trim() || "L C"
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("")
}

export function labelOf<T extends Option<string>>(options: readonly T[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? id
}

export const getWood = (id: WoodId): WoodSpec => WOODS.find((w) => w.id === id) ?? WOODS[0]
export const getPlate = (id: PlateId): PlateSpec => PLATES.find((p) => p.id === id) ?? PLATES[0]
export const getFont = (id: FontId): FontSpec => FONTS.find((f) => f.id === id) ?? FONTS[0]
export const getFinish = (id: FinishId) => FINISHES.find((f) => f.id === id) ?? FINISHES[1]

/** False when the engraving is burned straight into the wood (plate shape "No plate"). */
export const hasPlate = (config: Pick<PlaqueConfig, "pshape">) => config.pshape !== "none"

/** Photos and lines sit on the timber: either there is no plate, or the shopper chose "On the wood". */
export function artworkOnWood(config: Pick<PlaqueConfig, "pshape"> & { art?: ArtId }) {
  return !hasPlate(config) || config.art === "wood"
}

/** Laser burn on light timber; dark timber shows a pale etch instead. */
export const WOOD_BURN = "#3b2414"
export const WOOD_ETCH = "#e2cca4"

function hexLuminance(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
}

export const woodInk = (wood: WoodId) => (hexLuminance(getWood(wood).grain[0]) < 0.32 ? WOOD_ETCH : WOOD_BURN)

/** Engraving colour: an explicit fill, else the plate's natural cut colour or the wood burn. */
export function inkFor(config: PlaqueConfig): string {
  const fill = FILLS.find((f) => f.id === config.fill)
  if (fill && "color" in fill) return fill.color
  return hasPlate(config) ? getPlate(config.plate).ink : woodInk(config.wood)
}

/** The minimum a variant needs for size matching + pricing. */
export type PlaqueVariant = {
  id: string
  sizeLabel: string
  amount: number | null
  currency: string
  inStock: boolean
}

/** Maps a size option onto the product's Medusa variant by its Size value, then by position. */
export function resolveVariant(variants: readonly PlaqueVariant[], size: SizeId): PlaqueVariant | undefined {
  const spec = SIZES.find((s) => s.id === size) ?? SIZES[0]
  const byLabel = variants.find((v) => spec.match.test(v.sizeLabel.trim()))
  if (byLabel) return byLabel
  const index = SIZES.findIndex((s) => s.id === spec.id)
  return variants[index]
}

/** Inverse of resolveVariant: the size option a Medusa variant id stands for. */
export function sizeForVariant(variants: readonly PlaqueVariant[], variantId: string | undefined): SizeId | undefined {
  if (!variantId) return undefined
  return SIZES.find((s) => resolveVariant(variants, s.id)?.id === variantId)?.id
}

/** Closest PBR material in the shared Design3DState enum, for the saved design record. */
const PLATE_TO_MATERIAL: Record<PlateId, Design3DState["material"]> = {
  brass: "polished_gold",
  antique: "antique_bronze",
  rose: "rose_gold",
  copper: "antique_bronze",
  nickel: "brushed_silver",
  black: "matte_black",
}

/** Closest overlay in the 2D editor's material list. */
export const PLATE_TO_MATERIAL_2D = {
  brass: "gold",
  antique: "bronze",
  rose: "rose_gold",
  copper: "bronze",
  nickel: "silver",
  black: "matte_black",
} as const satisfies Record<PlateId, string>

export function summarizeConfig(config: PlaqueConfig) {
  return {
    form: labelOf(FORMS, config.form),
    edge: labelOf(EDGES, config.edge),
    size: SIZES.find((s) => s.id === config.size)?.detail ?? config.size,
    wood: labelOf(WOODS, config.wood),
    finish: labelOf(FINISHES, config.finish),
    border: labelOf(BORDERS, config.border),
    plate: hasPlate(config) ? labelOf(PLATES, config.plate) : "None — engraved into the wood",
    plateShape: labelOf(PLATE_SHAPES, config.pshape),
    artwork: artworkOnWood(config) ? "On the wood" : "On the plate",
    emblem: labelOf(EMBLEMS, config.emblem),
    font: labelOf(FONTS, config.font),
    fill: labelOf(FILLS, config.fill),
    align: labelOf(ALIGNS, config.align),
    face: labelOf(FACES, config.face),
    mount: labelOf(MOUNTS, config.mount),
  }
}

/** A layout composed in the 2D editor and applied to the plate. */
export type FaceLayout = {
  /** Fabric JSON of the composition (re-editable). */
  fabric: unknown
  /** Transparent PNG of the engraving safe area. */
  image: string
  /** Safe area (2D canvas px) the composition was laid out in. */
  area?: { x: number; y: number; width: number; height: number }
}

/** The option choices alone (no engraving copy), as saved with a design. */
export function configOptions(config: PlaqueConfig): Record<OptionKey, string> {
  return Object.fromEntries(OPTION_KEYS.map((key) => [key, config[key]])) as Record<OptionKey, string>
}

/**
 * Saved-design payload: a valid Design3DState (validated by the backend) plus
 * a `configurator` block that carries the full plaque spec for the workshop.
 */
export function buildDesignState(config: PlaqueConfig, layout?: FaceLayout | null) {
  const lines = engravingLines(config)
  const text = [lines.title, lines.name, lines.detail].filter(Boolean).join(" / ")
  const custom = config.face === "custom" && layout ? layout : null
  const state: Design3DState & {
    configurator: {
      kind: "plaque"
      options: Record<OptionKey, string>
      lines: Record<LineKey, string>
      layout: { source: "2d"; fabric: unknown } | null
    }
  } = {
    version: 1,
    baseModelId: "wall-plaque",
    lod: "auto",
    material: PLATE_TO_MATERIAL[config.plate],
    environment: "studio",
    engraving: text
      ? { text, fontFamily: labelOf(FONTS, config.font), method: "texture", surfaceAnchor: "front" }
      : null,
    logo: null,
    configurator: {
      kind: "plaque",
      options: configOptions(config),
      lines,
      layout: custom ? { source: "2d", fabric: custom.fabric } : null,
    },
  }
  return state
}

/** Line-item metadata: keeps the existing customise contract (design_id …) and adds the spec. */
export function cartMetadata(
  config: PlaqueConfig,
  design: { id: string; name: string; preview_url: string | null },
) {
  return {
    design_id: design.id,
    design_name: design.name,
    preview_url: design.preview_url,
    customization_mode: "3d",
    configuration: { ...summarizeConfig(config), engraving: engravingLines(config) },
  }
}

export function designName(config: PlaqueConfig): string {
  const lines = engravingLines(config)
  const lead = lines.name || lines.title || "Custom layout"
  return `${lead} — ${labelOf(WOODS, config.wood)} plaque`.slice(0, 120)
}
