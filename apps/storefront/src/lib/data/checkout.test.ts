import { describe, expect, it } from "vitest"
import { getCartPaymentMeta, isNetTermsCart } from "./checkout"

describe("net-terms cart helpers", () => {
  it("detects net terms from payment_terms metadata", () => {
    expect(
      isNetTermsCart({
        id: "cart_1",
        metadata: { payment_terms: "net_30", po_number: "PO-1" },
      } as never)
    ).toBe(true)
  })

  it("detects net terms from net_terms flag", () => {
    expect(
      isNetTermsCart({
        id: "cart_2",
        metadata: { net_terms: true, payment_terms: "prepaid" },
      } as never)
    ).toBe(true)
  })

  it("treats prepaid as non-net-terms", () => {
    expect(
      isNetTermsCart({
        id: "cart_3",
        metadata: { payment_terms: "prepaid" },
      } as never)
    ).toBe(false)
    expect(isNetTermsCart(null)).toBe(false)
  })

  it("reads cart payment meta", () => {
    expect(
      getCartPaymentMeta({
        id: "cart_4",
        metadata: { payment_terms: "net_60", po_number: "PO-9" },
      } as never)
    ).toEqual({ payment_terms: "net_60", po_number: "PO-9" })
  })
})
