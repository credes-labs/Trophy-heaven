"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Canvas as FabricCanvas, FabricObject, IText } from "fabric"
import type { HttpTypes } from "@medusajs/types"
import type { Material2D } from "@legacy-crafts/schemas"
import { Bold, Italic, Redo2, Underline, Undo2 } from "lucide-react"
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
import { formatMoney } from "@/lib/format"
import { isAllowedLogo, sanitizeSvg } from "@/lib/sanitize"
import { cn } from "@/lib/utils"
import { cheapestInStockVariant } from "@/lib/product-filters"
import {
  PLATES,
  PLATE_TO_MATERIAL_2D,
  SAMPLE_LINES,
  SIZES,
  configOptions,
  engravingLines,
  getFont,
  getPlate,
  inkFor,
  resolveVariant,
  serializeConfig,
  summarizeConfig,
  type LineKey,
  type PlaqueConfig,
} from "@/lib/configurator/plaque"
import { readLayout, writeLayout } from "@/lib/configurator/layout-store"
import { StudioTopBar } from "./configurator/studio-top-bar"
import { SwatchGroup, type SwatchOption } from "./configurator/swatch-group"
import type { PlaqueContext } from "./editor-2d-loader"

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

const SEED_ROWS: { key: LineKey; y: number; size: number; caps: boolean }[] = [
  { key: "title", y: 0.24, size: 22, caps: true },
  { key: "name", y: 0.5, size: 46, caps: false },
  { key: "detail", y: 0.8, size: 20, caps: false },
]

const METAL_SWATCH = (color: string) =>
  `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${color} 45%, white) 0%, ${color} 48%, color-mix(in srgb, ${color} 55%, black) 100%)`

const sectionLabel = "m-0 font-outfit text-[0.75em] font-medium tracking-[0.14em] text-[#131111] uppercase"
const fieldClass =
  "h-[2.75em] w-full rounded-[0.125em] border border-[#131111]/20 bg-white px-[0.85em] font-outfit text-[0.9375em] text-[#131111] focus-visible:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
const iconButton =
  "flex size-[2.5em] items-center justify-center rounded-full border border-[#131111]/15 bg-[#FBFBF7]/85 text-[#131111] backdrop-blur-sm transition-colors hover:bg-[#FBFBF7] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
const styleButton =
  "flex size-[2.5em] items-center justify-center rounded-full border border-[#131111]/20 text-[#131111] hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
const pillOutline =
  "flex h-[3em] items-center justify-center rounded-full border border-[#131111]/25 px-[1.1em] font-outfit text-[0.75em] tracking-[0.08em] whitespace-nowrap text-[#131111] uppercase transition-colors hover:bg-[#131111]/5 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

