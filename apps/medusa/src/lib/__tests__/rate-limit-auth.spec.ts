import { isJwtBearer } from "../rate-limit-auth"

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
