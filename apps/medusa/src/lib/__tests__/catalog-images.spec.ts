import { storefrontImagePath, storefrontOrigins } from "../catalog-images"

describe("storefrontImagePath", () => {
  it("finds seeded storefront photos, absolute or relative", () => {
    expect(storefrontImagePath("http://localhost:3000/images/collection/cup-1.webp")).toBe(
      "/images/collection/cup-1.webp"
    )
    expect(storefrontImagePath("/images/catalog/plaque-engraved.webp")).toBe(
      "/images/catalog/plaque-engraved.webp"
    )
  })

  it("leaves File-module and owner-uploaded images alone", () => {
    expect(storefrontImagePath("https://api.example.com/static/1795-cup.webp")).toBeNull()
    expect(storefrontImagePath("https://cdn.example.com/images/x.webp", ["cdn.example.com"])).toBeNull()
    expect(storefrontImagePath(null)).toBeNull()
  })

  it("refuses path traversal", () => {
    expect(storefrontImagePath("/images/%2e%2e/%2e%2e/etc/passwd")).toBeNull()
  })
})

describe("storefrontOrigins", () => {
  it("uses the public storefront from STORE_CORS and skips localhost and wildcards", () => {
    expect(
      storefrontOrigins({
        STORE_CORS: "http://localhost:3000, https://trophy-heaven.vercel.app/,https://*.vercel.app",
      } as NodeJS.ProcessEnv)
    ).toEqual(["https://trophy-heaven.vercel.app"])
  })

  it("puts STOREFRONT_PUBLIC_URL first", () => {
    expect(
      storefrontOrigins({
        STOREFRONT_PUBLIC_URL: "https://shop.example.com",
        STORE_CORS: "https://trophy-heaven.vercel.app",
      } as NodeJS.ProcessEnv)
    ).toEqual(["https://shop.example.com", "https://trophy-heaven.vercel.app"])
  })
})
