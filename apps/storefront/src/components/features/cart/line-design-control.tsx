"use client"

import type { HttpTypes } from "@medusajs/types"
import { DesignUploadButton } from "@/components/features/cart/design-upload-button"
import { useOrderDocuments } from "@/hooks/use-order-documents"
import { isMappableDesign, readLinePieces } from "@/lib/design-mapping"
import { LINE_DESIGN_KEY, LINE_DESIGN_PIECES_KEY, readDesignFile } from "@/lib/design-uploads"
import { useCartStore } from "@/stores/cart-store"

/**
 * A cart line's design: its own upload button, or, once designs are matched per trophy,
 * a count that opens the matching dialog.
 */
export function LineDesignControl({
  item,
  disabled,
  className,
}: {
  item: HttpTypes.StoreCartLineItem
  disabled?: boolean
  className?: string
}) {
  const updateItemMetadata = useCartStore((s) => s.updateItemMetadata)
  const docs = useOrderDocuments()
  const value = readDesignFile(item.metadata?.[LINE_DESIGN_KEY])

  if (Array.isArray(item.metadata?.[LINE_DESIGN_PIECES_KEY])) {
    const pieces = readLinePieces(item)
    const withDesign = pieces.filter(Boolean).length
    return (
      <button
        type="button"
        onClick={docs.openMapping}
        className={`block text-left font-outfit text-[0.75em] text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111] ${className ?? ""}`}
      >
        {withDesign} of {pieces.length} {pieces.length === 1 ? "trophy has" : "trophies have"} a design · Edit
      </button>
    )
  }

  return (
    <DesignUploadButton
      className={className}
      value={value}
      disabled={disabled}
      label="Upload design for this item"
      validate={(file) => {
        const replacesDesign = Boolean(value && isMappableDesign(value))
        const isDesign = isMappableDesign({ name: file.name, mime_type: file.type })
        return isDesign && !replacesDesign && docs.state.room === 0
          ? `Your cart already has ${docs.state.limit} design${docs.state.limit === 1 ? "" : "s"}, one per trophy.`
          : null
      }}
      onUploaded={(f) => updateItemMetadata(item.id, { [LINE_DESIGN_KEY]: f })}
      onRemove={() =>
        value && isMappableDesign(value)
          ? docs.removeFile(value.url)
          : updateItemMetadata(item.id, { [LINE_DESIGN_KEY]: null })
      }
    />
  )
}
