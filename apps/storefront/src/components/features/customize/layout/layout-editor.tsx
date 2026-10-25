"use client"

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import type { Canvas as FabricCanvas, FabricObject, IText } from "fabric"
import type { Material2D } from "@legacy-crafts/schemas"
import { Bold, ChevronLeft, ChevronRight, ImagePlus, Italic, Redo2, Type, Underline, Undo2 } from "lucide-react"
import { useFabricCanvas } from "@/hooks/use-fabric-canvas"
import { useEditorStore } from "@/stores/editor-store"
import {
  CANVAS_SIZE,
  DEFAULT_SAFE_AREA,
  MATERIALS_2D,
  buildDesign2DState,
  validateDesign2D,
} from "@/lib/design-2d"
import { ENGRAVING_FONTS, loadGoogleFont } from "@/lib/fonts"
import { designApi, type DesignRecord } from "@/lib/design-client"
import { track } from "@/lib/analytics"
import { isAllowedLogo, sanitizeSvg } from "@/lib/sanitize"
import { cn } from "@/lib/utils"
import { drawWood } from "@/lib/three/draw"
import {
  artworkOnWood,
  configOptions,
  engravingLines,
  getFont,
  getPlate,
  getWood,
  hasPlate,
  inkFor,
  woodInk,
  WOOD_ETCH,
  type ArtId,
  type FaceLayout,
  type LineKey,
  type PlaqueConfig,
} from "@/lib/configurator/plaque"
import { artworkClipPath, plaqueCanvasLayout, remapRect, type Rect } from "@/lib/configurator/layout-geometry"
import {
  DEFAULT_ENGRAVE,
  ENGRAVE_STYLES,
  sanitizeEngrave,
  type EngraveParams,
} from "@/lib/configurator/engrave"
import { PhotoError, prepareOriginal, renderEngraved } from "@/lib/configurator/engrave-image"
import { emblem, formOutline, insetOutline, plateOutline, plateRect } from "@/lib/configurator/shapes"
import { readLayout } from "@/lib/configurator/layout-store"
import { ArtworkPlacement } from "../configurator/artwork-placement"
import { SwatchGroup, type SwatchOption } from "../configurator/swatch-group"

type FabricObjectLike = FabricObject & {
  id?: string
  text?: string
  fontFamily?: string
  /** Uploaded photo, resized, kept so the engrave effect can be re-run. */
  lcOriginal?: string
  lcEngrave?: EngraveParams
  /** Placed by the configurator's lines (replaced while the canvas is untouched). */
  lcSeed?: boolean
}

/** Custom props that travel with every snapshot, export and saved design. */
const CUSTOM_PROPS = ["id", "lcOriginal", "lcEngrave"]

/** Attaches a stable id to every object so it survives serialization. */
function ensureId(obj: FabricObjectLike): string {
  if (!obj.id) obj.id = crypto.randomUUID()
  return obj.id
}

/** Snapshot including custom props (undo/redo + save). */
function serialize(canvas: FabricCanvas): string {
  return JSON.stringify(canvas.toObject(CUSTOM_PROPS))
}

const isText = (obj: FabricObjectLike) => obj.type === "i-text" || obj.type === "text"

export type LayoutSelection = { id: string; kind: "text" | "image" | "other"; engrave: EngraveParams | null }

const SEED_ROWS: { key: LineKey; y: number; size: number; caps: boolean }[] = [
  { key: "title", y: 0.2, size: 0.11, caps: true },
  { key: "name", y: 0.5, size: 0.24, caps: false },
  { key: "detail", y: 0.82, size: 0.1, caps: false },
]

const EXPORT_DELAY = 350

export type LayoutProduct = { id: string; thumbnail?: string | null }
export type LayoutController = {
  /** Pushes the current composition to `onLayoutChange` now (before a mode switch). */
  flush: () => void
  /** Validates and saves the 2D design (create or update); null when invalid. */
  save: () => Promise<DesignRecord | null>
  /** Drops the composition and goes back to mirroring the engraving lines. */
  clear: () => void
  /** Places a photo/logo (queued until the canvas is ready). */
  upload: (file: File) => void
  /** True when the canvas has engraving text or an uploaded image. */
  hasContent: () => boolean
}

type Layer = { id: string; label: string; visible: boolean }

