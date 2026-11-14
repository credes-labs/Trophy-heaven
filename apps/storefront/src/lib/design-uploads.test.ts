import { describe, expect, it } from "vitest"
import { designUploadError, readOrderDocuments, uploadAccept } from "./design-uploads"

const file = (name: string, size = 100) => new File([new Uint8Array(size)], name)
const stored = (filename: string) => ({ url: `http://x/${filename}`, filename, mime_type: "", size: 1 })

describe("design uploads", () => {
  it("allows only images and PDF as a product design", () => {
    expect(designUploadError(file("logo.PNG"))).toBeNull()
    expect(designUploadError(file("art.pdf"))).toBeNull()
    expect(designUploadError(file("names.xlsx"))).toMatch(/PNG, JPG/)
  })

  it("allows office documents and text for the whole order", () => {
    for (const name of ["names.xlsx", "brief.docx", "list.csv", "deck.pptx", "old.xls", "a.txt", "b.jpeg"]) {
      expect(designUploadError(file(name), "document")).toBeNull()
    }
    expect(designUploadError(file("setup.exe"), "document")).not.toBeNull()
    expect(designUploadError(file("empty.pdf", 0), "document")).toBe("That file is empty.")
    expect(uploadAccept("document")).toContain(".xlsx")
    expect(uploadAccept("design")).not.toContain(".xlsx")
  })

  it("reads the order file list and folds in the older single file", () => {
    expect(
      readOrderDocuments({
        order_documents: [stored("a.xlsx"), "", { url: 1 }],
        order_design_file: stored("old.pdf"),
      }).map((f) => f.filename)
    ).toEqual(["a.xlsx", "old.pdf"])
    expect(readOrderDocuments({ order_documents: "", order_design_file: "" })).toEqual([])
  })
})
