"use client"

import { useEffect, useId, useState } from "react"
import { useCartStore } from "@/stores/cart-store"
import { DesignUploadButton } from "@/components/features/cart/design-upload-button"
import {
  ORDER_DESIGN_KEY,
  ORDER_DESIGN_NOTES_KEY,
  readDesignFile,
} from "@/lib/design-uploads"
import { cn } from "@/lib/utils"

const NOTES_MAX = 2000

/**
 * Order-wide designs: one sticker/artwork file and written design notes that apply
 * to every piece in the cart (bulk orders). Stored on cart metadata, which Medusa
 * copies onto the order. Per-piece files stay on each cart line.
 */
export function OrderDesignPanel({ className }: { className?: string }) {
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)
  const updateCartMetadata = useCartStore((s) => s.updateCartMetadata)
  const notesId = useId()
  const meta = (cart?.metadata ?? {}) as Record<string, unknown>
  const file = readDesignFile(meta[ORDER_DESIGN_KEY])
  const savedNotes = typeof meta[ORDER_DESIGN_NOTES_KEY] === "string" ? String(meta[ORDER_DESIGN_NOTES_KEY]) : ""
  const [notes, setNotes] = useState(savedNotes)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => setNotes(savedNotes), [savedNotes])

  const dirty = notes.trim() !== savedNotes.trim()

  async function saveNotes() {
    setStatus(null)
    try {
      await updateCartMetadata({ [ORDER_DESIGN_NOTES_KEY]: notes.trim() || null })
      setStatus("Saved")
    } catch {
      setStatus("Could not save. Try again.")
    }
  }

  return (
    <section
      aria-label="Your designs for this order"
      className={cn("border border-[#131111]/12 bg-white p-4", className)}
    >
      <p className="m-0 font-outfit text-[0.6875em] font-medium tracking-[0.14em] text-[#131111] uppercase">
        Your designs
      </p>
      <p className="mt-1 m-0 font-outfit text-[0.75em] leading-[1.4] text-[#6B635C]">
        One file and brief for the whole order, applied to every piece. You can still attach a
        design to each item below.
      </p>

      <div className="mt-3">
        <DesignUploadButton
          value={file}
          disabled={!cart}
          label="Upload design for entire order"
          onUploaded={(f) => updateCartMetadata({ [ORDER_DESIGN_KEY]: f })}
          onRemove={() => updateCartMetadata({ [ORDER_DESIGN_KEY]: null })}
        />
      </div>

      <label
        htmlFor={notesId}
        className="mt-4 block font-outfit text-[0.6875em] font-medium tracking-[0.14em] text-[#131111] uppercase"
      >
        Enter your designs
      </label>
      <textarea
        id={notesId}
        value={notes}
        maxLength={NOTES_MAX}
        rows={3}
        onChange={(e) => {
          setNotes(e.target.value)
          setStatus(null)
        }}
        placeholder="Describe your sticker or artwork: names, logo placement, colours, text…"
        className="mt-1.5 block w-full resize-y rounded-[0.125em] border border-[#131111]/20 bg-white px-3 py-2 font-outfit text-[0.8125em] leading-[1.4] text-[#131111] placeholder:text-[#6B635C]/80 focus-visible:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-outfit text-[0.6875em] text-[#6B635C] tabular-nums" aria-live="polite">
          {status ?? `${notes.length}/${NOTES_MAX}`}
        </span>
        <button
          type="button"
          onClick={() => void saveNotes()}
          disabled={!cart || loading || !dirty}
          className="h-8 rounded-[0.125em] border border-[#131111] px-3 font-outfit text-[0.6875em] tracking-[0.12em] text-[#131111] uppercase transition-colors hover:bg-[#131111] hover:text-white disabled:pointer-events-none disabled:opacity-40"
        >
          Save designs
        </button>
      </div>
    </section>
  )
}
