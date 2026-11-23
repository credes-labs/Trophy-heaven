import { checkOrderDesigns, collectOrderFiles, renderOwnerOrderEmail } from "../order-files"

const file = (name: string) => ({
  url: `http://localhost:9000/static/${name}`,
  filename: name,
  mime_type: "application/pdf",
  size: 2048,
})

describe("order files", () => {
  it("collects order documents, the legacy order file and per-item designs", () => {
    const files = collectOrderFiles(
      { order_documents: [file("names.xlsx"), { url: "javascript:x", filename: "bad" }], order_design_file: file("old.pdf") },
      [
        { title: "Gold Cup", quantity: 2, metadata: { design_upload: file("logo.png") } },
        { title: "Plaque", quantity: 1, metadata: { design_upload: "" } },
      ]
    )
    expect(files.map((f) => [f.filename, f.scope])).toEqual([
      ["names.xlsx", "Whole order"],
      ["old.pdf", "Whole order"],
      ["logo.png", "Gold Cup, all 2"],
    ])
  })

  const image = (name: string) => ({ ...file(`${name}.png`), mime_type: "image/png" })

  it("names the trophy each mapped design belongs to", () => {
    const [a, b] = [image("a"), image("b")]
    const files = collectOrderFiles({ order_documents: [a, b, file("brief.pdf")] }, [
      { title: "Cup", quantity: 2, metadata: { design_pieces: [a, b] } },
      { title: "Plaque", quantity: 3, metadata: { design_upload: a } },
    ])
    expect(files.map((f) => [f.filename, f.scope])).toEqual([
      ["brief.pdf", "Whole order"],
      ["a.png", "Cup, trophy 1 of 2"],
      ["b.png", "Cup, trophy 2 of 2"],
      ["a.png", "Plaque, all 3"],
    ])
  })

  it("blocks more designs than trophies and unmatched designs, but not documents", () => {
    const [a, b] = [image("a"), image("b")]
    const one = [{ title: "Cup", quantity: 1, metadata: { design_pieces: [a] } }]
    expect(checkOrderDesigns({ order_documents: [a, b] }, one)).toMatch(/2 designs for 1 trophy/)
    const two = [{ title: "Cup", quantity: 2, metadata: { design_pieces: [a, null] } }]
    expect(checkOrderDesigns({ order_documents: [a, b] }, two)).toMatch(/1 design is not matched/)
    expect(
      checkOrderDesigns({ order_documents: [a, file("x.pdf"), file("y.pdf")] }, one)
    ).toBeNull()
  })

  it("renders an escaped owner email with file links", () => {
    const { subject, html } = renderOwnerOrderEmail({
      orderRef: 42,
      email: "a@example.com",
      total: 1500,
      currency: "inr",
      items: [{ title: "<b>Cup</b>", quantity: 1, metadata: { sticker_design: "Team A" } }],
      files: [{ ...file("names.xlsx"), scope: "Whole order" }],
    })
    expect(subject).toBe("New order #42 with 1 customer file")
    expect(html).toContain('href="http://localhost:9000/static/names.xlsx"')
    expect(html).toContain("&lt;b&gt;Cup&lt;/b&gt;")
    expect(html).toContain("Sticker: Team A")
  })
})
