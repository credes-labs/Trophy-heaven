"use client"

import { useRef, useState, type ReactNode } from "react"
import { FileText, Upload, X } from "lucide-react"
import {
  uploadAccept,
  uploadDesignFile,
  type DesignFile,
  type UploadKind,
} from "@/lib/design-uploads"
import { cn } from "@/lib/utils"

/**
 * File picker that uploads a design to Medusa and hands the stored file back.
 * Shows the attached file with a remove control once set.
 */
export function DesignUploadButton({
  value,
  onUploaded,
  onRemove,
  label = "Upload design",
  kind = "design",
  disabled = false,
  className,
  children,
}: {
  value: DesignFile | null
  onUploaded: (file: DesignFile) => Promise<void> | void
  onRemove: () => Promise<void> | void
  label?: string
  kind?: UploadKind
  disabled?: boolean
  className?: string
  children?: ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onPick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const uploaded = await uploadDesignFile(file, kind)
      await onUploaded(uploaded)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("min-w-0", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={uploadAccept(kind)}
        tabIndex={-1}
        aria-hidden
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => void onPick(e.target.files?.[0])}
      />
      {value ? (
        <div className="flex min-w-0 items-center gap-2 font-outfit text-[0.75em] text-[#131111]">
          <FileText className="size-3.5 shrink-0 text-[#6B635C]" strokeWidth={1.5} aria-hidden />
          <a
            href={value.url}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 truncate text-[#131111] underline underline-offset-[0.2em]"
          >
            {value.filename}
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || busy}
            className="shrink-0 text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          >
            {busy ? "Uploading…" : "Replace"}
          </button>
          <button
            type="button"
            onClick={() => void onRemove()}
            disabled={disabled || busy}
            aria-label={`Remove ${value.filename}`}
            className="flex size-6 shrink-0 items-center justify-center text-[#6B635C] hover:text-[#131111]"
          >
            <X className="size-3.5" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className="inline-flex items-center gap-1.5 font-outfit text-[0.75em] tracking-[0.06em] text-[#131111] uppercase underline-offset-[0.2em] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] disabled:opacity-50"
        >
          <Upload className="size-3.5" strokeWidth={1.5} aria-hidden />
          {busy ? "Uploading…" : (children ?? label)}
        </button>
      )}
      {error ? (
        <p role="alert" className="mt-1 m-0 font-outfit text-[0.75em] text-[#8A2D25]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
