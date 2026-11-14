"use client"

import { useRef } from "react"
import { FileText, Upload, X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { DesignDropzone } from "@/components/features/cart/design-dropzone"
import { useOrderDocuments } from "@/hooks/use-order-documents"
import { ORDER_DESIGN_NOTES_KEY, uploadAccept } from "@/lib/design-uploads"
import { cn } from "@/lib/utils"

type OrderDocuments = ReturnType<typeof useOrderDocuments>

/**
 * Order-wide files on the cart page: designs, name lists, briefs and spreadsheets that
 * apply to the whole order (bulk orders). Stored on cart metadata, which Medusa copies
 * onto the order; the shop owner gets them with the new-order email. Per-piece designs
 * stay on each cart line.
 */
export function OrderDesignPanel({ className }: { className?: string }) {
  const cart = useCartStore((s) => s.cart)
  const docs = useOrderDocuments()
  const meta = (cart?.metadata ?? {}) as Record<string, unknown>
  const notes = typeof meta[ORDER_DESIGN_NOTES_KEY] === "string" ? String(meta[ORDER_DESIGN_NOTES_KEY]) : ""

  return (
    <section
      aria-label="Your files for this order"
      className={cn("border border-[#131111]/12 bg-white p-4", className)}
    >
      <DesignDropzone
        kind="document"
        label="Upload your designs"
        description="Logos, artwork, name lists, briefs or spreadsheets for the whole order. They go to our team with your order. You can also attach a design to each item."
        files={docs.files}
        max={docs.max}
        disabled={!docs.ready}
        onAdd={docs.addFile}
        onRemove={docs.remove}
      />
      {notes ? (
        <p className="mt-3 m-0 font-outfit text-[0.75em] leading-[1.4] text-[#6B635C]">
          Your earlier note: {notes}
        </p>
      ) : null}
    </section>
  )
}

/**
 * Cart drawer header control: the button opens the file picker straight away (several
 * files at once); attached files list underneath with remove controls.
 */
export function OrderDocumentsButton({ docs }: { docs: OrderDocuments }) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={!docs.ready || docs.busy || docs.full}
        title={docs.full ? `Up to ${docs.max} files per order` : "Logos, artwork, name lists or spreadsheets for the whole order"}
        className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[0.125em] border border-[#131111]/25 px-3 font-outfit text-[0.6875em] tracking-[0.12em] text-[#131111] uppercase transition-colors hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] disabled:opacity-50"
      >
        <Upload className="size-3.5" strokeWidth={1.5} aria-hidden />
        {docs.busy ? "Uploading…" : "Upload designs"}
        {docs.files.length ? (
          <span className="tabular-nums" aria-label={`${docs.files.length} attached`}>
            ({docs.files.length})
          </span>
        ) : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={uploadAccept("document")}
        tabIndex={-1}
        aria-hidden
        className="hidden"
        onChange={(e) => {
          void docs.addFiles(e.target.files).finally(() => {
            if (inputRef.current) inputRef.current.value = ""
          })
        }}
      />
    </>
  )
}

/** The drawer's list of order-wide files (and any upload error), shown only when there is something to show. */
export function OrderDocumentsList({ docs, className }: { docs: OrderDocuments; className?: string }) {
  if (!docs.files.length && !docs.error) return null
  return (
    <div className={cn("border-b border-[#131111]/12 px-5 py-3", className)}>
      {docs.files.length ? (
        <>
          <p className="m-0 font-outfit text-[0.6875em] tracking-[0.12em] text-[#6B635C] uppercase">
            Files for the whole order
          </p>
          <ul className="mt-1.5 m-0 flex list-none flex-col gap-1 p-0">
            {docs.files.map((f, i) => (
              <li key={`${f.url}-${i}`} className="flex min-w-0 items-center gap-2 font-outfit text-[0.75em] text-[#131111]">
                <FileText className="size-3.5 shrink-0 text-[#6B635C]" strokeWidth={1.5} aria-hidden />
                <a href={f.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-[#131111] underline-offset-[0.2em] hover:underline">
                  {f.filename}
                </a>
                <button
                  type="button"
                  onClick={() => void docs.remove(i)}
                  aria-label={`Remove ${f.filename}`}
                  className="flex size-6 shrink-0 items-center justify-center text-[#6B635C] hover:text-[#131111]"
                >
                  <X className="size-3.5" strokeWidth={1.5} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {docs.error ? (
        <p role="alert" className="mt-1 m-0 font-outfit text-[0.75em] text-[#8A2D25]">
          {docs.error}
        </p>
      ) : null}
    </div>
  )
}
