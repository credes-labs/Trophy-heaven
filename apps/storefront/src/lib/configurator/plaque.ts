import type { Design3DState } from "@legacy-crafts/schemas"

/**
 * Option model for the /customize plaque configurator. Pure (no React/three) so
 * the server page, the client panel, the 3D scene and the tests share one
 * whitelist. Every finish is included in the variant price — only size maps to
 * a Medusa variant.
 */

export const PLAQUE_HANDLE = "engraved-wooden-plaque"

export type Option<Id extends string> = { id: Id; label: string }

export const FORMS = [
  { id: "classic", label: "Classic" },
  { id: "arch", label: "Arched" },
  { id: "crest", label: "Crest" },
] as const satisfies readonly Option<string>[]

export type WoodSpec = Option<string> & {
  /** base / dark grain / light grain — fed to the shared wood drawing routine */
  grain: readonly [string, string, string]
  seed: number
  roughness: number
  clearcoat: number
}

export const WOODS = [
  { id: "walnut", label: "Smoked walnut", grain: ["#4a2817", "#24120a", "#8a5a36"], seed: 7, roughness: 0.42, clearcoat: 0.6 },
  { id: "oak", label: "White oak", grain: ["#c9a679", "#9c7a50", "#e8d3ad"], seed: 13, roughness: 0.55, clearcoat: 0.25 },
  { id: "teak", label: "Teak", grain: ["#a8763c", "#7f5524", "#e0b87c"], seed: 21, roughness: 0.5, clearcoat: 0.35 },
  { id: "ebony", label: "Ebonised ash", grain: ["#262019", "#0f0c09", "#4d4237"], seed: 29, roughness: 0.38, clearcoat: 0.7 },
] as const satisfies readonly WoodSpec[]

export type PlateSpec = Option<string> & {
  color: string
  metalness: number
  roughness: number
  /** Colour the engraving reads in on this plate. */
  ink: string
}

export const PLATES = [
  { id: "brass", label: "Brushed brass", color: "#c9a45c", metalness: 1, roughness: 0.32, ink: "#2b1d10" },
  { id: "nickel", label: "Polished nickel", color: "#d4d2cc", metalness: 1, roughness: 0.16, ink: "#1d1c1a" },
  { id: "black", label: "Black bronze", color: "#24211e", metalness: 0.75, roughness: 0.42, ink: "#d9b878" },
] as const satisfies readonly PlateSpec[]

export const MOUNTS = [
  { id: "desk", label: "Desk stand" },
  { id: "wall", label: "Wall hung" },
] as const satisfies readonly Option<string>[]

export const SIZES = [
  { id: "m", label: '8"', detail: "8 × 10 in", match: /(^m\b|\b8\s*(?:"|in|”))/i },
  { id: "l", label: '10"', detail: "10 × 12 in", match: /(^l\b|\b10\s*(?:"|in|”))/i },
] as const

export type FontSpec = Option<string> & {
  /** CSS custom property holding the next/font family stack. */
  cssVar: string
  style: "normal" | "italic"
  weight: number
  /** Uppercase + tracked for the title line. */
  caps: boolean
}

export const FONTS = [
  { id: "serif", label: "Editorial serif", cssVar: "--font-playfair", style: "normal", weight: 500, caps: false },
  { id: "italic", label: "Serif italic", cssVar: "--font-playfair", style: "italic", weight: 400, caps: false },
  { id: "sans", label: "Modern sans", cssVar: "--font-inter", style: "normal", weight: 500, caps: true },
] as const satisfies readonly FontSpec[]

export type FormId = (typeof FORMS)[number]["id"]
export type WoodId = (typeof WOODS)[number]["id"]
export type PlateId = (typeof PLATES)[number]["id"]
export type MountId = (typeof MOUNTS)[number]["id"]
export type SizeId = (typeof SIZES)[number]["id"]
export type FontId = (typeof FONTS)[number]["id"]

export const LINE_LIMITS = { title: 32, name: 28, detail: 36 } as const
export type LineKey = keyof typeof LINE_LIMITS

export type PlaqueConfig = {
  form: FormId
  wood: WoodId
  plate: PlateId
  mount: MountId
  size: SizeId
  font: FontId
  title: string
  name: string
  detail: string
}

export const DEFAULT_CONFIG: PlaqueConfig = {
  form: "arch",
  wood: "walnut",
  plate: "brass",
  mount: "desk",
  size: "m",
  font: "serif",
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
const OPTION_KEYS = ["form", "wood", "plate", "mount", "size", "font"] as const
type OptionKey = (typeof OPTION_KEYS)[number]

const OPTION_IDS: Record<OptionKey, readonly string[]> = {
  form: FORMS.map((o) => o.id),
  wood: WOODS.map((o) => o.id),
  plate: PLATES.map((o) => o.id),
  mount: MOUNTS.map((o) => o.id),
  size: SIZES.map((o) => o.id),
  font: FONTS.map((o) => o.id),
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

export function labelOf<T extends Option<string>>(options: readonly T[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? id
}

export const getWood = (id: WoodId): WoodSpec => WOODS.find((w) => w.id === id) ?? WOODS[0]
export const getPlate = (id: PlateId): PlateSpec => PLATES.find((p) => p.id === id) ?? PLATES[0]
export const getFont = (id: FontId): FontSpec => FONTS.find((f) => f.id === id) ?? FONTS[0]

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

/** Closest PBR material in the shared Design3DState enum, for the saved design record. */
const PLATE_TO_MATERIAL: Record<PlateId, Design3DState["material"]> = {
  brass: "polished_gold",
  nickel: "brushed_silver",
  black: "matte_black",
}

export function summarizeConfig(config: PlaqueConfig) {
  return {
    form: labelOf(FORMS, config.form),
    wood: labelOf(WOODS, config.wood),
    plate: labelOf(PLATES, config.plate),
    mount: labelOf(MOUNTS, config.mount),
    size: SIZES.find((s) => s.id === config.size)?.detail ?? config.size,
    font: labelOf(FONTS, config.font),
  }
}

/**
 * Saved-design payload: a valid Design3DState (validated by the backend) plus
 * a `configurator` block that carries the full plaque spec for the workshop.
 */
export function buildDesignState(config: PlaqueConfig): Design3DState & {
  configurator: { kind: "plaque"; options: Omit<PlaqueConfig, LineKey>; lines: Record<LineKey, string> }
} {
  const lines = engravingLines(config)
  const text = [lines.title, lines.name, lines.detail].filter(Boolean).join(" / ")
  return {
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
      options: {
        form: config.form,
        wood: config.wood,
        plate: config.plate,
        mount: config.mount,
        size: config.size,
        font: config.font,
      },
      lines,
    },
  }
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
  const lead = lines.name || lines.title || "Untitled"
  return `${lead} — ${labelOf(WOODS, config.wood)} plaque`.slice(0, 120)
}
