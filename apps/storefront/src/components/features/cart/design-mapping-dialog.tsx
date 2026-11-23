"use client"

// Plain <img>: customer uploads live on whichever storage host is configured.
import { useEffect, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { useOrderDocuments } from "@/hooks/use-order-documents"
import { fillEmptyPieces, stableLines, suggestPieces, unusedDesigns, type PieceMap } from "@/lib/design-mapping"
import type { DesignFile } from "@/lib/design-uploads"
import { cn } from "@/lib/utils"

function DesignThumb({ file, className }: { file: DesignFile | null; className?: string }) {
  if (!file) {
    return (
      <span
        aria-hidden
        className={cn("block shrink-0 border border-dashed border-[#131111]/25 bg-white", className)}
      />
    )
  }
  return (
    <img
      src={file.url}
      alt=""
      loading="lazy"
      className={cn("block shrink-0 bg-[#F3F3F3] object-cover", className)}
    />
  )
}

function MappingForm({ onClose }: { onClose: () => void }) {
  const cart = useCartStore((s) => s.cart)
  const docs = useOrderDocuments()
  const { designs, limit, overBy } = docs.state
  const lines = useMemo(() => stableLines(cart?.items ?? []), [cart?.items])
  const [draft, setDraft] = useState<PieceMap>(() => suggestPieces(lines, designs))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const byUrl = new Map(designs.map((d) => [d.url, d]))
  const unused = unusedDesigns(draft, designs)
  const canSave = overBy === 0 && unused.length === 0 && !saving

  function setPiece(lineId: string, piece: number, url: string) {
    setDraft((d) => ({
      ...d,
      [lineId]: d[lineId].map((f, i) => (i === piece ? (byUrl.get(url) ?? null) : f)),
    }))
  }

  async function remove(file: DesignFile) {
    setError(null)
    try {
      await docs.removeFile(file.url)
      const remaining = designs.filter((d) => d.url !== file.url)
      setDraft((d) =>
        fillEmptyPieces(
          Object.fromEntries(
            Object.entries(d).map(([id, pieces]) => [
              id,
              pieces.map((f) => (f?.url === file.url ? null : f)),
            ])
          ),
          remaining
        )
      )
    } catch {
      setError("Could not remove that design. Please try again.")
    }
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      await docs.saveMapping(draft)
      onClose()
    } catch {
      setError("Could not save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex max-h-[inherit] flex-col font-outfit text-[#131111]">
      <header className="flex items-start justify-between gap-4 border-b border-[#131111]/12 px-5 py-4 sm:px-6">
        <div>
          <h2 className="m-0 text-[1.125em] font-normal tracking-[0.1em] uppercase">
            Match designs to trophies
          </h2>
          <p className="mt-1 m-0 text-[0.8125em] leading-[1.4] text-[#6B635C]">
            Choose which design goes on each trophy. A design can go on more than one.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-9 shrink-0 items-center justify-center text-[#6B635C] hover:text-[#131111]"
        >
          <X className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <p className="m-0 text-[0.6875em] tracking-[0.12em] text-[#6B635C] uppercase tabular-nums">
          Your designs ({designs.length} of {limit})
        </p>
        <ul className="mt-2 m-0 flex list-none gap-2 overflow-x-auto p-0 pb-2">
          {designs.map((design, i) => {
            const isUnused = unused.some((u) => u.url === design.url)
            return (
              <li key={design.url} className="relative w-[5.5rem] shrink-0">
                <DesignThumb
                  file={design}
                  className={cn("size-[5.5rem] border", isUnused ? "border-[#8A2D25]" : "border-[#131111]/12")}
                />
                <span className="absolute top-1 left-1 flex size-5 items-center justify-center bg-[#131111] text-[0.6875em] text-white tabular-nums">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => void remove(design)}
                  aria-label={`Remove ${design.filename}`}
                  className="absolute top-1 right-1 flex size-6 items-center justify-center bg-white/90 text-[#131111] hover:bg-white"
                >
                  <X className="size-3.5" strokeWidth={1.5} aria-hidden />
                </button>
                <p className="mt-1 m-0 truncate text-[0.6875em] text-[#6B635C]" title={design.filename}>
                  {design.filename}
                </p>
                {isUnused ? <p className="m-0 text-[0.6875em] text-[#8A2D25]">Not used</p> : null}
              </li>
            )
          })}
        </ul>

        <ul className="mt-3 m-0 list-none divide-y divide-[#131111]/12 border-t border-[#131111]/12 p-0">
          {lines.map((line) => {
            const pieces = draft[line.id] ?? []
            const title = line.product_title ?? line.title ?? "Trophy"
            return (
              <li key={line.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="m-0 min-w-0 text-[0.875em] font-medium">
                    {title}
                    {line.variant_title ? (
                      <span className="font-normal text-[#6B635C]"> · {line.variant_title}</span>
                    ) : null}
                  </p>
                  {pieces.length > 1 && pieces[0] ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({ ...d, [line.id]: pieces.map(() => pieces[0]) }))
                      }
                      className="shrink-0 text-[0.75em] text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111]"
                    >
                      Use first for all
                    </button>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {pieces.map((file, piece) => {
                    const label = pieces.length > 1 ? `Trophy ${piece + 1} of ${pieces.length}` : "Trophy"
                    return (
                      <div key={piece} className="flex items-center gap-3">
                        <DesignThumb file={file} className="size-11 border border-[#131111]/12" />
                        <span className="w-[6.5rem] shrink-0 text-[0.8125em] text-[#6B635C]">{label}</span>
                        <select
                          aria-label={`Design for ${title}, ${label}`}
                          value={file?.url ?? ""}
                          onChange={(e) => setPiece(line.id, piece, e.target.value)}
                          className="h-10 min-w-0 flex-1 rounded-[0.125em] border border-[#131111]/25 bg-white px-2 text-[0.8125em] text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#131111]"
                        >
                          <option value="">No design</option>
                          {designs.map((d, i) => (
                            <option key={d.url} value={d.url}>
                              {i + 1}. {d.filename}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <footer className="border-t border-[#131111]/12 px-5 py-4 sm:px-6">
        {error || overBy > 0 || unused.length > 0 ? (
          <p role="status" className="mb-3 m-0 text-[0.8125em] leading-[1.4] text-[#8A2D25]">
            {error ??
              (overBy > 0
                ? `Remove ${overBy} design${overBy === 1 ? "" : "s"}: you can have up to ${limit}.`
                : `Put ${unused.length === 1 ? "this design" : `these ${unused.length} designs`} on a trophy, or remove ${unused.length === 1 ? "it" : "them"}.`)}
          </p>
        ) : null}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 text-[0.75em] tracking-[0.12em] text-[#6B635C] uppercase hover:text-[#131111]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!canSave}
            className="h-11 rounded-[0.125em] bg-[#131111] px-6 text-[0.75em] tracking-[0.14em] text-[#F2F1EF] uppercase transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save matching"}
          </button>
        </div>
      </footer>
    </div>
  )
}

/** Mounted once beside the cart drawer; a native modal so it stacks above the drawer. */
export function DesignMappingDialog() {
  const open = useCartStore((s) => s.designMappingOpen)
  const setOpen = useCartStore((s) => s.setDesignMappingOpen)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label="Match designs to trophies"
      onCancel={(e) => {
        e.preventDefault()
        setOpen(false)
      }}
      // Escape closes this dialog only, not the cart drawer underneath.
      onKeyDown={(e) => e.stopPropagation()}
      className="m-auto max-h-[min(92dvh,48rem)] w-[calc(100vw-1.5rem)] max-w-[40rem] overflow-hidden bg-white p-0 shadow-xl backdrop:bg-[#131111]/50"
    >
      {open ? <MappingForm onClose={() => setOpen(false)} /> : null}
    </dialog>
  )
}
