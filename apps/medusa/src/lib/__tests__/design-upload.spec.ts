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

  it("accepts office documents and text only as order documents", () => {
    const xlsx = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.from("....[Content_Types].xml...."),
    ])
    const ole = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0])
    const csv = Buffer.from("name,award\nPriya,Gold\n")
    const b64 = (b: Buffer) => b.toString("base64")

    expect(checkDesignUpload(b64(xlsx), "names.xlsx", "document")).toMatchObject({
      ok: true,
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: "names.xlsx",
    })
    expect(checkDesignUpload(b64(ole), "brief.doc", "document")).toMatchObject({
      ok: true,
      mime: "application/msword",
    })
    expect(checkDesignUpload(b64(csv), "list.csv", "document")).toMatchObject({
      ok: true,
      mime: "text/csv",
    })
    expect(checkDesignUpload(b64(PDF), "art.pdf", "document")).toMatchObject({ ok: true })
    // Not allowed as a product design.
    expect(checkDesignUpload(b64(xlsx), "names.xlsx")).toMatchObject({ ok: false })
  })

  it("rejects archives, binaries and mislabelled documents", () => {
    const zip = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("payload")])
    const b64 = (b: Buffer) => b.toString("base64")
    expect(checkDesignUpload(b64(zip), "names.xlsx", "document")).toMatchObject({ ok: false })
    expect(checkDesignUpload(b64(zip), "x.zip", "document")).toMatchObject({ ok: false })
    expect(
      checkDesignUpload(b64(Buffer.from([0x4d, 0x5a, 0, 0x90])), "list.csv", "document")
    ).toMatchObject({ ok: false })
    expect(checkDesignUpload(b64(Buffer.from("MZ")), "setup.exe", "document")).toMatchObject({
      ok: false,
    })
  })

  it("strips paths and odd characters from filenames", () => {
    expect(cleanDesignFilename("../../etc/<team logo>.png", "image/png")).toBe("team logo.png")
    expect(cleanDesignFilename("???.pdf", "application/pdf")).toBe("design.pdf")
  })
})