type LayoutEditorValue = {
  enabled: boolean
  plaque: PlaqueConfig | null
  elRef: React.RefObject<HTMLCanvasElement | null>
  safeArea: Rect
  tint: string
  layers: Layer[]
  selectedFont: string
  fillColor: string
  inkSwatches: string[]
  name: string
  setName: (name: string) => void
  material: Material2D | null
  setMaterial: (m: Material2D) => void
  gallery: DesignRecord[]
  validationErrors: string[]
  saving: boolean
  addText: () => Promise<void>
  uploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  selection: LayoutSelection | null
  /** Re-engraves the selected photo with these settings. */
  setEngrave: (patch: Partial<EngraveParams>) => void
  setArt: (art: ArtId) => void
  engraving: boolean
  deselect: () => void
  applyFont: (font: string) => void
  applyColor: (color: string) => void
  toggleStyle: (prop: "fontWeight" | "fontStyle" | "underline") => void
  selectLayer: (id: string) => void
  toggleLayerVisible: (id: string) => void
  deleteLayer: (id: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  validate: () => boolean
  loadGallery: () => Promise<void>
  openDesign: (design: DesignRecord) => void
}

const LayoutEditorContext = createContext<LayoutEditorValue | null>(null)

export function useLayoutEditor() {
  const value = use(LayoutEditorContext)
  if (!value) throw new Error("useLayoutEditor must be used inside LayoutEditorProvider")
  return value
}

/**
 * Owns the Fabric canvas, history and save logic for the 2D layout. Plaque mode
 * (`plaque` set) lays the engraving area over the plaque's plate and reports
 * each change as a FaceLayout so the 3D face can show it; generic products use
 * the material-tint canvas as before.
 */
export function LayoutEditorProvider({
  enabled = true,
  product,
  variantId,
  plaque = null,
  initialDesign = null,
  onLayoutChange,
  onArtChange,
  controllerRef,
  children,
}: {
  enabled?: boolean
  product: LayoutProduct
  variantId?: string
  plaque?: PlaqueConfig | null
  initialDesign?: DesignRecord | null
  onLayoutChange?: (layout: FaceLayout | null) => void
  onArtChange?: (art: ArtId) => void
  controllerRef?: RefObject<LayoutController | null>
  children: ReactNode
}) {
  const { elRef, getCanvas, getFabric, ready } = useFabricCanvas(enabled)
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

  const [name, setNameState] = useState(initialDesign?.name ?? "Untitled design")
  const [designId, setDesignId] = useState<string | null>(initialDesign?.id ?? null)
  const [selectedFont, setSelectedFont] = useState<string>(plaque ? getFont(plaque.font).family2d : ENGRAVING_FONTS[0])
  const [fillColor, setFillColor] = useState(plaque ? inkFor(plaque) : "#1a1a1a")
  const [layers, setLayers] = useState<Layer[]>([])
  const [gallery, setGallery] = useState<DesignRecord[]>([])
  const [selection, setSelection] = useState<LayoutSelection | null>(null)
  const [engraving, setEngraving] = useState(false)
  const engraveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const engraveGen = useRef(0)
  // Uploads wait for any saved composition to finish loading, and for the canvas itself.
  const loadedRef = useRef<Promise<unknown>>(Promise.resolve())
  const pendingUploadRef = useRef<File | null>(null)
  // Track uploaded logo intrinsic resolution for the DPI check (FR-2D-9).
  const logoMetaRef = useRef<Record<string, { naturalWidth: number }>>({})
  const skipHistoryRef = useRef(false)
  // Until the shopper touches the canvas it mirrors the 3D engraving lines and exports nothing.
  const editedRef = useRef(false)
  const exportTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onLayoutChangeRef = useRef(onLayoutChange)
  onLayoutChangeRef.current = onLayoutChange

  const form = plaque?.form
  const pshape = plaque?.pshape
  const art = plaque?.art
  const safeArea = useMemo<Rect>(
    () => (form && pshape ? plaqueCanvasLayout({ form, pshape, art }).safeArea : DEFAULT_SAFE_AREA),
    [form, pshape, art]
  )
  const safeAreaRef = useRef(safeArea)
  const tint = plaque ? "" : (MATERIALS_2D.find((m) => m.value === material)?.tint ?? "#ffffff")
  const plaqueRef = useRef(plaque)
  plaqueRef.current = plaque

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
                ? obj.lcOriginal
                  ? "Photo"
                  : "Logo / image"
                : obj.type ?? "layer"
          return { id, label, visible: obj.visible !== false }
        })
        .reverse()
    )
  }, [getCanvas])

  const exportLayout = useCallback((): FaceLayout | null => {
    const canvas = getCanvas()
    if (!canvas || !plaqueRef.current) return null
    if (!canvas.getObjects().some((o) => o.visible !== false)) return null
    const area = safeAreaRef.current
    // Selection controls live on Fabric's top layer, so the export is clean mid-edit.
    const image = canvas.toDataURL({
      format: "png",
      multiplier: 2,
      left: area.x,
      top: area.y,
      width: area.width,
      height: area.height,
    })
    return { image, fabric: canvas.toObject(CUSTOM_PROPS), area }
  }, [getCanvas])

  const flush = useCallback(() => {
    if (exportTimer.current) clearTimeout(exportTimer.current)
    exportTimer.current = null
    if (!plaqueRef.current || !getCanvas() || !editedRef.current) return
    onLayoutChangeRef.current?.(exportLayout())
  }, [exportLayout, getCanvas])

  const scheduleExport = useCallback(() => {
    if (!plaqueRef.current) return
    if (exportTimer.current) clearTimeout(exportTimer.current)
    exportTimer.current = setTimeout(flush, EXPORT_DELAY)
  }, [flush])

  useEffect(() => () => {
    if (exportTimer.current) clearTimeout(exportTimer.current)
  }, [])

  const snapshot = useCallback(() => {
    const canvas = getCanvas()
    if (!canvas || skipHistoryRef.current) return
    editedRef.current = true
    pushSnapshot(serialize(canvas))
    refreshLayers()
    scheduleExport()
  }, [getCanvas, pushSnapshot, refreshLayers, scheduleExport])

  /** Moves every object from one safe area into another (form / plate shape changed). */
  const remapObjects = useCallback(
    (from: Rect, to: Rect) => {
      const canvas = getCanvas()
      if (!canvas || (from.x === to.x && from.y === to.y && from.width === to.width && from.height === to.height)) return
      const map = remapRect(from, to)
      for (const obj of canvas.getObjects()) {
        const point = map.point(obj.left ?? 0, obj.top ?? 0)
        obj.set({ left: point.x, top: point.y, scaleX: (obj.scaleX ?? 1) * map.scale, scaleY: (obj.scaleY ?? 1) * map.scale })
        obj.setCoords()
      }
      canvas.requestRenderAll()
    },
    [getCanvas]
  )

  const seedGenRef = useRef(0)

  /** Replaces the canvas with the configurator's engraving lines as editable text. */
  async function seedFromConfig(canvas: FabricCanvas, seed: PlaqueConfig) {
    const fabric = getFabric()
    if (!fabric) return
    const gen = ++seedGenRef.current
    const font = getFont(seed.font)
    const lines = engravingLines(seed)
    await loadGoogleFont(font.family2d)
    if (gen !== seedGenRef.current || editedRef.current) return
    skipHistoryRef.current = true
    canvas.remove(...canvas.getObjects().filter((o) => (o as FabricObjectLike).lcSeed))
    const area = safeAreaRef.current
    const left = seed.align === "left"
    for (const row of SEED_ROWS) {
      const raw = lines[row.key]
      if (!raw) continue
      const text = new fabric.IText(row.caps || font.caps ? raw.toUpperCase() : raw, {
        left: left ? area.x + 4 : area.x + area.width / 2,
        top: area.y + area.height * row.y,
        originX: left ? "left" : "center",
        originY: "center",
        fontFamily: font.family2d,
        fontSize: Math.round(area.height * row.size),
        fontStyle: row.key === "name" ? font.style : "normal",
        charSpacing: row.caps ? 160 : 0,
        fill: inkFor(seed),
        opacity: !hasPlate(seed) && seed.fill === "natural" ? 0.82 : 1,
        textAlign: left ? "left" : "center",
      }) as IText & FabricObjectLike
      ensureId(text)
      text.lcSeed = true
      canvas.add(text)
    }
    canvas.requestRenderAll()
    skipHistoryRef.current = false
    pushSnapshot(serialize(canvas))
    refreshLayers()
  }

  // Wire Fabric events -> history + selection once the canvas is ready.
  useEffect(() => {
    const canvas = getCanvas()
    if (!ready || !canvas) return

    const onModified = () => snapshot()
    const onSelection = () => {
      const active = canvas.getActiveObject() as FabricObjectLike | undefined
      setSelected(active ? ensureId(active) : null)
      setSelection(
        active
          ? {
              id: ensureId(active),
              kind: isText(active) ? "text" : active.type === "image" ? "image" : "other",
              engrave: active.lcOriginal ? sanitizeEngrave(active.lcEngrave) : null,
            }
          : null
      )
      if (active && isText(active)) {
        setSelectedFont((active.fontFamily as string) ?? ENGRAVING_FONTS[0])
      }
    }
    const onCleared = () => {
      setSelected(null)
      setSelection(null)
    }

    canvas.on("object:added", onModified)
    canvas.on("object:modified", onModified)
    canvas.on("object:removed", onModified)
    canvas.on("text:changed", onModified)
    canvas.on("selection:created", onSelection)
    canvas.on("selection:updated", onSelection)
    canvas.on("selection:cleared", onCleared)

    const finish = () => {
      canvas.getObjects().forEach((o) => ensureId(o as FabricObjectLike))
      canvas.backgroundColor = tint
      canvas.requestRenderAll()
      skipHistoryRef.current = false
      pushSnapshot(serialize(canvas))
      refreshLayers()
    }

    // Resume a saved design or this session's composition; an untouched plaque canvas is seeded by the effect below.
    const stored = plaque && !initialDesign ? readLayout(product.id) : null
    if (initialDesign && initialDesign.state_json) {
      editedRef.current = true
      skipHistoryRef.current = true
      loadedRef.current = canvas.loadFromJSON(initialDesign.state_json as object).then(finish)
      const stateMaterial = (initialDesign.state_json as { materialOverlay?: Material2D }).materialOverlay
      if (stateMaterial && !plaque) setMeta({ material: stateMaterial })
    } else if (stored?.fabric) {
      editedRef.current = true
      skipHistoryRef.current = true
      loadedRef.current = canvas.loadFromJSON(stored.fabric as object).then(() => {
        if (stored.area) remapObjects(stored.area, safeAreaRef.current)
        finish()
      })
    } else if (!plaque) {
      finish()
    }
    setMeta({ productId: product.id, name })
    const pending = pendingUploadRef.current
    pendingUploadRef.current = null
    if (pending) void uploadFile(pending)

    return () => {
      canvas.off("object:added", onModified)
      canvas.off("object:modified", onModified)
      canvas.off("object:removed", onModified)
      canvas.off("text:changed", onModified)
      canvas.off("selection:created", onSelection)
      canvas.off("selection:updated", onSelection)
      canvas.off("selection:cleared", onCleared)
    }
  }, [ready])

  // Form, plate or artwork placement changed: carry the composition, and let a photo cover the wood.
  useEffect(() => {
    const previous = safeAreaRef.current
    safeAreaRef.current = safeArea
    if (!ready || !editedRef.current) return
    remapObjects(previous, safeArea)
    const canvas = getCanvas()
    const grew = safeArea.width * safeArea.height > previous.width * previous.height * 1.35
    if (canvas && grew) {
      for (const obj of canvas.getObjects()) {
        const item = obj as FabricObjectLike
        if (item.type !== "image" || !item.lcOriginal) continue
        const scale = Math.max(safeArea.width / Math.max(1, item.width ?? 1), safeArea.height / Math.max(1, item.height ?? 1))
        item.set({
          originX: "center",
          originY: "center",
          left: safeArea.x + safeArea.width / 2,
          top: safeArea.y + safeArea.height / 2,
          scaleX: scale,
          scaleY: scale,
        })
        item.setCoords()
      }
      canvas.requestRenderAll()
    }
    if (canvas?.getObjects().length) snapshot()
  }, [safeArea, ready, remapObjects, snapshot, getCanvas])

  // Untouched canvas: keep it in step with the 3D engraving lines, lettering and plate.
  const seedKey = plaque
    ? JSON.stringify([engravingLines(plaque), plaque.font, plaque.fill, plaque.align, plaque.plate, safeArea])
    : ""
  useEffect(() => {
    const canvas = getCanvas()
    const seed = plaqueRef.current
    if (!ready || !canvas || !seed || editedRef.current) return
    void seedFromConfig(canvas, seed)
  }, [seedKey, ready])

  // Reflect material choice as a canvas background tint (FR-2D-7 overlay); plaque mode is transparent over the face art.
  useEffect(() => {
    const canvas = getCanvas()
    if (!canvas) return
    canvas.backgroundColor = tint
    canvas.requestRenderAll()
  }, [tint, getCanvas, ready])

  useEffect(() => {
    if (!enabled) return
    track("design_started", { mode: "2d", product_id: product.id })
    return () => reset()
  }, [enabled, reset, product.id])

  async function addText() {
    const canvas = getCanvas()
    const fabric = getFabric()
    if (!canvas || !fabric) return
    await loadGoogleFont(selectedFont)
    const area = safeAreaRef.current
    const text = new fabric.IText("Your Text", {
      left: area.x + area.width / 2,
      top: area.y + area.height / 2,
      originX: "center",
      originY: "center",
      fontFamily: selectedFont,
      fontSize: plaque ? Math.round(area.height * 0.22) : 48,
      fill: fillColor,
      opacity: plaque && !hasPlate(plaque) && plaque.fill === "natural" ? 0.82 : 1,
      textAlign: "center",
    }) as IText & FabricObjectLike
    ensureId(text)
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.requestRenderAll()
  }

  /** SVG logos go on as-is; photos (PNG/JPG) are engraved by default and keep their original for re-engraving. */
  async function uploadFile(file: File) {
    const canvas = getCanvas()
    const fabric = getFabric()
    if (!canvas || !fabric) {
      pendingUploadRef.current = file
      return
    }
    const heic = /\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type)
    if (!heic && !isAllowedLogo(file)) {
      setValidationErrors(["Unsupported file type. Upload a JPG, PNG or SVG."])
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setValidationErrors(["That file is over 15MB. Please upload a smaller version."])
      return
    }
    setValidationErrors([])
    let url: string
    let original: string | undefined
    try {
      if (file.type === "image/svg+xml") {
        // Sanitize SVGs before use (strip scripts/handlers/external refs).
        const raw = await file.text()
        const clean = sanitizeSvg(raw)
        url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(clean)))}`
      } else {
        setEngraving(true)
        original = await prepareOriginal(file)
        url = await renderEngraved(original, DEFAULT_ENGRAVE)
      }
    } catch (error) {
      setValidationErrors([error instanceof PhotoError ? error.message : "We couldn't read that image. Try a JPG or PNG."])
      return
    } finally {
      setEngraving(false)
    }
    await loadedRef.current
    const area = safeAreaRef.current
    const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" })
    const imgLike = img as FabricObjectLike & { width?: number; height?: number }
    const naturalWidth = imgLike.width ?? 0
    const onWood = Boolean(plaqueRef.current && artworkOnWood(plaqueRef.current))
    const share = original ? 0.9 : 0.6
    const baseW = Math.max(1, naturalWidth)
    const baseH = Math.max(1, imgLike.height ?? 1)
    const fit = onWood && original
      ? Math.max(area.width / baseW, area.height / baseH)
      : Math.min((area.width * share) / baseW, (area.height * 0.9) / baseH)
    if (onWood || fit < 1) img.scale(fit)
    img.set({
      left: area.x + area.width / 2,
      top: area.y + area.height / 2,
      originX: "center",
      originY: "center",
    })
    if (original) {
      imgLike.lcOriginal = original
      imgLike.lcEngrave = DEFAULT_ENGRAVE
    }
    const id = ensureId(imgLike)
    logoMetaRef.current[id] = { naturalWidth }
    canvas.add(img)
    canvas.setActiveObject(img)
    canvas.requestRenderAll()
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (file) await uploadFile(file)
  }

  function setEngrave(patch: Partial<EngraveParams>) {
    const canvas = getCanvas()
    const active = canvas?.getActiveObject() as (FabricObjectLike & { setSrc?: (src: string) => Promise<unknown> }) | undefined
    if (!canvas || !active?.lcOriginal || !active.setSrc) return
    const params = sanitizeEngrave({ ...sanitizeEngrave(active.lcEngrave), ...patch })
    active.lcEngrave = params
    setSelection((s) => (s ? { ...s, engrave: params } : s))
    if (engraveTimer.current) clearTimeout(engraveTimer.current)
    const gen = ++engraveGen.current
    const original = active.lcOriginal
    setEngraving(true)
    engraveTimer.current = setTimeout(async () => {
      try {
        const url = await renderEngraved(original, params)
        if (gen !== engraveGen.current) return
        await active.setSrc!(url)
        canvas.requestRenderAll()
        snapshot()
      } finally {
        if (gen === engraveGen.current) setEngraving(false)
      }
    }, 160)
  }

  function applyFont(font: string) {
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

  function applyColor(color: string) {
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

  function findObject(id: string) {
    return getCanvas()?.getObjects().find((o) => (o as FabricObjectLike).id === id)
  }

  function selectLayer(id: string) {
    const canvas = getCanvas()
    const obj = findObject(id)
    if (canvas && obj) {
      canvas.setActiveObject(obj)
      canvas.requestRenderAll()
    }
  }

  function toggleLayerVisible(id: string) {
    const canvas = getCanvas()
    const obj = findObject(id)
    if (canvas && obj) {
      obj.visible = obj.visible === false
      canvas.requestRenderAll()
      snapshot()
    }
  }

  function deleteLayer(id: string) {
    const canvas = getCanvas()
    const obj = findObject(id)
    if (canvas && obj) {
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
      scheduleExport()
    })
  }

  function collectState() {
    const canvas = getCanvas()
    if (!canvas) return null
    const objects = canvas.getObjects().map((o) => {
      const obj = o as FabricObjectLike & Record<string, unknown>
      // The design API caps request bodies, so the saved record keeps the engraved
      // image and its settings; the full original stays in this session's copy.
      const { lcOriginal: _original, ...saved } = obj.toObject(CUSTOM_PROPS) as Record<string, unknown>
      return { ...saved, id: obj.id, ...(obj.lcOriginal ? { lcSource: "photo" } : {}) }
    })
    const state = {
      ...buildDesign2DState(objects as never, { material, baseImageUrl: product.thumbnail ?? null }),
      engravingSafeArea: safeAreaRef.current,
    }
    const config = plaqueRef.current
    // The plaque's 3D choices travel with the layout so the workshop gets one spec.
    return config
      ? {
          ...state,
          configurator: {
            kind: "plaque" as const,
            options: configOptions({ ...config, face: "custom" }),
            lines: engravingLines(config),
          },
        }
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

  async function save(): Promise<DesignRecord | null> {
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
      return record
    } finally {
      setSaving(false)
    }
  }

  function clear() {
    const canvas = getCanvas()
    if (exportTimer.current) clearTimeout(exportTimer.current)
    editedRef.current = false
    logoMetaRef.current = {}
    if (canvas && plaqueRef.current) void seedFromConfig(canvas, plaqueRef.current)
  }

  const saveRef = useRef(save)
  saveRef.current = save
  const clearRef = useRef(clear)
  clearRef.current = clear
  const uploadRef = useRef(uploadFile)
  uploadRef.current = uploadFile
  useEffect(() => {
    if (!controllerRef) return
    controllerRef.current = {
      flush,
      save: () => saveRef.current(),
      clear: () => clearRef.current(),
      upload: (file) => void uploadRef.current(file),
      hasContent: () => {
        const canvas = getCanvas()
        if (!canvas) return false
        return canvas.getObjects().some((o) => {
          if (o.visible === false) return false
          const obj = o as FabricObjectLike
          if (isText(obj)) return Boolean((obj.text ?? "").trim())
          return obj.type === "image"
        })
      },
    }
    return () => {
      controllerRef.current = null
    }
  }, [controllerRef, flush, getCanvas])

  async function loadGallery() {
    try {
      const { designs } = await designApi.list()
      setGallery(designs.filter((d) => d.mode === "2d"))
    } catch {
      setGallery([])
    }
  }

  const value: LayoutEditorValue = {
    enabled,
    plaque,
    elRef,
    safeArea,
    tint,
    layers,
    selectedFont,
    fillColor,
    inkSwatches: plaque ? [inkFor({ ...plaque, fill: "natural" }), "#d9b46a", "#141210"] : ["#1a1a1a", "#d9b46a", "#ffffff"],
    name,
    setName: (next) => {
      setNameState(next)
      setMeta({ name: next })
    },
    material,
    setMaterial: (m) => setMeta({ material: m }),
    gallery,
    validationErrors,
    saving,
    addText,
    uploadLogo,
    selection,
    setEngrave,
    setArt: (next) => onArtChange?.(next),
    engraving,
    deselect: () => {
      const canvas = getCanvas()
      canvas?.discardActiveObject()
      canvas?.requestRenderAll()
      setSelection(null)
    },
    applyFont,
    applyColor,
    toggleStyle,
    selectLayer,
    toggleLayerVisible,
    deleteLayer,
    undo: () => restore(undo()),
    redo: () => restore(redo()),
    canUndo: canUndo(),
    canRedo: canRedo(),
    validate: () => runValidation().ok,
    loadGallery,
    openDesign: (d) => {
      editedRef.current = true
      setDesignId(d.id)
      setNameState(d.name)
      restore(JSON.stringify(d.state_json))
    },
  }

  return <LayoutEditorContext value={value}>{children}</LayoutEditorContext>
}

/** Scales the fixed 800px Fabric surface to fit its cell (Fabric maps pointers through CSS transforms). */
function useFitScale(padding: { x: number; top: number; bottom: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!width || !height) return
      const next = Math.min((width - padding.x * 2) / CANVAS_SIZE, (height - padding.top - padding.bottom) / CANVAS_SIZE)
      setScale(Math.max(0.15, Math.min(1, next)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [padding.x, padding.top, padding.bottom])
  return { ref, scale }
}

const METAL_STOPS = (color: string) => [
  `color-mix(in srgb, ${color} 55%, white)`,
  color,
  `color-mix(in srgb, ${color} 60%, black)`,
]

/** The plaque drawn at 2D-canvas scale. `ground` is the timber; `metal` is the plate and emblem drawn above a wood-covering photo. */
function PlaqueFaceArt({
  config,
  layer = "full",
  className,
}: {
  config: PlaqueConfig
  layer?: "full" | "ground" | "metal"
  className?: string
}) {
  const uid = useId().replace(/:/g, "")
  const [grain, setGrain] = useState<string | null>(null)
  const wood = getWood(config.wood)
  const plate = getPlate(config.plate)
  const layout = plaqueCanvasLayout(config)
  const { w, h, scale, originX, originY } = layout
  const outline = formOutline(config.form, w, h)
  const rect = plateRect(config.form, w, h, config.pshape)
  const mark = emblem(config.form, w, h)
  const toPath = (points: [number, number][]) => points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(4)} ${y.toFixed(4)}`).join(" ") + " Z"
  const borders = config.border === "none" ? [] : config.border === "double" ? [0.07, 0.095] : [0.075]
  const [light, mid, dark] = METAL_STOPS(plate.color)
  const showGround = layer !== "metal"
  const showMetal = layer !== "ground"

  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    drawWood(ctx, 512, wood.grain[0], wood.grain[1], wood.grain[2], wood.seed)
    setGrain(canvas.toDataURL("image/jpeg", 0.85))
  }, [wood])

  return (
    <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} className={cn("absolute inset-0 size-full", className)} aria-hidden>
      <defs>
        <pattern id={`grain-${uid}`} patternUnits="userSpaceOnUse" width="180" height="180">
          <rect width="180" height="180" fill={wood.grain[0]} />
          {grain ? <image href={grain} width="180" height="180" preserveAspectRatio="none" /> : null}
        </pattern>
        <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <filter id={`lift-${uid}`} x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#2b1d10" floodOpacity="0.28" />
        </filter>
      </defs>
      <g transform={`translate(${originX} ${originY}) scale(${scale} ${-scale})`}>
        {showGround ? <path d={toPath(outline)} fill={`url(#grain-${uid})`} filter={`url(#lift-${uid})`} /> : null}
        {showGround
          ? borders.map((margin) => (
          <path
            key={margin}
            d={toPath(insetOutline(outline, w, h, margin))}
            fill="none"
            stroke={plate.color}
            strokeWidth={margin > 0.09 ? 1.5 : 3}
            vectorEffect="non-scaling-stroke"
          />
        ))
          : null}
        {showMetal && config.emblem !== "none" ? (
          <circle cx="0" cy={mark.cy} r={mark.r} fill={`url(#metal-${uid})`} />
        ) : null}
        {showMetal && hasPlate(config) ? (
          <g transform={`translate(0 ${rect.cy})`}>
            <path d={toPath(plateOutline(config.pshape, rect.width, rect.height))} fill={`url(#metal-${uid})`} />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

const STAGE_PADDING = { x: 12, top: 56, bottom: 56 }
const roundControl =
  "flex size-[2.5em] items-center justify-center rounded-full border border-[#131111]/15 bg-[#FBFBF7]/85 text-[#131111] backdrop-blur-sm transition-colors hover:bg-[#FBFBF7] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

/** The 2D canvas cell: plaque art, Fabric layer, safe-area guide and history controls. */
export function LayoutStage({ className }: { className?: string }) {
  const editor = useLayoutEditor()
  const { ref, scale } = useFitScale(STAGE_PADDING)
  const area = editor.safeArea
  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#FBFBF7_0%,#F2F1EF_48%,#E6E0D3_100%)]",
        className
      )}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: `calc(${STAGE_PADDING.top}px + (100% - ${STAGE_PADDING.top + STAGE_PADDING.bottom}px - ${CANVAS_SIZE * scale}px) / 2)`,
          width: CANVAS_SIZE * scale,
          height: CANVAS_SIZE * scale,
        }}
      >
        <div
          className={cn("absolute top-0 left-0", editor.plaque ? null : "overflow-hidden rounded-[0.25em] shadow-[0_18px_40px_-24px_rgba(43,29,16,0.55)]")}
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, transform: `scale(${scale})`, transformOrigin: "0 0" }}
        >
          {editor.plaque ? (
            <PlaqueFaceArt config={editor.plaque} layer={artworkOnWood(editor.plaque) ? "ground" : "full"} />
          ) : null}
          <div
            className="absolute inset-0 z-10"
            style={editor.plaque ? { clipPath: `path('${artworkClipPath(editor.plaque)}')` } : undefined}
          >
            <canvas ref={editor.elRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
          </div>
          {editor.plaque && artworkOnWood(editor.plaque) ? (
            <PlaqueFaceArt config={editor.plaque} layer="metal" className="pointer-events-none z-20" />
          ) : null}
          <div
            className="pointer-events-none absolute z-30 rounded-[2px] border-2 border-dashed border-[#131111]/40"
            style={{ left: area.x, top: area.y, width: area.width, height: area.height }}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[0.75em] flex items-center justify-between gap-3 px-[1em] sm:px-[1.25em]">
        <p className="m-0 hidden font-outfit text-[0.75em] tracking-[0.08em] text-[#6B635C] uppercase sm:block">
          {editor.plaque && artworkOnWood(editor.plaque) ? "Photo is engraved across the wood" : "Engraving stays inside the dashed area"}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" className={roundControl} aria-label="Undo" onClick={editor.undo} disabled={!editor.canUndo}>
            <Undo2 className="size-[1em]" strokeWidth={1.5} aria-hidden />
          </button>
          <button type="button" className={roundControl} aria-label="Redo" onClick={editor.redo} disabled={!editor.canRedo}>
            <Redo2 className="size-[1em]" strokeWidth={1.5} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => editor.validate()}
            className="h-[2.5em] rounded-full border border-[#131111]/15 bg-[#FBFBF7]/85 px-[1em] font-outfit text-[0.75em] tracking-[0.08em] text-[#131111] uppercase backdrop-blur-sm hover:bg-[#FBFBF7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          >
            Validate
          </button>
        </div>
      </div>
    </div>
  )
}

