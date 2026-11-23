"use client"

import { useId, useRef, useState, type DragEvent } from "react"
import { FileText, Upload, X } from "lucide-react"
import {
  UPLOAD_HINT,
  uploadAccept,
  uploadDesignFile,
  type DesignFile,
  type UploadKind,
} from "@/lib/design-uploads"
import { cn } from "@/lib/utils"

function formatSize(bytes: number): string {
  if (!bytes) return ""
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`
}

/**
 * Upload field for customer files: a bordered drop area (click or drag) that sends
 * each file to Medusa and lists what is attached, with remove controls. `max` 1 is
 * a single design (product page); higher allows several files (cart, whole order).
 */
export function DesignDropzone({
  label,
  description,
  kind = "design",
  files,
  max = 1,
  onAdd,
  onFiles,
  onRemove,
  disabled = false,
  className,
}: {
  label: string
  description?: string
  kind?: UploadKind
  files: DesignFile[]
  max?: number
  /** Called once per uploaded file, in order. */
  onAdd: (file: DesignFile) => Promise<void> | void
  /** Takes the picked files itself (limits, upload, matching) instead of `onAdd`. */
  onFiles?: (files: File[]) => Promise<void>
  onRemove: (index: number) => Promise<void> | void
  disabled?: boolean
  className?: string
}) {
  const inputId = useId()
  const hintId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const remaining = Math.max(0, max - files.length)

  async function handleFiles(list: FileList | File[] | null | undefined) {
    const picked = Array.from(list ?? [])
    if (!picked.length) return
    setError(null)
    if (onFiles) {
      if (inputRef.current) inputRef.current.value = ""
      setBusy(true)
      try {
        await onFiles(picked)
      } finally {
        setBusy(false)
      }
      return
    }
    // A single-file field replaces its file; a list takes as many as fit.
    const batch = max === 1 ? picked.slice(0, 1) : picked.slice(0, remaining)
    if (picked.length > batch.length && max > 1) {
      setError(`Up to ${max} files. ${picked.length - batch.length} not added.`)
    }
    setBusy(true)
    try {
      for (const file of batch) {
        const uploaded = await uploadDesignFile(file, kind)
        await onAdd(uploaded)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(false)
    if (disabled || busy) return
    if (max > 1 && remaining === 0) return
    void handleFiles(e.dataTransfer.files)
  }

  const canPick = !(disabled || busy) && (max === 1 || remaining > 0)

  return (
    <div className={cn("min-w-0", className)}>
      <p className="m-0 block font-outfit text-[0.75em] tracking-[0.14em] text-[#131111] uppercase">
        {label}
      </p>
      {description ? (
        <p className="mt-[0.35em] m-0 font-outfit text-[0.75em] leading-[1.4] text-[#6B635C]">
          {description}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="mt-[0.6em] m-0 flex list-none flex-col gap-[0.4em] p-0">
          {files.map((f, i) => (
            <li
              key={`${f.url}-${i}`}
              className="flex min-w-0 items-center gap-2 border border-[#131111]/12 bg-[#F3F3F3] px-3 py-2 font-outfit text-[0.8125em] text-[#131111]"
            >
              <FileText className="size-4 shrink-0 text-[#6B635C]" strokeWidth={1.5} aria-hidden />
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-[#131111] underline-offset-[0.2em] hover:underline"
              >
                {f.filename}
              </a>
              <span className="shrink-0 text-[0.875em] text-[#6B635C] tabular-nums">{formatSize(f.size)}</span>
              <button
                type="button"
                onClick={() => void onRemove(i)}
                disabled={disabled || busy}
                aria-label={`Remove ${f.filename}`}
                className="flex size-7 shrink-0 items-center justify-center text-[#6B635C] hover:text-[#131111] disabled:opacity-40"
              >
                <X className="size-4" strokeWidth={1.5} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {max > 1 || files.length === 0 ? (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault()
            if (canPick) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          aria-disabled={!canPick}
          className={cn(
            "mt-[0.6em] flex cursor-pointer flex-col items-center justify-center gap-[0.35em] border border-dashed border-[#131111]/30 bg-white px-4 py-[1.25em] text-center transition-colors hover:border-[#131111] hover:bg-[#F3F3F3]",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#131111]",
            dragging && "border-[#131111] bg-[#F3F3F3]",
            !canPick && "pointer-events-none opacity-50"
          )}
        >
          <Upload className="size-5 text-[#131111]" strokeWidth={1.5} aria-hidden />
          <span className="font-outfit text-[0.8125em] font-medium tracking-[0.06em] text-[#131111] uppercase">
            {busy ? "Uploading…" : max > 1 ? "Upload files" : "Upload your design"}
          </span>
          <span id={hintId} className="font-outfit text-[0.75em] text-[#6B635C]">
            Click or drop {max > 1 ? "files" : "a file"} here. {UPLOAD_HINT[kind]}
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={uploadAccept(kind)}
            multiple={max > 1}
            aria-describedby={hintId}
            className="sr-only"
            disabled={!canPick}
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </label>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || busy}
            className="mt-[0.5em] font-outfit text-[0.75em] text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111] disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Replace file"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={uploadAccept(kind)}
            tabIndex={-1}
            aria-hidden
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </>
      )}

      {max > 1 && files.length > 0 && !onFiles ? (
        <p className="mt-[0.35em] m-0 font-outfit text-[0.6875em] text-[#6B635C] tabular-nums">
          {files.length} of {max} files
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-[0.4em] m-0 font-outfit text-[0.75em] text-[#8A2D25]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