/** Scales the fixed 800px Fabric surface to fit its stage cell (Fabric maps pointers through CSS transforms). */
function useFitScale(padding: { x: number; top: number; bottom: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const next = Math.min((width - padding.x * 2) / CANVAS_SIZE, (height - padding.top - padding.bottom) / CANVAS_SIZE)
      setScale(Math.max(0.2, Math.min(1, next)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [padding.x, padding.top, padding.bottom])
  return { ref, scale }
}

const STAGE_PADDING = { x: 16, top: 64, bottom: 72 }

export function Editor2D({
  product,
  initialDesign,
  preferredVariantId,
  plaque = null,
}: {
  product: HttpTypes.StoreProduct
  initialDesign?: DesignRecord | null
  preferredVariantId?: string
  plaque?: PlaqueContext | null
}) {
  const router = useRouter()
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
  const [config, setConfig] = useState<PlaqueConfig | null>(plaque?.config ?? null)
  const [name, setName] = useState(initialDesign?.name ?? "Untitled design")
  const [designId, setDesignId] = useState<string | null>(initialDesign?.id ?? null)
  const [selectedFont, setSelectedFont] = useState<string>(
    plaque ? getFont(plaque.config.font).family2d : ENGRAVING_FONTS[0]
  )
  const [fillColor, setFillColor] = useState(plaque ? inkFor(plaque.config) : "#1a1a1a")
  const [layers, setLayers] = useState<{ id: string; label: string; visible: boolean }[]>([])
  const [gallery, setGallery] = useState<DesignRecord[]>([])
  const [addedMsg, setAddedMsg] = useState<string | null>(null)
  // Track uploaded logo intrinsic resolution for the DPI check (FR-2D-9).
  const logoMetaRef = useRef<Record<string, { naturalWidth: number }>>({})
  const skipHistoryRef = useRef(false)
  const { ref: stageRef, scale } = useFitScale(STAGE_PADDING)

  const plaqueVariant = plaque && config ? resolveVariant(plaque.variants, config.size) : undefined
  const variantId = plaque
    ? (plaqueVariant?.id ?? preferredVariantId)
    : (product.variants?.find((v) => v.id === preferredVariantId)?.id ?? cheapestInStockVariant(product)?.id)
  const productVariant = product.variants?.find((v) => v.id === variantId)
  const price = plaqueVariant
    ? plaqueVariant.amount != null
      ? formatMoney(plaqueVariant.amount, plaqueVariant.currency)
      : null
    : productVariant?.calculated_price?.calculated_amount != null
      ? formatMoney(productVariant.calculated_price.calculated_amount, productVariant.calculated_price.currency_code ?? "inr")
      : null
  const tint = config ? getPlate(config.plate).color : (MATERIALS_2D.find((m) => m.value === material)?.tint ?? "#ffffff")
  const studio3dHref = config ? `/customize?${serializeConfig(config)}` : null

  // Plaque mode: the URL carries the shared configuration (variant = size).
  useEffect(() => {
    if (!config) return
    const params = new URLSearchParams(window.location.search)
    for (const [key, value] of new URLSearchParams(serializeConfig(config))) params.set(key, value)
    if (variantId) params.set("variant", variantId)
    const query = params.toString()
    if (window.location.search.slice(1) !== query) {
      window.history.replaceState(null, "", `${window.location.pathname}?${query}`)
    }
  }, [config, variantId])

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

  /** Lays the configurator's engraving lines out in the safe area as editable text. */
  async function seedFromConfig(canvas: FabricCanvas, seed: PlaqueConfig) {
    const fabric = getFabric()
    if (!fabric) return
    const font = getFont(seed.font)
    await loadGoogleFont(font.family2d)
    const lines = engravingLines(seed)
    const empty = !lines.title && !lines.name && !lines.detail
    for (const row of SEED_ROWS) {
      const raw = lines[row.key] || (empty ? SAMPLE_LINES[row.key] : "")
      if (!raw) continue
      const left = seed.align === "left" ? DEFAULT_SAFE_AREA.x + 24 : DEFAULT_SAFE_AREA.x + DEFAULT_SAFE_AREA.width / 2
      const text = new fabric.IText(row.caps || font.caps ? raw.toUpperCase() : raw, {
        left,
        top: DEFAULT_SAFE_AREA.y + DEFAULT_SAFE_AREA.height * row.y,
        originX: seed.align === "left" ? "left" : "center",
        originY: "center",
        fontFamily: font.family2d,
        fontSize: row.size,
        fontStyle: row.key === "name" ? font.style : "normal",
        charSpacing: row.caps ? 180 : 0,
        fill: inkFor(seed),
        textAlign: seed.align === "left" ? "left" : "center",
      }) as IText & FabricObjectLike
      ensureId(text)
      canvas.add(text)
    }
  }

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

    const loadJson = (json: object) => {
      skipHistoryRef.current = true
      canvas.loadFromJSON(json).then(() => {
        canvas.getObjects().forEach((o) => ensureId(o as FabricObjectLike))
        canvas.backgroundColor = tint
        canvas.requestRenderAll()
        skipHistoryRef.current = false
        pushSnapshot(serialize(canvas))
        refreshLayers()
      })
    }

    // Load an existing design (edit/clone flow), the layout from the 3D studio,
    // or the configurator's engraving lines; otherwise seed the first history entry.
    const stored = plaque && !initialDesign ? readLayout(product.id) : null
    if (initialDesign && initialDesign.state_json) {
      loadJson(initialDesign.state_json as object)
      const stateMaterial = (initialDesign.state_json as { materialOverlay?: Material2D })
        .materialOverlay
      if (stateMaterial && !plaque) setMeta({ material: stateMaterial })
    } else if (stored?.fabric) {
      loadJson(stored.fabric as object)
    } else if (plaque) {
      skipHistoryRef.current = true
      void seedFromConfig(canvas, plaque.config).finally(() => {
        skipHistoryRef.current = false
        canvas.requestRenderAll()
        pushSnapshot(serialize(canvas))
        refreshLayers()
      })
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

  // Plaque mode: the 2D material follows the plate metal.
  useEffect(() => {
    if (config) setMeta({ material: PLATE_TO_MATERIAL_2D[config.plate] })
  }, [config, setMeta])

  // Reflect material choice as a canvas background tint (FR-2D-7 overlay).
  useEffect(() => {
    const canvas = getCanvas()
    if (!canvas) return
    canvas.backgroundColor = tint
    canvas.requestRenderAll()
  }, [tint, getCanvas, ready])

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
      canvas.backgroundColor = tint
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
    const state = buildDesign2DState(objects as never, {
      material,
      baseImageUrl: product.thumbnail ?? null,
    })
    // The plaque's 3D choices travel with the layout so the workshop gets one spec.
    return config
      ? { ...state, configurator: { kind: "plaque" as const, options: configOptions({ ...config, face: "custom" }) } }
      : state
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
      ...(config ? { configuration: { ...summarizeConfig({ ...config, face: "custom" }), engraving: engravingLines(config) } } : {}),
    })
    track("design_added_to_cart", { design_id: record.id, mode: "2d", product_id: product.id })
    setAddedMsg("Added to cart with your design")
    setTimeout(() => setAddedMsg(null), 2500)
  }

  /**
   * Plaque mode: export the engraving area as a transparent PNG, hand it to the
   * 3D studio through sessionStorage and switch modes. With nothing on the
   * canvas the studio keeps its engraving lines.
   */
  function openIn3D({ validate }: { validate: boolean }) {
    const canvas = getCanvas()
    if (!canvas || !config) return
    if (validate && !runValidation().ok) return
    const objects = canvas.getObjects().filter((o) => o.visible !== false)
    if (objects.length === 0) {
      router.push(`/customize?${serializeConfig({ ...config, face: "text" })}`)
      return
    }
    canvas.discardActiveObject()
    canvas.backgroundColor = ""
    canvas.renderAll()
    const image = canvas.toDataURL({
      format: "png",
      multiplier: 2,
      left: DEFAULT_SAFE_AREA.x,
      top: DEFAULT_SAFE_AREA.y,
      width: DEFAULT_SAFE_AREA.width,
      height: DEFAULT_SAFE_AREA.height,
    })
    const fabricJson = canvas.toObject(["id"])
    canvas.backgroundColor = tint
    canvas.requestRenderAll()
    if (!writeLayout(product.id, { image, fabric: fabricJson })) {
      setValidationErrors(["This layout is too large to carry into 3D on this device. Try a smaller logo file."])
      return
    }
    track("design_saved", { mode: "2d", product_id: product.id })
    router.push(`/customize?${serializeConfig({ ...config, face: "custom" })}`)
  }

  async function loadGallery() {
    try {
      const { designs } = await designApi.list()
      setGallery(designs.filter((d) => d.mode === "2d"))
    } catch {
      setGallery([])
    }
  }

  function setPlaque<K extends keyof PlaqueConfig>(key: K, value: PlaqueConfig[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c))
  }

  const plateOptions: SwatchOption<PlaqueConfig["plate"]>[] = PLATES.map((p) => ({
    id: p.id,
    label: p.label,
    visual: <span className="size-full" style={{ background: METAL_SWATCH(p.color) }} />,
  }))
  const materialOptions: SwatchOption<Material2D>[] = MATERIALS_2D.map((m) => ({
    id: m.value,
    label: m.label,
    visual: <span className="size-full" style={{ background: METAL_SWATCH(m.tint) }} />,
  }))
  const sizeOptions: SwatchOption<PlaqueConfig["size"]>[] = SIZES.map((s) => {
    const v = plaque ? resolveVariant(plaque.variants, s.id) : undefined
    return {
      id: s.id,
      label: s.detail,
      note: v?.amount != null ? formatMoney(v.amount, v.currency) : undefined,
      visual: <span className="font-outfit text-[0.9375em] font-medium tracking-[-0.02em] text-[#131111]">{s.label}</span>,
    }
  })
  const inkSwatches = config
    ? [inkFor({ ...config, fill: "natural" }), "#d9b46a", "#141210"]
    : ["#1a1a1a", "#d9b46a", "#ffffff"]

  return (
    <section
      aria-labelledby="editor-2d-heading"
      className="grid h-full grid-rows-[45dvh_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28em)] lg:grid-rows-1"
    >
      <div
        ref={stageRef}
        className="relative min-h-0 w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#FBFBF7_0%,#F2F1EF_48%,#E6E0D3_100%)]"
      >
        <StudioTopBar
          mode="2d"
          hrefs={studio3dHref ? { "3d": studio3dHref, "2d": "#" } : {}}
          onNavigate={
            studio3dHref
              ? (mode, event) => {
                  if (mode !== "3d") return
                  event.preventDefault()
                  openIn3D({ validate: false })
                }
              : undefined
          }
        />
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: STAGE_PADDING.top, width: CANVAS_SIZE * scale, height: CANVAS_SIZE * scale }}
        >
          <div
            className="absolute top-0 left-0 overflow-hidden rounded-[0.25em] shadow-[0_18px_40px_-24px_rgba(43,29,16,0.55)]"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, transform: `scale(${scale})`, transformOrigin: "0 0" }}
          >
            {/* Safe-area guide overlay (FR-2D-9) */}
            <div
              className="pointer-events-none absolute z-10 rounded border-2 border-dashed border-[#131111]/35"
              style={{
                left: `${(DEFAULT_SAFE_AREA.x / CANVAS_SIZE) * 100}%`,
                top: `${(DEFAULT_SAFE_AREA.y / CANVAS_SIZE) * 100}%`,
                width: `${(DEFAULT_SAFE_AREA.width / CANVAS_SIZE) * 100}%`,
                height: `${(DEFAULT_SAFE_AREA.height / CANVAS_SIZE) * 100}%`,
              }}
            />
            <canvas ref={elRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[1em] flex items-center justify-between gap-3 px-[1em] sm:bottom-[1.25em] sm:px-[1.25em]">
          <p className="m-0 hidden font-outfit text-[0.75em] tracking-[0.08em] text-[#6B635C] uppercase sm:block">
            Keep engraving inside the dashed area
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className={iconButton} aria-label="Undo" onClick={() => restore(undo())} disabled={!canUndo()}>
              <Undo2 className="size-[1em]" strokeWidth={1.5} aria-hidden />
            </button>
            <button type="button" className={iconButton} aria-label="Redo" onClick={() => restore(redo())} disabled={!canRedo()}>
              <Redo2 className="size-[1em]" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => runValidation()}
              className="h-[2.5em] rounded-full border border-[#131111]/15 bg-[#FBFBF7]/85 px-[1em] font-outfit text-[0.75em] tracking-[0.08em] text-[#131111] uppercase backdrop-blur-sm hover:bg-[#FBFBF7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            >
              Validate
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col border-t border-[#131111]/10 bg-[#FBFBF7] lg:border-t-0 lg:border-l">
        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-[clamp(1.25rem,2.5vw,2.25em)] pt-[0.9em] pb-[1.5em] lg:pt-[1.75em]">
          <p className="m-0 hidden font-outfit text-[0.75em] tracking-[0.14em] text-[#6B635C] uppercase lg:block">
            Design studio · 2D layout
          </p>
          <h1
            id="editor-2d-heading"
            className="m-0 font-outfit text-[1.375rem] leading-[1.05] font-normal tracking-[-0.04em] text-balance text-[#131111] lg:mt-[0.4em] lg:text-[clamp(1.75rem,3vw,2.5em)]"
          >
            Design your {product.title}
          </h1>
          <p className="mt-[0.6em] mb-0 hidden font-outfit text-[0.9375em] leading-[1.45] tracking-[-0.01em] text-pretty text-[#6B635C] lg:block">
            {config
              ? "Place text and your logo freely inside the engraving area, then apply it to the plaque in 3D."
              : "Add engraving text and your logo, pick a material finish, then save or add to cart."}
          </p>

          {validationErrors.length > 0 ? (
            <ul role="alert" className="mt-[1em] mb-0 list-none space-y-1 rounded-[0.25em] border border-[#8A2D25]/30 bg-[#8A2D25]/5 p-[0.85em] font-outfit text-[0.8125em] text-[#8A2D25]">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-[1.4em] flex flex-col gap-[1.6em]">
            <div className="flex flex-col gap-[0.8em]">
              <p className={sectionLabel}>Text</p>
              <label className="sr-only" htmlFor="editor-2d-font">
                Font
              </label>
              <select
                id="editor-2d-font"
                value={selectedFont}
                onChange={(e) => applyFontToSelection(e.target.value)}
                className={fieldClass}
              >
                {ENGRAVING_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap items-center gap-2">
                {inkSwatches.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColorToSelection(color)}
                    aria-label={`Text colour ${color}`}
                    aria-pressed={fillColor.toLowerCase() === color.toLowerCase()}
                    className={cn(
                      "size-[2.5em] rounded-full ring-offset-2 ring-offset-[#FBFBF7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#131111]",
                      fillColor.toLowerCase() === color.toLowerCase() ? "ring-[1.5px] ring-[#131111]" : "ring-1 ring-[#131111]/15"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => applyColorToSelection(e.target.value)}
                  aria-label="Text color"
                  className="h-[2.5em] w-[2.5em] cursor-pointer rounded-full border border-[#131111]/20 bg-transparent p-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
                />
                <span aria-hidden className="mx-1 h-[1.5em] w-px bg-[#131111]/15" />
                <button type="button" onClick={() => toggleStyle("fontWeight")} aria-label="Bold" className={styleButton}>
                  <Bold className="size-[1em]" strokeWidth={1.75} aria-hidden />
                </button>
                <button type="button" onClick={() => toggleStyle("fontStyle")} aria-label="Italic" className={styleButton}>
                  <Italic className="size-[1em]" strokeWidth={1.75} aria-hidden />
                </button>
                <button type="button" onClick={() => toggleStyle("underline")} aria-label="Underline" className={styleButton}>
                  <Underline className="size-[1em]" strokeWidth={1.75} aria-hidden />
                </button>
              </div>
              <Button
                onClick={addText}
                variant="outline"
                className="h-[2.75em] w-full rounded-full border-[#131111]/25 font-outfit text-[0.8125em] tracking-[0.08em] text-[#131111] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
              >
                Add text
              </Button>
            </div>

            <div className="flex flex-col gap-[0.6em]">
              <p className={sectionLabel}>Layers</p>
              {layers.length === 0 ? (
                <p className="m-0 font-outfit text-[0.8125em] text-[#6B635C]">No layers yet. Add text or a logo.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {layers.map((l) => (
                    <li key={l.id} className="flex items-center gap-2 rounded-[0.25em] border border-[#131111]/12 bg-white px-[0.75em] py-[0.45em] font-outfit text-[0.8125em]">
                      <button type="button" onClick={() => selectLayer(l.id)} className="flex-1 truncate text-left text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
                        {l.label}
                      </button>
                      <button type="button" onClick={() => toggleLayerVisible(l.id)} aria-label="Toggle visibility" className="text-[#6B635C] hover:text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
                        {l.visible ? "Hide" : "Show"}
                      </button>
                      <button type="button" onClick={() => deleteLayer(l.id)} aria-label="Delete layer" className="text-[#8A2D25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-[0.6em]">
              <p className={sectionLabel}>Logo</p>
              <label className="relative flex cursor-pointer items-center justify-center rounded-[0.25em] border border-dashed border-[#131111]/25 bg-white px-3 py-[1em] font-outfit text-[0.8125em] text-[#6B635C] hover:border-[#131111]/50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#131111]">
                Upload PNG / JPG / SVG
                <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={onUploadLogo} className="sr-only" />
              </label>
            </div>

            {config ? (
              <>
                <SwatchGroup legend="Plate" name="plate-2d" value={config.plate} options={plateOptions} onChange={(v) => setPlaque("plate", v)} />
                <SwatchGroup legend="Size" name="size-2d" value={config.size} options={sizeOptions} onChange={(v) => setPlaque("size", v)} />
              </>
            ) : (
              <SwatchGroup
                legend="Material"
                name="material-2d"
                value={material ?? MATERIALS_2D[0].value}
                options={materialOptions}
                onChange={(v) => setMeta({ material: v })}
              />
            )}

            <div className="flex flex-col gap-[0.5em]">
              <label htmlFor="editor-2d-name" className={sectionLabel}>
                Design name
              </label>
              <input
                id="editor-2d-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setMeta({ name: e.target.value })
                }}
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-[0.6em]">
              <div className="flex items-center justify-between">
                <p className={sectionLabel}>My designs</p>
                <button type="button" onClick={loadGallery} className="font-outfit text-[0.75em] text-[#131111] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
                  Refresh
                </button>
              </div>
              {gallery.length === 0 ? (
                <p className="m-0 font-outfit text-[0.8125em] text-[#6B635C]">Saved designs appear here.</p>
              ) : (
                <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
                  {gallery.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setDesignId(d.id)
                          setName(d.name)
                          restore(JSON.stringify(d.state_json))
                        }}
                        className="w-full overflow-hidden rounded-[0.25em] border border-[#131111]/12 bg-white text-left text-[#131111] hover:border-[#131111]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
                      >
                        {d.preview_url ? (
                          <img src={d.preview_url} alt={d.name} className="aspect-square w-full object-cover" />
                        ) : (
                          <span className="flex aspect-square w-full items-center justify-center bg-[#F2F1EF] px-1 text-center font-outfit text-[0.6875em] text-[#6B635C]">
                            Preview pending
                          </span>
                        )}
                        <span className="block truncate px-1 py-1 font-outfit text-[0.6875em]">{d.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="m-0 font-outfit text-[0.75em] text-[#6B635C]">
              Max {MAX_ENGRAVING_CHARS} characters per line. {config ? "Every finish is included in the price." : null}
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#131111]/10 bg-[#FBFBF7] px-[clamp(1.25rem,2.5vw,2.25em)] pt-[0.9em] pb-[max(0.6em,env(safe-area-inset-bottom))] lg:py-[1.1em]">
          <div className="flex items-baseline justify-between gap-3">
            <p className="m-0 font-outfit text-[0.8125em] tracking-[-0.01em] text-[#6B635C]">
              <Link href={`/products/${product.handle}`} className="text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111]">
                {product.title}
              </Link>
            </p>
            <p className="m-0 font-outfit text-[1.375em] tracking-[-0.03em] text-[#131111] tabular-nums" aria-live="polite">
              {price ?? "—"}
            </p>
          </div>
          <div className="mt-[0.85em] flex items-center gap-2">
            <Button
              onClick={handleAddToCart}
              disabled={saving || !variantId}
              className="h-[3em] min-w-0 flex-1 rounded-full font-outfit text-[0.8125em] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
              style={{ backgroundColor: "#131111", color: "#F2F1EF" }}
            >
              Add to cart
            </Button>
            <button type="button" onClick={handleSave} disabled={saving} className={pillOutline}>
              {saving ? "Saving…" : "Save"}
            </button>
            {config ? (
              <button type="button" onClick={() => openIn3D({ validate: true })} className={pillOutline}>
                Apply in 3D
              </button>
            ) : null}
          </div>
          <p role="status" className="mt-[0.6em] mb-0 min-h-[1.25em] font-outfit text-[0.75em] leading-[1.35] text-[#6B635C]">
            {addedMsg ?? ""}
          </p>
        </div>
      </div>
    </section>
  )
}