export const UPLOAD_ACCEPT = "image/png,image/jpeg,image/svg+xml,.heic,.heif"

const SLIDERS: { key: "contrast" | "detail" | "fade"; label: string }[] = [
  { key: "contrast", label: "Contrast" },
  { key: "detail", label: "Detail" },
  { key: "fade", label: "Edge fade" },
]

/** Laser-engrave settings for the selected photo. */
function PhotoEngraveControls({ params }: { params: EngraveParams }) {
  const editor = useLayoutEditor()
  const id = useId()
  const darkWood = editor.plaque && !hasPlate(editor.plaque) && woodInk(editor.plaque.wood) === WOOD_ETCH
  return (
    <div className="flex flex-col gap-[0.7em]">
      {editor.plaque ? (
        hasPlate(editor.plaque) ? (
          <ArtworkPlacement value={editor.plaque.art} onChange={editor.setArt} />
        ) : (
          <p className="m-0 font-outfit text-[0.75em] leading-[1.35] text-[#6B635C]">No metal plate — engraving and photos sit in the wood.</p>
        )
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className={groupLabel}>Photo engraving</p>
        <span role="status" className="font-outfit text-[0.75em] text-[#6B635C]">
          {editor.engraving ? "Engraving…" : ""}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span id={`${id}-switch`} className="font-outfit text-[0.875em] text-[#131111]">
          Engrave effect
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={params.enabled}
          aria-labelledby={`${id}-switch`}
          onClick={() => editor.setEngrave({ enabled: !params.enabled })}
          className={cn(
            "relative h-[1.6em] w-[2.9em] shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
            params.enabled ? "bg-[#131111]" : "bg-[#131111]/20"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "absolute top-[0.2em] size-[1.2em] rounded-full bg-[#FBFBF7] transition-[left] duration-150 motion-reduce:transition-none",
              params.enabled ? "left-[1.5em]" : "left-[0.2em]"
            )}
          />
        </button>
      </div>
      <div role="radiogroup" aria-label="Engrave style" className={cn("flex gap-[0.4em]", !params.enabled && "opacity-40")}>
        {ENGRAVE_STYLES.map((s) => {
          const on = s.id === params.style
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={!params.enabled}
              onClick={() => editor.setEngrave({ style: s.id })}
              className={cn(
                "h-[2.3em] flex-1 rounded-full border font-outfit text-[0.75em] tracking-[0.06em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
                on ? "border-[#131111] bg-[#131111] text-[#F2F1EF]" : "border-[#131111]/20 text-[#131111] hover:bg-[#131111]/5"
              )}
            >
              {s.label}
            </button>
          )
        })}
      </div>
      <div className={cn("flex flex-col gap-[0.4em]", !params.enabled && "opacity-40")}>
        {SLIDERS.map((s) => (
          <div key={s.key} className="flex items-center gap-[0.7em]">
            <label htmlFor={`${id}-${s.key}`} className="w-[5.6em] shrink-0 font-outfit text-[0.8125em] text-[#131111]">
              {s.label}
            </label>
            <input
              id={`${id}-${s.key}`}
              type="range"
              min={0}
              max={100}
              step={1}
              disabled={!params.enabled}
              value={Math.round(params[s.key] * 100)}
              onChange={(e) => editor.setEngrave({ [s.key]: Number(e.target.value) / 100 })}
              className="h-[1.4em] min-w-0 flex-1 accent-[#131111]"
            />
          </div>
        ))}
      </div>
      {darkWood ? (
        <p className="m-0 font-outfit text-[0.75em] leading-[1.35] text-[#6B635C]">
          Photos burn in best on light timber — try maple or oak.
        </p>
      ) : null}
      {editor.validationErrors.length > 0 ? (
        <p role="alert" className="m-0 font-outfit text-[0.75em] leading-[1.35] text-[#8A2D25]">
          {editor.validationErrors[0]}
        </p>
      ) : null}
      <button type="button" onClick={editor.deselect} className={cn(pillButton, "flex-none")}>
        Done
      </button>
    </div>
  )
}

const LAYERS_PER_PAGE = 3
const smallButton =
  "flex size-[2.25em] shrink-0 items-center justify-center rounded-full border border-[#131111]/20 text-[#131111] hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
const groupLabel = "m-0 font-outfit text-[0.6875em] font-medium tracking-[0.14em] text-[#131111] uppercase"
const pillButton =
  "relative flex h-[2.5em] flex-1 items-center justify-center gap-[0.5em] rounded-full border border-[#131111]/25 font-outfit text-[0.75em] tracking-[0.08em] text-[#131111] uppercase transition-colors hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

/** Text, logo and layer tools — sized to sit in the panel without scrolling. */
export function LayoutComposePanel() {
  const editor = useLayoutEditor()
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(editor.layers.length / LAYERS_PER_PAGE))
  const current = Math.min(page, pages - 1)
  const visible = editor.layers.slice(current * LAYERS_PER_PAGE, current * LAYERS_PER_PAGE + LAYERS_PER_PAGE)
  const fileId = useId()

  if (editor.selection?.kind === "image" && editor.selection.engrave) {
    return <PhotoEngraveControls params={editor.selection.engrave} />
  }

  return (
    <div className="flex flex-col gap-[0.85em]">
      {editor.plaque ? (
        hasPlate(editor.plaque) ? (
          <ArtworkPlacement value={editor.plaque.art} onChange={editor.setArt} />
        ) : (
          <p className="m-0 font-outfit text-[0.75em] leading-[1.35] text-[#6B635C]">No metal plate — engraving and photos sit in the wood.</p>
        )
      ) : null}
      <div className="flex flex-col gap-[0.45em]">
        <p className={groupLabel}>Text</p>
        <div className="flex items-center gap-[0.4em]">
          <label className="sr-only" htmlFor={`${fileId}-font`}>
            Font
          </label>
          <select
            id={`${fileId}-font`}
            value={editor.selectedFont}
            onChange={(e) => editor.applyFont(e.target.value)}
            className="h-[2.25em] min-w-0 flex-1 rounded-full border border-[#131111]/20 bg-white px-[0.8em] font-outfit text-[0.875em] text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          >
            {ENGRAVING_FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => editor.toggleStyle("fontWeight")} aria-label="Bold" className={smallButton}>
            <Bold className="size-[0.95em]" strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" onClick={() => editor.toggleStyle("fontStyle")} aria-label="Italic" className={smallButton}>
            <Italic className="size-[0.95em]" strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" onClick={() => editor.toggleStyle("underline")} aria-label="Underline" className={smallButton}>
            <Underline className="size-[0.95em]" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-[0.45em]">
          {editor.inkSwatches.map((color) => {
            const on = editor.fillColor.toLowerCase() === color.toLowerCase()
            return (
              <button
                key={color}
                type="button"
                onClick={() => editor.applyColor(color)}
                aria-label={`Text colour ${color}`}
                aria-pressed={on}
                className={cn(
                  "size-[1.9em] rounded-full ring-offset-2 ring-offset-[#FBFBF7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#131111]",
                  on ? "ring-[1.5px] ring-[#131111]" : "ring-1 ring-[#131111]/15"
                )}
                style={{ backgroundColor: color }}
              />
            )
          })}
          <input
            type="color"
            value={editor.fillColor}
            onChange={(e) => editor.applyColor(e.target.value)}
            aria-label="Text color"
            className="h-[1.9em] w-[1.9em] cursor-pointer rounded-full border border-[#131111]/20 bg-transparent p-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          />
        </div>
        <div className="flex gap-[0.5em]">
          <button type="button" onClick={editor.addText} className={pillButton}>
            <Type className="size-[1.1em]" strokeWidth={1.5} aria-hidden />
            Add text
          </button>
          <label className={cn(pillButton, "cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#131111]")}>
            <ImagePlus className="size-[1.1em]" strokeWidth={1.5} aria-hidden />
            Add photo
            <input type="file" accept={UPLOAD_ACCEPT} onChange={editor.uploadLogo} className="sr-only" />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-[0.45em]">
        <div className="flex items-center justify-between">
          <p className={groupLabel}>
            Layers{editor.layers.length ? ` · ${editor.layers.length}` : ""}
          </p>
          {pages > 1 ? (
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous layers" disabled={current === 0} onClick={() => setPage(current - 1)} className={cn(smallButton, "size-[1.75em] disabled:opacity-30")}>
                <ChevronLeft className="size-[0.9em]" aria-hidden />
              </button>
              <span className="font-outfit text-[0.6875em] text-[#6B635C] tabular-nums">
                {current + 1}/{pages}
              </span>
              <button type="button" aria-label="Next layers" disabled={current === pages - 1} onClick={() => setPage(current + 1)} className={cn(smallButton, "size-[1.75em] disabled:opacity-30")}>
                <ChevronRight className="size-[0.9em]" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
        {editor.layers.length === 0 ? (
          <p className="m-0 font-outfit text-[0.8125em] text-[#6B635C]">No layers yet. Add text or a logo.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-[0.3em] p-0">
            {visible.map((l) => (
              <li key={l.id} className="flex items-center gap-2 rounded-[0.25em] border border-[#131111]/12 bg-white px-[0.7em] py-[0.3em] font-outfit text-[0.8125em]">
                <button type="button" onClick={() => editor.selectLayer(l.id)} className="min-w-0 flex-1 truncate text-left text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
                  {l.label}
                </button>
                <button type="button" onClick={() => editor.toggleLayerVisible(l.id)} aria-label="Toggle visibility" className="text-[#6B635C] hover:text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
                  {l.visible ? "Hide" : "Show"}
                </button>
                <button type="button" onClick={() => editor.deleteLayer(l.id)} aria-label="Delete layer" className="text-[#8A2D25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editor.validationErrors.length > 0 ? (
        <p role="alert" className="m-0 font-outfit text-[0.75em] leading-[1.35] text-[#8A2D25]">
          {editor.validationErrors[0]}
          {editor.validationErrors.length > 1 ? ` (+${editor.validationErrors.length - 1} more)` : null}
        </p>
      ) : null}
    </div>
  )
}

const GALLERY_PER_PAGE = 4

/** Design name, saved designs and (generic products) the material overlay. */
export function LayoutLibraryPanel() {
  const editor = useLayoutEditor()
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(editor.gallery.length / GALLERY_PER_PAGE))
  const current = Math.min(page, pages - 1)
  const nameId = useId()
  const materialOptions: SwatchOption<Material2D>[] = MATERIALS_2D.map((m) => {
    const [light, mid, dark] = METAL_STOPS(m.tint)
    return {
      id: m.value,
      label: m.label,
      visual: <span className="size-full" style={{ background: `radial-gradient(circle at 32% 28%, ${light} 0%, ${mid} 48%, ${dark} 100%)` }} />,
    }
  })

  return (
    <div className="flex flex-col gap-[1em]">
      {editor.plaque ? null : (
        <SwatchGroup
          legend="Material"
          name="material-2d"
          value={editor.material ?? MATERIALS_2D[0].value}
          options={materialOptions}
          onChange={editor.setMaterial}
        />
      )}
      <div className="flex flex-col gap-[0.45em]">
        <label htmlFor={nameId} className={groupLabel}>
          Design name
        </label>
        <input
          id={nameId}
          value={editor.name}
          onChange={(e) => editor.setName(e.target.value)}
          className="h-[2.4em] w-full rounded-[0.125em] border border-[#131111]/20 bg-white px-[0.8em] font-outfit text-[0.875em] text-[#131111] focus-visible:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
        />
      </div>
      <div className="flex flex-col gap-[0.45em]">
        <div className="flex items-center justify-between">
          <p className={groupLabel}>My designs</p>
          <div className="flex items-center gap-2">
            {pages > 1 ? (
              <>
                <button type="button" aria-label="Previous designs" disabled={current === 0} onClick={() => setPage(current - 1)} className={cn(smallButton, "size-[1.75em] disabled:opacity-30")}>
                  <ChevronLeft className="size-[0.9em]" aria-hidden />
                </button>
                <button type="button" aria-label="Next designs" disabled={current === pages - 1} onClick={() => setPage(current + 1)} className={cn(smallButton, "size-[1.75em] disabled:opacity-30")}>
                  <ChevronRight className="size-[0.9em]" aria-hidden />
                </button>
              </>
            ) : null}
            <button type="button" onClick={editor.loadGallery} className="font-outfit text-[0.75em] text-[#131111] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
              Refresh
            </button>
          </div>
        </div>
        {editor.gallery.length === 0 ? (
          <p className="m-0 font-outfit text-[0.8125em] text-[#6B635C]">Saved designs appear here (sign in to keep them).</p>
        ) : (
          <ul className="m-0 grid list-none grid-cols-4 gap-[0.4em] p-0">
            {editor.gallery.slice(current * GALLERY_PER_PAGE, current * GALLERY_PER_PAGE + GALLERY_PER_PAGE).map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => editor.openDesign(d)}
                  className="w-full overflow-hidden rounded-[0.25em] border border-[#131111]/12 bg-white text-left text-[#131111] hover:border-[#131111]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
                >
                  {d.preview_url ? (
                    <img src={d.preview_url} alt={d.name} className="aspect-square w-full object-cover" />
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center bg-[#F2F1EF] px-1 text-center font-outfit text-[0.625em] text-[#6B635C]">
                      {d.name}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
