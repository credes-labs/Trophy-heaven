import { checkDesignUpload, cleanDesignFilename, sniffDesignMime } from "../design-upload"

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
const PDF = Buffer.from("%PDF-1.7\n", "latin1")

describe("design uploads", () => {
  it("sniffs file types from magic bytes", () => {
    expect(sniffDesignMime(PNG)).toBe("image/png")
    expect(sniffDesignMime(PDF)).toBe("application/pdf")
    expect(sniffDesignMime(Buffer.from("<svg></svg>"))).toBeNull()
  })

  it("accepts a PNG sent as a data URL and fixes the extension", () => {
    const result = checkDesignUpload(`data:image/png;base64,${PNG.toString("base64")}`, "logo.exe")
    expect(result).toMatchObject({ ok: true, mime: "image/png", filename: "logo.png" })
  })

  it("rejects disguised and empty files", () => {
    expect(checkDesignUpload(Buffer.from("<html>").toString("base64"), "a.png")).toMatchObject({
      ok: false,
      code: "UNSUPPORTED_TYPE",
    })
    expect(checkDesignUpload("", "a.png")).toMatchObject({ ok: false, code: "EMPTY" })
  })

  it("rejects files over 10 MB", () => {
    const big = Buffer.concat([PNG, Buffer.alloc(10 * 1024 * 1024)])
    expect(checkDesignUpload(big.toString("base64"), "big.png")).toMatchObject({
      ok: false,
      code: "TOO_LARGE",
    })
  })

  it("strips paths and odd characters from filenames", () => {
    expect(cleanDesignFilename("../../etc/<team logo>.png", "image/png")).toBe("team logo.png")
    expect(cleanDesignFilename("???.pdf", "application/pdf")).toBe("design.pdf")
  })
})
