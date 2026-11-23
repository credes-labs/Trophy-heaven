import { describe, expect, it } from "vitest"
import {
  cartDesignState,
  fillEmptyPieces,
  isMappableDesign,
  partitionUploads,
  pieceCount,
  readLinePieces,
  suggestPieces,
  toStoredPieces,
  unusedDesigns,
  type CartLineLike,
} from "./design-mapping"
import type { DesignFile } from "./design-uploads"

const img = (name: string): DesignFile => ({
  url: `https://cdn.test/${name}.png`,
  filename: `${name}.png`,
  mime_type: "image/png",
  size: 10,
})
const pdf: DesignFile = {
  url: "https://cdn.test/all.pdf",
  filename: "all.pdf",
  mime_type: "application/pdf",
  size: 10,
}
const line = (id: string, quantity: number, metadata: Record<string, unknown> = {}): CartLineLike => ({
  id,
  quantity,
  metadata,
})

describe("design mapping", () => {
  it("counts physical trophies and treats only images as designs", () => {
    expect(pieceCount([line("a", 2), line("b", 3)])).toBe(5)
    expect(isMappableDesign(img("x"))).toBe(true)
    expect(isMappableDesign(pdf)).toBe(false)
    expect(isMappableDesign({ name: "names.xlsx" })).toBe(false)
  })

  it("lets a line image cover every piece until a mapping exists", () => {
    const a = img("a")
    expect(readLinePieces(line("l", 3, { design_upload: a }))).toEqual([a, a, a])
    expect(readLinePieces(line("l", 3, { design_upload: pdf }))).toEqual([null, null, null])
    expect(readLinePieces(line("l", 3, { design_upload: a, design_pieces: [a, null] }))).toEqual([
      a,
      null,
      null,
    ])
  })

  it("stores empty pieces without nulls and reads them back as empty", () => {
    const a = img("a")
    const stored = toStoredPieces([a, null])
    expect(stored).not.toContain(null)
    expect(readLinePieces(line("l", 2, { design_pieces: stored }))).toEqual([a, null])
  })

  it("documents never count against the design limit or block checkout", () => {
    const state = cartDesignState({ order_documents: [pdf] }, [line("a", 1)])
    expect(state).toMatchObject({ limit: 1, room: 1, needsAction: false })
    expect(state.documents).toHaveLength(1)
  })

  it("flags too many designs after a quantity drops", () => {
    const [a, b, c] = [img("a"), img("b"), img("c")]
    const state = cartDesignState({ order_documents: [a, b, c] }, [
      line("l", 2, { design_pieces: [a, b, c] }),
    ])
    expect(state.overBy).toBe(1)
    expect(state.needsAction).toBe(true)
    expect(state.problem).toMatch(/3 designs for 2 trophies/)
  })

  it("flags unmatched designs but allows trophies without artwork", () => {
    const [a, b] = [img("a"), img("b")]
    expect(
      cartDesignState({ order_documents: [a, b] }, [line("l", 2, { design_pieces: [a, null] })]).problem
    ).toMatch(/1 design is not matched/)
    expect(
      cartDesignState({ order_documents: [a] }, [line("l", 2, { design_pieces: [a, null] })])
    ).toMatchObject({ needsAction: false, emptyPieces: 1 })
  })

  it("accepts only what fits, without limiting documents by trophies", () => {
    const files = ["1.png", "2.jpg", "3.webp", "brief.pdf", "list.xlsx"].map((name) => ({ name }))
    const { accepted, rejectedDesigns, rejectedDocuments } = partitionUploads(files, 2, 10)
    expect(accepted.map((f) => f.name)).toEqual(["1.png", "2.jpg", "brief.pdf", "list.xlsx"])
    expect(rejectedDesigns).toBe(1)
    expect(rejectedDocuments).toBe(0)
  })

  it("puts a single design on every piece", () => {
    const a = img("a")
    expect(suggestPieces([line("x", 2), line("y", 1)], [a])).toEqual({ x: [a, a], y: [a] })
  })

  it("spreads designs over empty pieces and keeps existing choices", () => {
    const [a, b] = [img("a"), img("b")]
    const map = suggestPieces([line("x", 2, { design_pieces: [null, a] }), line("y", 1)], [a, b])
    expect(map).toEqual({ x: [b, a], y: [null] })
    expect(unusedDesigns(map, [a, b])).toEqual([])
  })

  it("moves an unused design onto a piece freed by a removal", () => {
    const [a, b] = [img("a"), img("b")]
    expect(fillEmptyPieces({ x: [a], y: [null] }, [a, b])).toEqual({ x: [a], y: [b] })
  })

  it("takes a piece from a shared design when no piece is empty", () => {
    const [a, b] = [img("a"), img("b")]
    expect(suggestPieces([line("x", 3, { design_upload: a })], [a, b])).toEqual({ x: [a, a, b] })
  })
})
