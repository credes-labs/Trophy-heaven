"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
    <div className="space-y-2">
      <p className="text-sm font-medium">Promo code</p>

      {applied.length > 0 && (
        <ul className="space-y-1.5">
          {applied.map((appliedCode) => (
            <li
              key={appliedCode}
              className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-1.5"
            >
              <span className="font-mono text-xs font-medium">{appliedCode}</span>
              <button
                type="button"
                onClick={() => void handleRemove(appliedCode)}
                disabled={busy}
                aria-label={`Remove promo code ${appliedCode}`}
                className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          inputSize="sm"
          className="flex-1"
          aria-label="Promo code"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void handleApply()
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" loading={busy} onClick={handleApply}>
          Apply
        </Button>
      </div>
      {message && (
        <p
          className={`text-xs ${message.type === "ok" ? "text-success" : "text-destructive"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
