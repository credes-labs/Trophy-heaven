import { describe, expect, it } from "vitest"
import { Design3DState } from "@trophy-heaven/schemas"
import {
  DEFAULT_CONFIG,
  buildDesignState,
  cartMetadata,
  cleanLine,
  artworkOnWood,
  hasEngraving,
  parseConfig,
  resolveVariant,
  serializeConfig,
  sizeForVariant,
  type PlaqueVariant,
} from "./plaque"

const VARIANTS: PlaqueVariant[] = [
  { id: "var_l", sizeLabel: 'L (10")', amount: 1299, currency: "inr", inStock: true },
  { id: "var_m", sizeLabel: 'M (8")', amount: 899, currency: "inr", inStock: true },
]

describe("plaque configurator state", () => {
  it("falls back to defaults for missing or unknown values", () => {
    expect(parseConfig(new URLSearchParams())).toEqual(DEFAULT_CONFIG)
    const parsed = parseConfig({ wood: "plywood", plate: "<script>", form: "ARCH", size: ["l", "m"] })
    expect(parsed.wood).toBe(DEFAULT_CONFIG.wood)
    expect(parsed.plate).toBe(DEFAULT_CONFIG.plate)
    expect(parsed.form).toBe("arch")
    expect(parsed.size).toBe("l")
  })

  it("round-trips through the query string", () => {
    const config = {
      ...DEFAULT_CONFIG,
      form: "crest" as const,
      wood: "oak" as const,
      plate: "black" as const,
      mount: "wall" as const,
      size: "l" as const,
      font: "sans" as const,
      title: "Best Captain",
      name: "Ananya Rao & Co",
      detail: "",
    }
    const query = serializeConfig(config)
    expect(query).not.toContain("detail=")
    expect(parseConfig(new URLSearchParams(query))).toEqual(config)
  })

  it("sanitises and clamps engraving lines", () => {
    expect(cleanLine("  Hello\u0000\n  world  ", 40)).toBe("Hello world ")
    const parsed = parseConfig({ name: "x".repeat(200) })
    expect(parsed.name).toHaveLength(28)
    expect(hasEngraving(parseConfig({ title: "   " }))).toBe(false)
  })

  it("resolves the Medusa variant by size label, then by position", () => {
    expect(resolveVariant(VARIANTS, "m")?.id).toBe("var_m")
    expect(resolveVariant(VARIANTS, "l")?.id).toBe("var_l")
    const unlabeled = VARIANTS.map((v, i) => ({ ...v, sizeLabel: `Option ${i}` }))
    expect(resolveVariant(unlabeled, "m")?.id).toBe("var_l")
    expect(resolveVariant([], "m")).toBeUndefined()
  })

  it("round-trips the 10-inch size and rejects anything else", () => {
    const query = serializeConfig({ ...DEFAULT_CONFIG, size: "l" })
    expect(query.startsWith("form=")).toBe(true)
    expect(query).not.toContain("/customize")
    expect(new URLSearchParams(query).get("size")).toBe("l")
    expect(parseConfig(new URLSearchParams(query)).size).toBe("l")
    for (const bad of ["10", "xl", "", "l;drop"]) {
      expect(parseConfig({ size: bad }).size).toBe("m")
    }
  })

  it("puts artwork on the wood for that placement or when there is no plate", () => {
    expect(artworkOnWood({ pshape: "rect", art: "plate" })).toBe(false)
    expect(artworkOnWood({ pshape: "rect", art: "wood" })).toBe(true)
    expect(artworkOnWood({ pshape: "none", art: "plate" })).toBe(true)
    const query = serializeConfig({ ...DEFAULT_CONFIG, art: "wood", pshape: "none" })
    expect(parseConfig(new URLSearchParams(query))).toMatchObject({ art: "wood", pshape: "none" })
    expect(parseConfig({ art: "vinyl" }).art).toBe("plate")
  })

  it("whitelists every new option group", () => {
    const config = {
      ...DEFAULT_CONFIG,
      form: "octagon" as const,
      edge: "chamfer" as const,
      wood: "sheesham" as const,
      finish: "gloss" as const,
      border: "double" as const,
      plate: "rose" as const,
      pshape: "ribbon" as const,
      emblem: "monogram" as const,
      fill: "gold" as const,
      align: "left" as const,
      face: "custom" as const,
      mount: "box" as const,
    }
    expect(parseConfig(new URLSearchParams(serializeConfig(config)))).toEqual(config)
    const junk = parseConfig({ edge: "jagged", finish: "chrome", pshape: "heart", emblem: "skull", mount: "ceiling", face: "x" })
    expect(junk).toEqual(DEFAULT_CONFIG)
  })

  it("maps sizes and variant ids both ways so 2D and 3D price the same", () => {
    expect(sizeForVariant(VARIANTS, "var_l")).toBe("l")
    expect(sizeForVariant(VARIANTS, "var_m")).toBe("m")
    expect(sizeForVariant(VARIANTS, "var_unknown")).toBeUndefined()
    expect(sizeForVariant(VARIANTS, undefined)).toBeUndefined()
  })

  it("carries an applied 2D layout in the saved state only when the face uses it", () => {
    const layout = { image: "data:image/png;base64,AAAA", fabric: { objects: [] } }
    const custom = buildDesignState({ ...DEFAULT_CONFIG, face: "custom" }, layout)
    expect(Design3DState.safeParse(custom).success).toBe(true)
    expect(custom.configurator.layout).toEqual({ source: "2d", fabric: { objects: [] } })
    expect(buildDesignState({ ...DEFAULT_CONFIG, face: "text" }, layout).configurator.layout).toBeNull()
  })

  it("builds a design state the backend schema accepts", () => {
    const config = { ...DEFAULT_CONFIG, title: "Coach", name: "R. Iyer" }
    const state = buildDesignState(config)
    expect(Design3DState.safeParse(state).success).toBe(true)
    expect(state.engraving?.text).toBe("Coach / R. Iyer")
    expect(state.configurator.options.wood).toBe("walnut")
    const meta = cartMetadata(config, { id: "des_1", name: "x", preview_url: null })
    expect(meta).toMatchObject({ design_id: "des_1", customization_mode: "3d" })
    expect(meta.configuration.engraving.name).toBe("R. Iyer")
  })
})
