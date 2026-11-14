"use client"

import { useCartStore } from "@/stores/cart-store"
import { DesignDropzone } from "@/components/features/cart/design-dropzone"
import {
  ORDER_DESIGN_KEY,
  ORDER_DESIGN_NOTES_KEY,
  ORDER_DOCUMENTS_KEY,
  ORDER_DOCUMENTS_MAX,
  readOrderDocuments,
} from "@/lib/design-uploads"
import { cn } from "@/lib/utils"

/**
 * Order-wide files: designs, name lists, briefs and spreadsheets that apply to the
 * whole order (bulk orders). Stored on cart metadata, which Medusa copies onto the
 * order; the shop owner gets them with the new-order email. Per-piece designs stay
 * on each cart line.
 */
export function OrderDesignPanel({ className }: { className?: string }) {
  const cart = useCartStore((s) => s.cart)
  const updateCartMetadata = useCartStore((s) => s.updateCartMetadata)
  const meta = (cart?.metadata ?? {}) as Record<string, unknown>
  const files = readOrderDocuments(meta)
  const notes = typeof meta[ORDER_DESIGN_NOTES_KEY] === "string" ? String(meta[ORDER_DESIGN_NOTES_KEY]) : ""

  // Reads the cart from the store at call time so several uploads in a row each
  // append to the latest list. The older single-file key folds into the list.
  async function save(next: typeof files) {
    await updateCartMetadata({ [ORDER_DOCUMENTS_KEY]: next, [ORDER_DESIGN_KEY]: null })
  }

  return (
    <section
      aria-label="Your files for this order"
      className={cn("border border-[#131111]/12 bg-white p-4", className)}
    >
      <DesignDropzone
        kind="document"
        label="Upload your designs"
        description="Logos, artwork, name lists, briefs or spreadsheets for the whole order. They go to our team with your order. You can also attach a design to each item."
        files={files}
        max={ORDER_DOCUMENTS_MAX}
        disabled={!cart}
        onAdd={async (file) => {
          const latest = readOrderDocuments(
            (useCartStore.getState().cart?.metadata ?? {}) as Record<string, unknown>
          )
          await save([...latest, file])
        }}
        onRemove={(index) => save(files.filter((_, i) => i !== index))}
      />
      {notes ? (
        <p className="mt-3 m-0 font-outfit text-[0.75em] leading-[1.4] text-[#6B635C]">
          Your earlier note: {notes}
        </p>
      ) : null}
    </section>
  )
}
