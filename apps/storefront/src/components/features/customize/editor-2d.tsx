"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Canvas as FabricCanvas, FabricObject, IText } from "fabric"
import type { HttpTypes } from "@medusajs/types"
import type { Material2D } from "@legacy-crafts/schemas"
import { Button } from "@/components/ui/button"
import { useFabricCanvas } from "@/hooks/use-fabric-canvas"
import { useEditorStore } from "@/stores/editor-store"
import { useCartStore } from "@/stores/cart-store"
import {
  CANVAS_SIZE,
  DEFAULT_SAFE_AREA,
  MATERIALS_2D,
  MAX_ENGRAVING_CHARS,
  buildDesign2DState,
  validateDesign2D,
} from "@/lib/design-2d"
import { ENGRAVING_FONTS, loadGoogleFont } from "@/lib/fonts"
import { designApi, type DesignRecord } from "@/lib/design-client"
import { track } from "@/lib/analytics"
import { isAllowedLogo, sanitizeSvg } from "@/lib/sanitize"
import { cn } from "@/lib/utils"

type FabricObjectLike = FabricObject & { id?: string; text?: string; fontFamily?: string }

/** Attaches a stable id to every object so it survives serialization. */
function ensureId(obj: FabricObjectLike): string {
  if (!obj.id) obj.id = crypto.randomUUID()
  return obj.id
}

/** Snapshot including custom `id` props (undo/redo + save). */
function serialize(canvas: FabricCanvas): string {
  return JSON.stringify(canvas.toObject(["id"]))
}

