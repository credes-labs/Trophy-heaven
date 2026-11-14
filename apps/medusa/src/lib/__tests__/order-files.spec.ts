import { collectOrderFiles, renderOwnerOrderEmail } from "../order-files"

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
      ["logo.png", "Gold Cup"],
    ])
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
