import { describe, expect, it } from "vitest"
import { Design3DState } from "@legacy-crafts/schemas"
import {
  DEFAULT_CONFIG,
  buildDesignState,
  cartMetadata,
  cleanLine,
  hasEngraving,
  parseConfig,
  resolveVariant,
  serializeConfig,
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
