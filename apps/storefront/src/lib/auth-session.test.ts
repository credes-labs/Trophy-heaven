import { describe, expect, it } from "vitest"
import {
  httpStatusFromError,
  shouldClearSessionOnRetrieveFailure,
} from "./auth-session"

describe("shouldClearSessionOnRetrieveFailure", () => {
  it("clears when there is no existing customer", () => {
    expect(shouldClearSessionOnRetrieveFailure(false)).toBe(true)
    expect(shouldClearSessionOnRetrieveFailure(false, 500)).toBe(true)
  })

  it("keeps an existing session on transient errors", () => {
    expect(shouldClearSessionOnRetrieveFailure(true, 429)).toBe(false)
    expect(shouldClearSessionOnRetrieveFailure(true, 500)).toBe(false)
    expect(shouldClearSessionOnRetrieveFailure(true)).toBe(false)
  })

  it("clears an existing session on 401 or 403", () => {
    expect(shouldClearSessionOnRetrieveFailure(true, 401)).toBe(true)
    expect(shouldClearSessionOnRetrieveFailure(true, 403)).toBe(true)
  })
})

describe("httpStatusFromError", () => {
  it("reads status / statusCode from SDK-shaped errors", () => {
    expect(httpStatusFromError({ status: 401 })).toBe(401)
    expect(httpStatusFromError({ statusCode: 429 })).toBe(429)
    expect(httpStatusFromError(new Error("network"))).toBeUndefined()
  })
})
