import { clientIp, isJwtBearer } from "../rate-limit-auth"

describe("clientIp", () => {
  const req = { ip: "10.0.0.1", headers: { "cf-connecting-ip": "203.0.113.9" } }

  it("uses the edge header only on Render", () => {
    expect(clientIp(req, { RENDER: "true" })).toBe("203.0.113.9")
    expect(clientIp(req, {})).toBe("10.0.0.1")
  })

  it("falls back to the request IP", () => {
    expect(clientIp({ ip: "10.0.0.1", headers: {} }, { RENDER: "true" })).toBe("10.0.0.1")
    expect(clientIp({ headers: {} }, {})).toBe("anon")
  })
})

describe("isJwtBearer", () => {
  it("rejects empty, cookie-like, and non-JWT bearer values", () => {
    expect(isJwtBearer(undefined)).toBe(false)
    expect(isJwtBearer("Basic abc")).toBe(false)
    expect(isJwtBearer("Bearer not-a-jwt")).toBe(false)
  })

  it("accepts a three-segment bearer token", () => {
    expect(isJwtBearer("Bearer aaa.bbb.ccc")).toBe(true)
  })
})