export function Editor2D({
  product,
  initialDesign,
}: {
  product: HttpTypes.StoreProduct
  initialDesign?: DesignRecord | null
}) {
  const { elRef, getCanvas, getFabric, ready } = useFabricCanvas()
  const {
    material,
    validationErrors,
    saving,
    setMeta,
    setSelected,
    setSaving,
    setValidationErrors,
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useEditorStore()

  const addItem = useCartStore((s) => s.addItem)
  const [name, setName] = useState(initialDesign?.name ?? "Untitled design")
  const [designId, setDesignId] = useState<string | null>(initialDesign?.id ?? null)
  const [selectedFont, setSelectedFont] = useState<string>(ENGRAVING_FONTS[0])
  const [fillColor, setFillColor] = useState("#1a1a1a")
  const [layers, setLayers] = useState<{ id: string; label: string; visible: boolean }[]>([])
  const [gallery, setGallery] = useState<DesignRecord[]>([])
  const [addedMsg, setAddedMsg] = useState<string | null>(null)
  // Track uploaded logo intrinsic resolution for the DPI check (FR-2D-9).
  const logoMetaRef = useRef<Record<string, { naturalWidth: number }>>({})
  const skipHistoryRef = useRef(false)

  const variantId = product.variants?.[0]?.id

  const refreshLayers = useCallback(() => {
    const canvas = getCanvas()
    if (!canvas) return
    setLayers(
      canvas
        .getObjects()
        .map((o) => {
          const obj = o as FabricObjectLike
          const id = ensureId(obj)
          const label =
            obj.type === "i-text" || obj.type === "text"
              ? `Text: ${(obj.text ?? "").slice(0, 18) || "(empty)"}`
              : obj.type === "image"
                ? "Logo / image"
                : obj.type ?? "layer"
          return { id, label, visible: obj.visible !== false }
        })
        .reverse()
    )
  }, [getCanvas])

  const snapshot = useCallback(() => {
    const canvas = getCanvas()
    if (!canvas || skipHistoryRef.current) return
    pushSnapshot(serialize(canvas))
    refreshLayers()
  }, [getCanvas, pushSnapshot, refreshLayers])

  // Wire Fabric events -> history + selection once the canvas is ready.
  useEffect(() => {
    const canvas = getCanvas()
    if (!ready || !canvas) return

    const onModified = () => snapshot()
    const onSelection = () => {
      const active = canvas.getActiveObject() as FabricObjectLike | undefined
      setSelected(active ? ensureId(active) : null)
      if (active && (active.type === "i-text" || active.type === "text")) {
        setSelectedFont((active.fontFamily as string) ?? ENGRAVING_FONTS[0])
      }
    }
    const onCleared = () => setSelected(null)

    canvas.on("object:added", onModified)
    canvas.on("object:modified", onModified)
    canvas.on("object:removed", onModified)
    canvas.on("selection:created", onSelection)
    canvas.on("selection:updated", onSelection)
    canvas.on("selection:cleared", onCleared)

    // Load an existing design (edit/clone flow) or seed the first history entry.
    if (initialDesign && initialDesign.state_json) {
      skipHistoryRef.current = true
      canvas.loadFromJSON(initialDesign.state_json as object).then(() => {
        canvas.getObjects().forEach((o) => ensureId(o as FabricObjectLike))
        canvas.requestRenderAll()
        skipHistoryRef.current = false
        pushSnapshot(serialize(canvas))
        refreshLayers()
      })
      const stateMaterial = (initialDesign.state_json as { materialOverlay?: Material2D })
        .materialOverlay
      if (stateMaterial) setMeta({ material: stateMaterial })
    } else {
      pushSnapshot(serialize(canvas))
    }
    setMeta({ productId: product.id, name })

    return () => {
      canvas.off("object:added", onModified)
      canvas.off("object:modified", onModified)
      canvas.off("object:removed", onModified)
      canvas.off("selection:created", onSelection)
      canvas.off("selection:updated", onSelection)
      canvas.off("selection:cleared", onCleared)
    }
  }, [ready])

  // Reflect material choice as a canvas background tint (FR-2D-7 overlay).
  useEffect(() => {
    const canvas = getCanvas()
    if (!canvas) return
    const tint = MATERIALS_2D.find((m) => m.value === material)?.tint ?? "#ffffff"
    canvas.backgroundColor = tint
    canvas.requestRenderAll()
  }, [material, getCanvas, ready])

  useEffect(() => {
    track("design_started", { mode: "2d", product_id: product.id })
    return () => reset()
  }, [reset, product.id])

  async function addText() {
    const canvas = getCanvas()
    const fabric = getFabric()
    if (!canvas || !fabric) return
    await loadGoogleFont(selectedFont)
    const text = new fabric.IText("Your Text", {
      left: DEFAULT_SAFE_AREA.x + DEFAULT_SAFE_AREA.width / 2,
      top: DEFAULT_SAFE_AREA.y + DEFAULT_SAFE_AREA.height / 2,
      originX: "center",
      originY: "center",
      fontFamily: selectedFont,
      fontSize: 48,
      fill: fillColor,
      textAlign: "center",
    }) as IText & FabricObjectLike
    ensureId(text)
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.requestRenderAll()
  }

  async function onUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const canvas = getCanvas()
    const fabric = getFabric()
    if (!file || !canvas || !fabric) return
    if (!isAllowedLogo(file)) {
      setValidationErrors(["Unsupported file type. Upload a PNG, JPG, or SVG."])
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(["Logo exceeds 5MB. Please upload a smaller file."])
      return
    }
    let url: string
    if (file.type === "image/svg+xml") {
      // Sanitize SVGs before use (strip scripts/handlers/external refs).
      const raw = await file.text()
      const clean = sanitizeSvg(raw)
      url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(clean)))}`
    } else {
      url = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    }
    const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" })
    const imgLike = img as FabricObjectLike & { width?: number }
    const naturalWidth = imgLike.width ?? 0
    const maxW = DEFAULT_SAFE_AREA.width * 0.6
    if (naturalWidth > maxW) img.scale(maxW / naturalWidth)
    img.set({
      left: DEFAULT_SAFE_AREA.x + DEFAULT_SAFE_AREA.width / 2,
      top: DEFAULT_SAFE_AREA.y + DEFAULT_SAFE_AREA.height / 2,
      originX: "center",
      originY: "center",
    })
    const id = ensureId(img as FabricObjectLike)
    logoMetaRef.current[id] = { naturalWidth }
    canvas.add(img)
    canvas.setActiveObject(img)
    canvas.requestRenderAll()
    e.target.value = ""
  }

  function applyFontToSelection(font: string) {
    setSelectedFont(font)
    const canvas = getCanvas()
    const active = canvas?.getActiveObject() as (IText & FabricObjectLike) | undefined
    if (canvas && active && (active.type === "i-text" || active.type === "text")) {
      loadGoogleFont(font).then(() => {
        active.set("fontFamily", font)
        canvas.requestRenderAll()
        snapshot()
      })
    }
  }

  function applyColorToSelection(color: string) {
    setFillColor(color)
    const canvas = getCanvas()
    const active = canvas?.getActiveObject() as (IText & FabricObjectLike) | undefined
    if (canvas && active && (active.type === "i-text" || active.type === "text")) {
      active.set("fill", color)
      canvas.requestRenderAll()
      snapshot()
    }
  }

  function toggleStyle(prop: "fontWeight" | "fontStyle" | "underline") {
    const canvas = getCanvas()
    const active = canvas?.getActiveObject() as (IText & FabricObjectLike) | undefined
    if (!canvas || !active || (active.type !== "i-text" && active.type !== "text")) return
    if (prop === "fontWeight") active.set("fontWeight", active.fontWeight === "bold" ? "normal" : "bold")
    if (prop === "fontStyle") active.set("fontStyle", active.fontStyle === "italic" ? "normal" : "italic")
    if (prop === "underline") active.set("underline", !active.underline)
    canvas.requestRenderAll()
    snapshot()
  }

  function selectLayer(id: string) {
    const canvas = getCanvas()
    if (!canvas) return
    const obj = canvas.getObjects().find((o) => (o as FabricObjectLike).id === id)
    if (obj) {
      canvas.setActiveObject(obj)
      canvas.requestRenderAll()
    }
  }

  function toggleLayerVisible(id: string) {
    const canvas = getCanvas()
    if (!canvas) return
    const obj = canvas.getObjects().find((o) => (o as FabricObjectLike).id === id)
    if (obj) {
      obj.visible = obj.visible === false
      canvas.requestRenderAll()
      snapshot()
    }
  }

  function deleteLayer(id: string) {
    const canvas = getCanvas()
    if (!canvas) return
    const obj = canvas.getObjects().find((o) => (o as FabricObjectLike).id === id)
    if (obj) {
      canvas.remove(obj)
      canvas.requestRenderAll()
    }
  }

  function restore(json: string | null) {
    const canvas = getCanvas()
    if (!canvas || !json) return
    skipHistoryRef.current = true
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.getObjects().forEach((o) => ensureId(o as FabricObjectLike))
      canvas.backgroundColor =
        MATERIALS_2D.find((m) => m.value === material)?.tint ?? "#ffffff"
      canvas.requestRenderAll()
      skipHistoryRef.current = false
      refreshLayers()
    })
  }

  function collectState() {
    const canvas = getCanvas()
    if (!canvas) return null
    const objects = canvas.getObjects().map((o) => {
      const obj = o as FabricObjectLike & Record<string, unknown>
      return { ...obj.toObject(["id"]), id: obj.id }
    })
    return buildDesign2DState(objects as never, {
      material,
      baseImageUrl: product.thumbnail ?? null,
    })
  }

  function runValidation(): { state: ReturnType<typeof collectState>; ok: boolean } {
    const state = collectState()
    if (!state) return { state: null, ok: false }
    const logoMeta = Object.values(logoMetaRef.current).map((m) => ({
      naturalWidth: m.naturalWidth,
      displayWidthInches: 2, // engraving plate ~2in; conservative for the DPI gate
    }))
    const errors = validateDesign2D(state, logoMeta)
    setValidationErrors(errors)
    return { state, ok: errors.length === 0 }
  }

  async function handleSave(): Promise<DesignRecord | null> {
    const { state, ok } = runValidation()
    if (!state || !ok) return null
    setSaving(true)
    try {
      let record: DesignRecord
      if (designId) {
        const res = await designApi.update(designId, { name, state_json: state })
        record = res.design
      } else {
        const res = await designApi.create({
          name,
          mode: "2d",
          product_id: product.id,
          variant_id: variantId,
          state_json: state,
        })
        record = res.design
        setDesignId(record.id)
        setMeta({ designId: record.id })
      }
      // Generate/refresh the server-side preview for the gallery + cart.
      try {
        const { preview_url } = await designApi.preview(record.id)
        record = { ...record, preview_url }
      } catch {
        // preview is best-effort
      }
      track("design_saved", { design_id: record.id, mode: "2d", product_id: product.id })
      setAddedMsg("Saved to your gallery")
      setTimeout(() => setAddedMsg(null), 2500)
      return record
    } finally {
      setSaving(false)
    }
  }

  async function handleAddToCart() {
    const record = await handleSave()
    if (!record || !variantId) return
    await addItem(variantId, 1, {
      design_id: record.id,
      design_name: record.name,
      preview_url: record.preview_url,
      customization_mode: "2d",
    })
    track("design_added_to_cart", { design_id: record.id, mode: "2d", product_id: product.id })
    setAddedMsg("Added to cart with your design")
    setTimeout(() => setAddedMsg(null), 2500)
  }

  async function loadGallery() {
    try {
      const { designs } = await designApi.list()
      setGallery(designs.filter((d) => d.mode === "2d"))
    } catch {
      setGallery([])
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr_300px]">
      {/* Left: tools */}
      <aside className="space-y-6 rounded-lg border border-border bg-card p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Design name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setMeta({ name: e.target.value })
            }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Text</p>
          <select
            value={selectedFont}
            onChange={(e) => applyFontToSelection(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {ENGRAVING_FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => applyColorToSelection(e.target.value)}
              aria-label="Text color"
              className="h-9 w-9 cursor-pointer rounded border border-border"
            />
            <button onClick={() => toggleStyle("fontWeight")} className="rounded border border-border px-2 py-1 text-sm font-bold">B</button>
            <button onClick={() => toggleStyle("fontStyle")} className="rounded border border-border px-2 py-1 text-sm italic">I</button>
            <button onClick={() => toggleStyle("underline")} className="rounded border border-border px-2 py-1 text-sm underline">U</button>
          </div>
          <Button onClick={addText} size="sm" className="w-full">
            Add text
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Logo</p>
          <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground hover:bg-muted">
            Upload PNG/JPG/SVG
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={onUploadLogo} className="hidden" />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Material</p>
          <div className="grid grid-cols-3 gap-2">
            {MATERIALS_2D.map((m) => (
              <button
                key={m.value}
                onClick={() => setMeta({ material: m.value })}
                className={cn(
                  "rounded-md border p-2 text-xs",
                  material === m.value ? "border-accent ring-2 ring-accent" : "border-border"
                )}
              >
                <span className="mb-1 block h-6 w-full rounded" style={{ backgroundColor: m.tint }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Center: canvas */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => restore(undo())} disabled={!canUndo()}>
            Undo
          </Button>
          <Button size="sm" variant="outline" onClick={() => restore(redo())} disabled={!canRedo()}>
            Redo
          </Button>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={() => runValidation()}>
            Validate
          </Button>
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="accent" onClick={handleAddToCart} disabled={saving || !variantId}>
            Add to cart
          </Button>
        </div>

        <div className="relative mx-auto w-fit rounded-lg border border-border bg-white shadow-sm">
          {/* Safe-area guide overlay (FR-2D-9) */}
          <div
            className="pointer-events-none absolute z-10 rounded border-2 border-dashed border-accent/40"
            style={{
              left: `${(DEFAULT_SAFE_AREA.x / CANVAS_SIZE) * 100}%`,
              top: `${(DEFAULT_SAFE_AREA.y / CANVAS_SIZE) * 100}%`,
              width: `${(DEFAULT_SAFE_AREA.width / CANVAS_SIZE) * 100}%`,
              height: `${(DEFAULT_SAFE_AREA.height / CANVAS_SIZE) * 100}%`,
            }}
          />
          <canvas ref={elRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="max-w-full" />
        </div>

        {addedMsg && (
          <p className="rounded-md bg-accent/10 px-4 py-2 text-center text-sm text-accent-foreground">{addedMsg}</p>
        )}
        {validationErrors.length > 0 && (
          <ul className="space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {validationErrors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        )}
        <p className="text-center text-xs text-muted-foreground">
          Keep text within the dashed safe area. Max {MAX_ENGRAVING_CHARS} characters per line.
        </p>
      </div>

      {/* Right: layers + gallery */}
      <aside className="space-y-6 rounded-lg border border-border bg-card p-4">
        <div>
          <p className="mb-2 text-sm font-medium">Layers</p>
          {layers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No layers yet. Add text or a logo.</p>
          ) : (
            <ul className="space-y-1">
              {layers.map((l) => (
                <li key={l.id} className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm">
                  <button onClick={() => selectLayer(l.id)} className="flex-1 truncate text-left">
                    {l.label}
                  </button>
                  <button onClick={() => toggleLayerVisible(l.id)} aria-label="Toggle visibility" className="text-xs text-muted-foreground">
                    {l.visible ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => deleteLayer(l.id)} aria-label="Delete layer" className="text-xs text-destructive">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">My designs</p>
            <button onClick={loadGallery} className="text-xs text-accent hover:underline">
              Refresh
            </button>
          </div>
          {gallery.length === 0 ? (
            <p className="text-xs text-muted-foreground">Saved designs appear here.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2">
              {gallery.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => {
                      setDesignId(d.id)
                      setName(d.name)
                      restore(JSON.stringify(d.state_json))
                    }}
                    className="w-full overflow-hidden rounded-md border border-border text-left hover:border-accent"
                  >
                    {d.preview_url ? (
                      <img src={d.preview_url} alt={d.name} className="aspect-square w-full object-cover" />
                    ) : (
                      <span className="flex aspect-square w-full items-center justify-center bg-muted text-xs">No preview</span>
                    )}
                    <span className="block truncate px-1 py-1 text-xs">{d.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
