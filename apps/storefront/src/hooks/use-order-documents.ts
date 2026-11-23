"use client"

import { useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { useCartStore } from "@/stores/cart-store"
import {
  LINE_DESIGN_KEY,
  LINE_DESIGN_PIECES_KEY,
  ORDER_DESIGN_KEY,
  ORDER_DOCUMENTS_KEY,
  ORDER_DOCUMENTS_MAX,
  readDesignFile,
  uploadDesignFile,
  type DesignFile,
} from "@/lib/design-uploads"
import {
  cartDesignState,
  isMappableDesign,
  partitionUploads,
  readLinePieces,
  suggestPieces,
  toStoredPieces,
  type PieceMap,
} from "@/lib/design-mapping"

function latest() {
  const cart = useCartStore.getState().cart
  const lines = (cart?.items ?? []) as HttpTypes.StoreCartLineItem[]
  const metadata = (cart?.metadata ?? {}) as Record<string, unknown>
  return { lines, state: cartDesignState(metadata, lines) }
}

const urls = (pieces: (DesignFile | null)[]) => pieces.map((f) => f?.url ?? "").join("|")

/** Writes the whole-order list, then only the lines whose mapping changed. */
async function persist(designs: DesignFile[], documents: DesignFile[], map: PieceMap) {
  const { updateCartMetadata, updateItemMetadata } = useCartStore.getState()
  await updateCartMetadata({
    [ORDER_DOCUMENTS_KEY]: [...designs, ...documents],
    [ORDER_DESIGN_KEY]: null,
  })
  for (const line of latest().lines) {
    const next = map[line.id]
    if (!next) continue
    const stored = line.metadata?.[LINE_DESIGN_PIECES_KEY]
    // A longer stored list is left over from a higher quantity; trim it.
    const stale = Array.isArray(stored) && stored.length !== next.length
    if (!stale && urls(next) === urls(readLinePieces(line))) continue
    const lineFile = readDesignFile(line.metadata?.[LINE_DESIGN_KEY])
    await updateItemMetadata(line.id, {
      [LINE_DESIGN_PIECES_KEY]: toStoredPieces(next),
      // A PDF on the line stays; an image now lives in the per-piece list.
      ...(lineFile && isMappableDesign(lineFile) ? { [LINE_DESIGN_KEY]: null } : {}),
    })
  }
}

function limitMessage(pieces: number, rejectedDesigns: number, rejectedDocuments: number) {
  const parts: string[] = []
  if (rejectedDesigns) {
    parts.push(
      `${rejectedDesigns} design${rejectedDesigns === 1 ? "" : "s"} not added: your cart has ${pieces} ${
        pieces === 1 ? "trophy" : "trophies"
      }, one design each. Add more trophies, or send extra designs in one PDF.`
    )
  }
  if (rejectedDocuments) {
    parts.push(
      `${rejectedDocuments} document${rejectedDocuments === 1 ? "" : "s"} not added: up to ${ORDER_DOCUMENTS_MAX} per order.`
    )
  }
  return parts.join(" ")
}

/**
 * Customer files for the order. Images are designs: capped at the trophies in the cart
 * and matched to them (one design goes on everything; several open the matching
 * dialog). PDFs and office files are whole-order documents and need no matching.
 */
export function useOrderDocuments() {
  const cart = useCartStore((s) => s.cart)
  const setMappingOpen = useCartStore((s) => s.setDesignMappingOpen)
  const lines = (cart?.items ?? []) as HttpTypes.StoreCartLineItem[]
  const state = cartDesignState((cart?.metadata ?? {}) as Record<string, unknown>, lines)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addFiles(list: FileList | File[] | null | undefined) {
    const picked = Array.from(list ?? [])
    if (!picked.length) return
    const before = latest().state
    const { accepted, rejectedDesigns, rejectedDocuments } = partitionUploads(
      picked,
      before.room,
      Math.max(0, ORDER_DOCUMENTS_MAX - before.documents.length)
    )
    let message = limitMessage(before.pieces, rejectedDesigns, rejectedDocuments)
    setError(message || null)
    if (!accepted.length) return

    setBusy(true)
    const uploaded: DesignFile[] = []
    try {
      for (const file of accepted) {
        const isDesign = isMappableDesign({ name: file.name, mime_type: file.type })
        uploaded.push(await uploadDesignFile(file, isDesign ? "design" : "document"))
      }
    } catch (e) {
      message = [(e as Error).message, message].filter(Boolean).join(" ")
      setError(message)
    }

    // Keep whatever made it, even if a later file failed.
    try {
      if (uploaded.length) {
        const now = latest()
        const designs = [...now.state.designs, ...uploaded.filter((f) => isMappableDesign(f))]
        const documents = [...now.state.documents, ...uploaded.filter((f) => !isMappableDesign(f))]
        await persist(designs, documents, suggestPieces(now.lines, designs))
        if (designs.length > 1 && uploaded.some((f) => isMappableDesign(f))) setMappingOpen(true)
      }
    } catch (e) {
      setError((e as Error).message || "Could not save your files. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  async function saveMapping(map: PieceMap) {
    const { state: now } = latest()
    await persist(now.designs, now.documents, map)
  }

  /** Removes a file from the order and from every trophy it was on. */
  async function removeFile(url: string) {
    setError(null)
    const { lines: currentLines, state: now } = latest()
    const { updateCartMetadata, updateItemMetadata } = useCartStore.getState()
    const keep = (f: DesignFile) => f.url !== url
    await updateCartMetadata({
      [ORDER_DOCUMENTS_KEY]: [...now.designs.filter(keep), ...now.documents.filter(keep)],
      [ORDER_DESIGN_KEY]: null,
    })
    for (const line of currentLines) {
      const pieces = readLinePieces(line)
      const lineFile = readDesignFile(line.metadata?.[LINE_DESIGN_KEY])
      const onLine = lineFile?.url === url
      if (!onLine && !pieces.some((f) => f?.url === url)) continue
      await updateItemMetadata(line.id, {
        ...(Array.isArray(line.metadata?.[LINE_DESIGN_PIECES_KEY])
          ? { [LINE_DESIGN_PIECES_KEY]: toStoredPieces(pieces.map((f) => (f?.url === url ? null : f))) }
          : {}),
        ...(onLine ? { [LINE_DESIGN_KEY]: null } : {}),
      })
    }
  }

  return {
    state,
    files: [...state.designs, ...state.documents],
    busy,
    error,
    addFiles,
    saveMapping,
    removeFile,
    openMapping: () => setMappingOpen(true),
    ready: Boolean(cart && lines.length),
  }
}

export type OrderDocuments = ReturnType<typeof useOrderDocuments>
