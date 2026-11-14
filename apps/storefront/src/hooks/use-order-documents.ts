"use client"

import { useState } from "react"
import { useCartStore } from "@/stores/cart-store"
import {
  ORDER_DESIGN_KEY,
  ORDER_DOCUMENTS_KEY,
  ORDER_DOCUMENTS_MAX,
  readOrderDocuments,
  uploadDesignFile,
  type DesignFile,
} from "@/lib/design-uploads"

function cartFiles(): DesignFile[] {
  return readOrderDocuments(
    (useCartStore.getState().cart?.metadata ?? {}) as Record<string, unknown>
  )
}

/**
 * Order-wide customer files on the cart (`order_documents`): the list, plus add and
 * remove that upload to Medusa and write cart metadata. Each add reads the newest cart
 * so several files picked at once all append. The older single file folds into the list.
 */
export function useOrderDocuments() {
  const cart = useCartStore((s) => s.cart)
  const updateCartMetadata = useCartStore((s) => s.updateCartMetadata)
  const files = readOrderDocuments((cart?.metadata ?? {}) as Record<string, unknown>)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = (next: DesignFile[]) =>
    updateCartMetadata({ [ORDER_DOCUMENTS_KEY]: next, [ORDER_DESIGN_KEY]: null })

  async function addFiles(list: FileList | File[] | null | undefined) {
    const picked = Array.from(list ?? [])
    if (!picked.length) return
    setError(null)
    const room = Math.max(0, ORDER_DOCUMENTS_MAX - cartFiles().length)
    const batch = picked.slice(0, room)
    if (picked.length > batch.length) {
      setError(`Up to ${ORDER_DOCUMENTS_MAX} files per order. ${picked.length - batch.length} not added.`)
    }
    setBusy(true)
    try {
      for (const file of batch) {
        const uploaded = await uploadDesignFile(file, "document")
        await save([...cartFiles(), uploaded])
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function addFile(file: DesignFile) {
    await save([...cartFiles(), file])
  }

  async function remove(index: number) {
    setError(null)
    await save(cartFiles().filter((_, i) => i !== index))
  }

  return {
    files,
    max: ORDER_DOCUMENTS_MAX,
    full: files.length >= ORDER_DOCUMENTS_MAX,
    busy,
    error,
    addFiles,
    addFile,
    remove,
    ready: Boolean(cart),
  }
}
