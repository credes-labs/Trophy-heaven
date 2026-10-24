"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"

export function PromoCode() {
  const cart = useCartStore((s) => s.cart)
  const applyPromoCode = useCartStore((s) => s.applyPromoCode)
  const removePromoCode = useCartStore((s) => s.removePromoCode)
  const [code, setCode] = useState("")
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const applied = (cart?.promotions ?? [])
    .map((p) => p.code)
    .filter((c): c is string => Boolean(c))

  async function handleApply() {
    const trimmed = code.trim()
    if (!trimmed) {
      setMessage({ type: "err", text: "Enter a promo code" })
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      await applyPromoCode(trimmed)
      setCode("")
      setMessage({ type: "ok", text: `Code “${trimmed}” applied.` })
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message || "Could not apply code" })
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(appliedCode: string) {
    setBusy(true)
    setMessage(null)
    try {
      await removePromoCode(appliedCode)
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message || "Could not remove code" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-w-0">
      <p className="m-0 max-w-[68ch] font-outfit text-[0.8125em] tracking-[-0.02em] text-pretty text-[#6B635C]">
        Have a coupon? Enter your code.
      </p>

      {applied.length > 0 && (
        <ul className="mt-[0.6em] m-0 flex list-none flex-wrap gap-2 p-0">
          {applied.map((appliedCode) => (
            <li
              key={appliedCode}
              className="flex items-center gap-2 border border-[#131111]/15 px-2.5 py-1"
            >
              <span className="font-outfit text-[0.75em] tracking-[0.08em] text-[#131111] uppercase">
                {appliedCode}
              </span>
              <button
                type="button"
                onClick={() => void handleRemove(appliedCode)}
                disabled={busy}
                aria-label={`Remove promo code ${appliedCode}`}
                className="text-[#6B635C] transition-colors hover:text-[#131111] disabled:opacity-50"
              >
                <X className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-[0.65em] flex min-w-0 items-end gap-[0.75em]">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          aria-label="Coupon code"
          className="min-w-0 flex-1 border-0 border-b border-[#131111]/20 bg-transparent px-0 py-1.5 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] placeholder:text-[#6B635C] focus-visible:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#131111]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void handleApply()
            }
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleApply()}
          className="shrink-0 rounded-[0.125em] border border-[#131111] px-[1.1em] py-[0.45em] font-outfit text-[0.75em] tracking-[0.14em] text-[#131111] uppercase transition-opacity hover:opacity-70 disabled:opacity-50"
        >
          Apply
        </button>
      </div>
      {message && (
        <p
          className={`mt-[0.5em] m-0 font-outfit text-[0.75em] ${
            message.type === "ok" ? "text-[#6B635C]" : "text-destructive"
          }`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
