"use client"

import { useRef } from "react"
import { FileText, Upload, X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { DesignDropzone } from "@/components/features/cart/design-dropzone"
import type { OrderDocuments } from "@/hooks/use-order-documents"
import { ORDER_DESIGN_NOTES_KEY, uploadAccept, type DesignFile } from "@/lib/design-uploads"
import { cn } from "@/lib/utils"

function FileRows({
  title,
  files,
  onRemove,
}: {
  title: string
  files: DesignFile[]
  onRemove: (url: string) => void
}) {
  if (!files.length) return null
  return (
    <div>
      <p className="m-0 font-outfit text-[0.6875em] tracking-[0.12em] text-[#6B635C] uppercase tabular-nums">
        {title}
      </p>
      <ul className="mt-1.5 m-0 flex list-none flex-col gap-1 p-0">
        {files.map((f) => (
          <li key={f.url} className="flex min-w-0 items-center gap-2 font-outfit text-[0.75em] text-[#131111]">
            <FileText className="size-3.5 shrink-0 text-[#6B635C]" strokeWidth={1.5} aria-hidden />
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate text-[#131111] underline-offset-[0.2em] hover:underline"
            >
              {f.filename}
            </a>
            <button
              type="button"
              onClick={() => onRemove(f.url)}
              aria-label={`Remove ${f.filename}`}
              className="flex size-6 shrink-0 items-center justify-center text-[#6B635C] hover:text-[#131111]"
            >
              <X className="size-3.5" strokeWidth={1.5} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Designs (with the matching control), whole-order documents, and any upload error. */
function OrderFiles({ docs }: { docs: OrderDocuments }) {
  const { state } = docs
  const onRemove = (url: string) => void docs.removeFile(url).catch(() => undefined)
  return (
    <div className="flex flex-col gap-3">
      <FileRows
        title={`Designs (${state.designs.length} of ${state.limit})`}
        files={state.designs}
        onRemove={onRemove}
      />
      {state.designs.length ? (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p
            role={state.problem ? "alert" : undefined}
            className={cn(
              "m-0 min-w-0 flex-1 font-outfit text-[0.75em] leading-[1.4]",
              state.problem ? "text-[#8A2D25]" : "text-[#6B635C]"
            )}
          >
            {state.problem ??
              (state.designs.length === 1 && state.emptyPieces === 0
                ? "On every trophy."
                : `${state.pieces - state.emptyPieces} of ${state.pieces} trophies have a design.`)}
          </p>
          <button
            type="button"
            onClick={docs.openMapping}
            className="shrink-0 font-outfit text-[0.75em] text-[#131111] underline underline-offset-[0.2em]"
          >
            Match to trophies
          </button>
        </div>
      ) : null}
      <FileRows title="Documents for the whole order" files={state.documents} onRemove={onRemove} />
      {docs.error ? (
        <p role="alert" className="m-0 font-outfit text-[0.75em] leading-[1.4] text-[#8A2D25]">
          {docs.error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Order files on the cart page. Images are matched to trophies; PDFs and office files
 * go to the team as they are. Stored on cart and line metadata, which Medusa copies
 * onto the order, and listed in the owner's new-order email.
 */
export function OrderDesignPanel({ docs, className }: { docs: OrderDocuments; className?: string }) {
  const cart = useCartStore((s) => s.cart)
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
        description={`Up to ${docs.state.limit} ${docs.state.limit === 1 ? "image" : "images"}, one per trophy, which you can match to each piece. PDFs, Word and Excel files go to our team as they are.`}
        files={[]}
        max={2}
        disabled={!docs.ready || docs.busy}
        onFiles={docs.addFiles}
        onAdd={() => undefined}
        onRemove={() => undefined}
      />
      <div className={docs.files.length || docs.error ? "mt-4" : undefined}>
        <OrderFiles docs={docs} />
      </div>
      {notes ? (
        <p className="mt-3 m-0 font-outfit text-[0.75em] leading-[1.4] text-[#6B635C]">
          Your earlier note: {notes}
        </p>
      ) : null}
    </section>
  )
}

/** Cart drawer header control: opens the file picker straight away. */
export function OrderDocumentsButton({ docs }: { docs: OrderDocuments }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const count = docs.files.length

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={!docs.ready || docs.busy}
        title="Images, one per trophy. PDFs, Word and Excel files for the whole order."
        className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[0.125em] border border-[#131111]/25 px-3 font-outfit text-[0.6875em] tracking-[0.12em] text-[#131111] uppercase transition-colors hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] disabled:opacity-50"
      >
        <Upload className="size-3.5" strokeWidth={1.5} aria-hidden />
        {docs.busy ? "Uploading…" : "Upload designs"}
        {count ? (
          <span className="tabular-nums" aria-label={`${count} attached`}>
            ({count})
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
          // Copy first: clearing the input empties the live FileList.
          const files = Array.from(e.target.files ?? [])
          e.target.value = ""
          void docs.addFiles(files)
        }}
      />
    </>
  )
}

/** The drawer's file list, shown only when there is something to show. */
export function OrderDocumentsList({ docs, className }: { docs: OrderDocuments; className?: string }) {
  if (!docs.files.length && !docs.error) return null
  return (
    <div className={cn("max-h-[38dvh] overflow-y-auto border-b border-[#131111]/12 px-5 py-3", className)}>
      <OrderFiles docs={docs} />
    </div>
  )
}
