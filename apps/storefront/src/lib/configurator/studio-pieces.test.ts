import { beforeEach, describe, expect, it } from "vitest"
import { Design3DState } from "@trophy-heaven/schemas"
import {
  AWARD_SAFE_AREA,
  STUDIO_PIECES,
  initialStudioPiece,
  studioPieceForHandle,
} from "./studio-pieces"
import { buildDesignState, cartMetadata, DEFAULT_CONFIG } from "./plaque"
import { clearLayout, readLayout, writeLayout } from "./layout-store"

describe("photo-referenced trophy studio", () => {
  beforeEach(() => sessionStorage.clear())

  it("opens the new trophy by default and preserves legacy plaque links", () => {
    expect(initialStudioPiece({})).toBe("achievement")
    expect(initialStudioPiece({ form: "arch", name: "Ada" })).toBe("plaque")
    expect(initialStudioPiece({ piece: "ascent", mode: "2d" })).toBe("ascent")
    expect(studioPieceForHandle("ascent-figure-award")?.id).toBe("ascent")
    expect(studioPieceForHandle("unrelated-table")).toBeUndefined()
  })

  it("saves the selected physical model, lettering and editable 2D layout in a schema-valid 3D design", () => {
    const config = {
      ...DEFAULT_CONFIG,
      name: "Ananya Rao",
      plate: "nickel" as const,
      face: "custom" as const,
    }
    const layout = {
      image: "data:image/png;base64,AA==",
      fabric: { objects: [{ text: "Ananya Rao" }] },
      area: AWARD_SAFE_AREA,
    }
    for (const award of ["achievement", "ascent"] as const) {
      const state = buildDesignState(config, layout, award)
      expect(Design3DState.safeParse(state).success).toBe(true)
      expect(state.baseModelId).toBe(STUDIO_PIECES.find((p) => p.id === award)?.handle)
      expect(state.material).toBe("brushed_silver")
      expect(state.configurator.kind).toBe("trophy")
      expect(state.configurator.options.piece).toBe(award)
      expect(state.configurator.layout?.fabric).toEqual(layout.fabric)
      const metadata = cartMetadata(
        config,
        { id: "des_123", name: "Honours", preview_url: null },
        award
      )
      expect(metadata.design_id).toBe("des_123")
      expect(metadata.configuration.piece).toBe(award)
    }
  })

  it("keeps each trophy's 2D draft isolated and clears only the requested product", () => {
    const first = {
      image: "data:image/png;base64,AA==",
      fabric: { objects: ["first"] },
      area: AWARD_SAFE_AREA,
    }
    const second = { ...first, fabric: { objects: ["second"] } }
    expect(writeLayout("prod_achievement", first)).toBe(true)
    expect(writeLayout("prod_ascent", second)).toBe(true)
    expect(readLayout("prod_achievement")).toEqual(first)
    expect(readLayout("prod_ascent")).toEqual(second)
    clearLayout("prod_achievement")
    expect(readLayout("prod_achievement")).toBeNull()
    expect(readLayout("prod_ascent")).toEqual(second)
  })

  it("continues reading older single-product plaque drafts", () => {
    sessionStorage.setItem(
      "lc_plaque_layout:v1",
      JSON.stringify({ productId: "old", image: "data:image/png;base64,AA==", fabric: {} })
    )
    expect(readLayout("old")?.fabric).toEqual({})
    expect(readLayout("different")).toBeNull()
  })
})
