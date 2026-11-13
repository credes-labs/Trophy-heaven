"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useReducedMotion } from "motion/react"
import { Link2, PenLine, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { useEditorStore } from "@/stores/editor-store"
import { designApi, type DesignRecord } from "@/lib/design-client"
import { formatMoney } from "@/lib/format"
import { track } from "@/lib/analytics"
import { drawWood } from "@/lib/three/draw"
import { cn } from "@/lib/utils"
import {
  ALIGNS,
  BORDERS,
  DEFAULT_CONFIG,
  EDGES,
  EMBLEMS,
  FACES,
  FILLS,
  FINISHES,
  FONTS,
  FORMS,
  LINE_LIMITS,
  MOUNTS,
  PLATES,
  PLATE_SHAPES,
  SIZES,
  WOODS,
  buildDesignState,
  cartMetadata,
  cleanLine,
  designName,
  engravingLines,
  getPlate,
  getWood,
  hasEngraving,
  artworkOnWood,
  hasPlate,
  parseConfig,
  resolveVariant,
  serializeConfig,
  summarizeConfig,
  type FaceLayout,
  type LineKey,
  type PlaqueConfig,
  type PlaqueVariant,
  type WoodId,
} from "@/lib/configurator/plaque"
import {
  faceDims,
  formOutline,
  outlinePath,
  plateOutline,
  plateRect,
} from "@/lib/configurator/shapes"
import { clearLayout, readLayout, writeLayout } from "@/lib/configurator/layout-store"
import {
  LayoutComposePanel,
  LayoutEditorProvider,
  LayoutLibraryPanel,
  LayoutStage,
  type LayoutController,
} from "../layout/layout-editor"
import { ArtworkPlacement } from "./artwork-placement"
import { studioPiece, type AwardId } from "@/lib/configurator/studio-pieces"
import { StudioPiecePicker } from "./studio-piece-picker"
import { AwardStage } from "./award-stage"
import { PlaqueStage } from "./plaque-stage"
import { StudioTopBar, type StudioMode } from "./studio-top-bar"
import { SwatchGroup, type SwatchOption } from "./swatch-group"

export type ConfiguratorProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
}

const LINE_FIELDS: { key: LineKey; label: string; placeholder: string }[] = [
  { key: "title", label: "Title", placeholder: "Excellence Award" },
  { key: "name", label: "Recipient", placeholder: "Ananya Rao" },
  { key: "detail", label: "Detail", placeholder: "Annual Honours 2026" },
]

const TABS_3D = [
  { id: "shape", label: "Shape" },
  { id: "wood", label: "Wood" },
  { id: "plate", label: "Plate" },
  { id: "engraving", label: "Engraving" },
  { id: "display", label: "Display" },
] as const
const TABS_2D = [
  { id: "compose", label: "Compose" },
  { id: "library", label: "Library" },
] as const
type Tab3D = (typeof TABS_3D)[number]["id"]
type Tab2D = (typeof TABS_2D)[number]["id"]

const METAL_GRADIENT: Record<(typeof PLATES)[number]["id"], string> = {
  brass: "radial-gradient(circle at 32% 28%, #f4dfa6 0%, #c9a45c 45%, #7d5f2a 100%)",
  antique: "radial-gradient(circle at 32% 28%, #d8bf86 0%, #9c7a3e 48%, #4f3b1a 100%)",
  rose: "radial-gradient(circle at 32% 28%, #fbe0d6 0%, #d29a86 45%, #8a5546 100%)",
  copper: "radial-gradient(circle at 32% 28%, #f2b48c 0%, #b8693e 45%, #5e2e16 100%)",
  nickel: "radial-gradient(circle at 32% 28%, #ffffff 0%, #d4d2cc 45%, #84827c 100%)",
  black: "radial-gradient(circle at 32% 28%, #6b625a 0%, #2a2622 50%, #0f0d0b 100%)",
}

const FINISH_SHEEN: Record<(typeof FINISHES)[number]["id"], string> = {
  oil: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 100%)",
  satin: "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 55%)",
  gloss:
    "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.08) 38%, rgba(255,255,255,0) 60%)",
}

const ICON = "h-[1.7em] w-[1.7em]"
const panelX = "px-5 lg:px-6"
const ringFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
const roundButton = cn(
  "flex size-[2.6em] shrink-0 items-center justify-center rounded-full border border-[#131111]/20 text-[#131111] hover:bg-[#131111]/5",
  ringFocus
)

/** Wood swatches painted with the same grain routine as the 3D textures. */
function useWoodSwatches() {
  const [urls, setUrls] = useState<Partial<Record<WoodId, string>>>({})
  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 160
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const next: Partial<Record<WoodId, string>> = {}
    for (const wood of WOODS) {
      drawWood(ctx, 160, wood.grain[0], wood.grain[1], wood.grain[2], wood.seed)
      next[wood.id] = canvas.toDataURL("image/jpeg", 0.85)
    }
    setUrls(next)
  }, [])
  return urls
}

function FormIcon({ form }: { form: PlaqueConfig["form"] }) {
  const { w, h } = faceDims(form)
  const rect = plateRect(form, w, h)
  return (
    <svg viewBox={`${-1.1} ${-0.1 - (2 - h) / 2} 2.2 2.2`} className={ICON} aria-hidden>
      <path d={outlinePath(formOutline(form, w, h), h)} fill="#331207" />
      <rect
        x={-rect.width / 2}
        y={h - rect.cy - rect.height / 2}
        width={rect.width}
        height={rect.height}
        rx="0.03"
        fill="#c9a45c"
      />
    </svg>
  )
}

function EdgeIcon({ edge }: { edge: PlaqueConfig["edge"] }) {
  const d =
    edge === "square"
      ? "M10 30 V10 H30 V30"
      : edge === "chamfer"
        ? "M10 30 V16 L16 10 H30 V30"
        : "M10 30 V18 Q10 10 18 10 H30 V30"
  return (
    <svg viewBox="0 0 40 40" className={ICON} aria-hidden>
      <path d={d} fill="#331207" />
    </svg>
  )
}

function BorderIcon({ border }: { border: PlaqueConfig["border"] }) {
  return (
    <svg viewBox="0 0 40 40" className={ICON} aria-hidden>
      <rect x="9" y="6" width="22" height="28" rx="2" fill="#331207" />
      {border !== "none" ? (
        <rect
          x="12"
          y="9"
          width="16"
          height="22"
          rx="1"
          fill="none"
          stroke="#c9a45c"
          strokeWidth="1.2"
        />
      ) : null}
      {border === "double" ? (
        <rect x="14" y="11" width="12" height="18" fill="none" stroke="#c9a45c" strokeWidth="0.6" />
      ) : null}
    </svg>
  )
}

function PlateShapeIcon({ shape }: { shape: PlaqueConfig["pshape"] }) {
  return (
    <svg viewBox="-1 -0.7 2 1.4" className={ICON} aria-hidden>
      <path d={outlinePath(plateOutline(shape, 1.7, 0.95), 0)} fill="#c9a45c" />
    </svg>
  )
}

function EmblemIcon({ kind }: { kind: PlaqueConfig["emblem"] }) {
  return (
    <svg viewBox="0 0 40 40" className={ICON} aria-hidden>
      {kind === "none" ? (
        <circle
          cx="20"
          cy="20"
          r="11"
          fill="none"
          stroke="#131111"
          strokeOpacity="0.3"
          strokeDasharray="2 2"
        />
      ) : (
        <circle cx="20" cy="20" r="13" fill="#c9a45c" />
      )}
      {kind === "star" ? (
        <path
          d="M20 11 L22.6 17.4 L29.5 17.6 L24 21.8 L26 28.4 L20 24.6 L14 28.4 L16 21.8 L10.5 17.6 L17.4 17.4 Z"
          fill="#331207"
        />
      ) : null}
      {kind === "monogram" ? (
        <text
          x="20"
          y="21"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="11"
          fill="#331207"
          style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
        >
          AR
        </text>
      ) : null}
      {kind === "laurel" ? (
        <path
          d="M14 26 Q10 20 14 13 M26 26 Q30 20 26 13"
          fill="none"
          stroke="#331207"
          strokeWidth="2.4"
          strokeDasharray="2.2 1.2"
        />
      ) : null}
    </svg>
  )
}

function AlignIcon({ align }: { align: PlaqueConfig["align"] }) {
  const lines = [16, 24, 12]
  return (
    <svg viewBox="0 0 40 40" className={ICON} aria-hidden>
      {lines.map((width, i) => (
        <rect
          key={i}
          x={align === "left" ? 9 : 20 - width / 2}
          y={12 + i * 7}
          width={width}
          height="2.4"
          rx="1.2"
          fill="#131111"
        />
      ))}
    </svg>
  )
}

function MountIcon({ mount }: { mount: PlaqueConfig["mount"] }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={ICON}
      fill="none"
      stroke="#131111"
      strokeWidth="1.5"
      aria-hidden
    >
      {mount === "desk" ? (
        <>
          <path d="M13 29 L15 9 H27 L29 29" fill="#331207" stroke="none" />
          <rect x="8" y="29" width="24" height="5" rx="1.5" fill="#8a5a36" stroke="none" />
        </>
      ) : mount === "wall" ? (
        <>
          <path d="M20 4 L13 12 M20 4 L27 12" />
          <rect x="12" y="12" width="16" height="22" rx="1.5" fill="#331207" stroke="none" />
        </>
      ) : mount === "easel" ? (
        <>
          <path d="M14 36 L19 4 M26 36 L21 4" stroke="#b8955a" />
          <rect x="12" y="8" width="16" height="20" rx="1.5" fill="#331207" stroke="none" />
          <path d="M10 29 H30" stroke="#b8955a" strokeWidth="2" />
        </>
      ) : (
        <>
          <rect x="7" y="6" width="26" height="20" rx="2" fill="#191d26" stroke="none" />
          <rect x="9" y="8" width="22" height="16" rx="1" fill="#e0d8c3" stroke="none" />
          <rect x="13" y="12" width="14" height="18" rx="1" fill="#331207" stroke="none" />
          <rect x="6" y="28" width="28" height="7" rx="2" fill="#191d26" stroke="none" />
        </>
      )}
    </svg>
  )
}

/** WAI-ARIA tablist; only one option group is on screen at a time, so the panel never scrolls. */
function StudioTabs<Id extends string>({
  tabs,
  value,
  onChange,
  idBase,
  label,
}: {
  tabs: readonly { id: Id; label: string }[]
  value: Id
  onChange: (id: Id) => void
  idBase: string
  label: string
}) {
  const refs = useRef<Partial<Record<Id, HTMLButtonElement | null>>>({})
  function onKey(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    const target =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : delta
            ? (index + delta + tabs.length) % tabs.length
            : -1
    if (target < 0) return
    e.preventDefault()
    const next = tabs[target].id
    onChange(next)
    refs.current[next]?.focus()
  }
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-x-3 border-b border-[#131111]/10 pe-11"
    >
      {tabs.map((t, index) => {
        const selected = t.id === value
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, index)}
            className={cn(
              "-mb-px shrink-0 border-b-[1.5px] px-0.5 pt-2.5 pb-2.5 font-outfit text-[0.6875em] font-medium tracking-[0.06em] whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#131111]",
              selected
                ? "border-[#131111] text-[#131111]"
                : "border-transparent text-[#6B635C] hover:text-[#131111]"
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * The plaque studio: one fullscreen shell with two modes over one design. 3D
 * Preview turns the plaque and sets every material; 2D Layout composes the
 * plate face freely (text, logos) on a canvas drawn from the same config, and
 * that composition is the face the 3D model wears. Both live in this
 * component, so switching is instant and nothing is lost either way.
 */
export function PlaqueConfigurator({
  product,
  award,
  variants,
  initialConfig,
  initialMode = "3d",
  designId,
  restoreDraft = false,
}: {
  product: ConfiguratorProduct | null
  award?: AwardId
  restoreDraft?: boolean
  variants: PlaqueVariant[]
  initialConfig: PlaqueConfig
  initialMode?: StudioMode
  /** Saved 2D design to resume (from /account/designs "Open"). */
  designId?: string
}) {
  const startMode: StudioMode = initialMode
  const [config, setConfig] = useState<PlaqueConfig>(initialConfig)
  const [mode, setMode] = useState<StudioMode>(startMode)
  const [opened2d, setOpened2d] = useState(startMode === "2d")
  const [layout, setLayout] = useState<FaceLayout | null>(null)
  const [tab3d, setTab3d] = useState<Tab3D>(
    initialConfig.face === "custom" ? "engraving" : award ? "wood" : "shape"
  )
  const [tab2d, setTab2d] = useState<Tab2D>("compose")
  const [status, setStatus] = useState<{ tone: "info" | "error"; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [savedDesign, setSavedDesign] = useState<{ ready: boolean; record: DesignRecord | null }>({
    ready: !designId,
    record: null,
  })
  const reduced = Boolean(useReducedMotion())
  const addItem = useCartStore((s) => s.addItem)
  const cartLoading = useCartStore((s) => s.loading)
  const layoutSaving = useEditorStore((s) => s.saving)
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = previous
    }
  }, [])
  const woodSwatches = useWoodSwatches()
  const tabsId = useId()
  const controllerRef = useRef<LayoutController | null>(null)
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const variant = award ? variants[0] : resolveVariant(variants, config.size)
  const price = variant?.amount != null ? formatMoney(variant.amount, variant.currency) : null
  const canBuy = Boolean(product && variant?.inStock)
  const customFace = config.face === "custom" && layout ? layout : null
  const saving = busy || layoutSaving

  function say(tone: "info" | "error", text: string) {
    if (statusTimer.current) clearTimeout(statusTimer.current)
    setStatus({ tone, text })
    statusTimer.current = setTimeout(() => setStatus(null), tone === "error" ? 6000 : 3500)
  }
  useEffect(
    () => () => {
      if (statusTimer.current) clearTimeout(statusTimer.current)
    },
    []
  )

  // The URL is the shareable record of the design: options, size variant and mode.
  // Next patches history.replaceState and, when state is null, dispatches a
  // navigation. Passing the existing Next history state updates the query only.
  useEffect(() => {
    const params = new URLSearchParams(serializeConfig(config))
    params.set("piece", award ?? "plaque")
    if (designId) params.set("design", designId)
    if (mode === "2d") params.set("mode", "2d")
    if (variant) params.set("variant", variant.id)
    const query = params.toString()
    if (window.location.search.slice(1) === query) return
    const url = `${window.location.pathname}?${query}`
    const state = window.history.state as { __NA?: boolean; _N?: boolean } | null
    if (state && (state.__NA || state._N)) {
      window.history.replaceState(state, "", url)
    } else {
      History.prototype.replaceState.call(window.history, state, "", url)
    }
  }, [config, mode, variant, award, designId])

  // The 2D composition for this product survives reloads in sessionStorage.
  useEffect(() => {
    const stored = readLayout(product?.id ?? `draft-${award ?? "plaque"}`)
    if (stored) {
      setLayout(stored)
      if (restoreDraft) setConfig((c) => ({ ...c, face: "custom" }))
    } else if (initialConfig.face === "custom") {
      setConfig((c) => ({ ...c, face: "text" }))
      say("info", "That 2D layout isn't on this device — showing the engraving lines instead.")
    }
  }, [product, initialConfig.face, award, restoreDraft])

  // Resuming a saved 2D design also restores the plaque choices stored with it.
  useEffect(() => {
    if (!designId) return
    let cancelled = false
    designApi
      .get(designId)
      .then(({ design }) => {
        if (cancelled) return
        const saved = (
          design.state_json as {
            configurator?: {
              options?: Record<string, string>
              lines?: Record<string, string>
              layout?: { fabric?: unknown } | null
            }
          }
        ).configurator
        if (saved?.options)
          setConfig((c) => ({ ...parseConfig({ ...saved.options, ...saved.lines }), size: c.size }))
        if (design.mode === "2d") {
          setOpened2d(true)
          setSavedDesign({ ready: true, record: design })
        } else if (saved?.layout?.fabric) {
          setOpened2d(true)
          setSavedDesign({
            ready: true,
            record: {
              ...design,
              id: "",
              mode: "2d",
              state_json: saved.layout.fabric as Record<string, unknown>,
            },
          })
        } else {
          setSavedDesign({ ready: true, record: null })
        }
      })
      .catch(() => {
        if (!cancelled) setSavedDesign({ ready: true, record: null })
      })
    return () => {
      cancelled = true
    }
  }, [designId])

  const productId = product?.id ?? `draft-${award ?? "plaque"}`
  const handleLayoutChange = useCallback(
    (next: FaceLayout | null) => {
      if (!productId) return
      if (next) {
        if (!writeLayout(productId, next)) {
          say("error", "This layout is too large to keep on this device. Try a smaller logo file.")
        }
        setLayout(next)
        setConfig((c) => (c.face === "custom" ? c : { ...c, face: "custom" }))
      } else {
        clearLayout(productId)
        setLayout(null)
        setConfig((c) => (c.face === "text" ? c : { ...c, face: "text" }))
      }
    },
    [productId]
  )

  function changeMode(next: StudioMode) {
    if (next === mode) return
    if (next === "3d") controllerRef.current?.flush()
    else setOpened2d(true)
    setMode(next)
    setStatus(null)
  }

  function set<K extends keyof PlaqueConfig>(key: K, value: PlaqueConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }))
    setStatus(null)
  }

  const formOptions = useMemo<SwatchOption<PlaqueConfig["form"]>[]>(
    () => FORMS.map((f) => ({ id: f.id, label: f.label, visual: <FormIcon form={f.id} /> })),
    []
  )
  const edgeOptions = useMemo<SwatchOption<PlaqueConfig["edge"]>[]>(
    () => EDGES.map((e) => ({ id: e.id, label: e.label, visual: <EdgeIcon edge={e.id} /> })),
    []
  )
  const woodVisual = (id: WoodId, sheen?: string) => (
    <span
      className="size-full bg-cover bg-center"
      style={{
        backgroundColor: getWood(id).grain[0],
        backgroundImage:
          [sheen, woodSwatches[id] ? `url(${woodSwatches[id]})` : undefined]
            .filter(Boolean)
            .join(", ") || undefined,
      }}
    />
  )
  const woodOptions: SwatchOption<PlaqueConfig["wood"]>[] = WOODS.map((w) => ({
    id: w.id,
    label: w.label,
    visual: woodVisual(w.id),
  }))
  const finishOptions: SwatchOption<PlaqueConfig["finish"]>[] = FINISHES.map((f) => ({
    id: f.id,
    label: f.label,
    visual: woodVisual(config.wood, FINISH_SHEEN[f.id]),
  }))
  const borderOptions = useMemo<SwatchOption<PlaqueConfig["border"]>[]>(
    () => BORDERS.map((b) => ({ id: b.id, label: b.label, visual: <BorderIcon border={b.id} /> })),
    []
  )
  const plateOptions: SwatchOption<PlaqueConfig["plate"]>[] = PLATES.map((p) => ({
    id: p.id,
    label: p.label,
    visual: <span className="size-full" style={{ background: METAL_GRADIENT[p.id] }} />,
  }))
  const plateShapeOptions = useMemo<SwatchOption<PlaqueConfig["pshape"]>[]>(
    () =>
      PLATE_SHAPES.map((s) => ({
        id: s.id,
        label: s.label,
        visual: <PlateShapeIcon shape={s.id} />,
      })),
    []
  )
  const emblemOptions = useMemo<SwatchOption<PlaqueConfig["emblem"]>[]>(
    () => EMBLEMS.map((e) => ({ id: e.id, label: e.label, visual: <EmblemIcon kind={e.id} /> })),
    []
  )
  const fontOptions = useMemo<SwatchOption<PlaqueConfig["font"]>[]>(
    () =>
      FONTS.map((f) => ({
        id: f.id,
        label: f.label,
        visual: (
          <span
            className="bg-[#F2F1EF] text-[1.35em] text-[#131111] leading-none"
            style={{ fontFamily: `var(${f.cssVar})`, fontStyle: f.style, fontWeight: f.weight }}
          >
            Aa
          </span>
        ),
      })),
    []
  )
  const plateColor = getPlate(config.plate)
  const fillOptions: SwatchOption<PlaqueConfig["fill"]>[] = FILLS.map((f) => ({
    id: f.id,
    label: f.label,
    visual: (
      <span
        className="flex size-full items-center justify-center text-[1.2em] leading-none font-semibold"
        style={{
          background: METAL_GRADIENT[config.plate],
          color: "color" in f ? f.color : plateColor.ink,
          fontFamily: "var(--font-playfair)",
        }}
      >
        Aa
      </span>
    ),
  }))
  const alignOptions = useMemo<SwatchOption<PlaqueConfig["align"]>[]>(
    () => ALIGNS.map((a) => ({ id: a.id, label: a.label, visual: <AlignIcon align={a.id} /> })),
    []
  )
  const faceOptions: SwatchOption<PlaqueConfig["face"]>[] = FACES.map((f) => ({
    id: f.id,
    label: f.label,
    visual:
      f.id === "custom" && layout ? (
        <span
          className="size-full bg-no-repeat"
          style={{
            backgroundImage: `url(${layout.image}), ${METAL_GRADIENT[config.plate]}`,
            backgroundSize: "80% auto, cover",
            backgroundPosition: "center, center",
          }}
        />
      ) : (
        <AlignIcon align="center" />
      ),
  }))
  const mountOptions = useMemo<SwatchOption<PlaqueConfig["mount"]>[]>(
    () => MOUNTS.map((m) => ({ id: m.id, label: m.label, visual: <MountIcon mount={m.id} /> })),
    []
  )
  const sizeOptions: SwatchOption<PlaqueConfig["size"]>[] = SIZES.map((s) => {
    const v = resolveVariant(variants, s.id)
    return {
      id: s.id,
      label: s.detail,
      note: v?.amount != null ? formatMoney(v.amount, v.currency) : undefined,
      visual: (
        <span className="font-outfit text-[0.9375em] font-medium tracking-[-0.02em] text-[#131111]">
          {s.label}
        </span>
      ),
    }
  })

  async function addToCart3D() {
    if (!product || !variant) return
    if (!hasEngraving(config) && !customFace) {
      say("error", "Add a line of engraving or a photo before adding to cart.")
      setTab3d("engraving")
      requestAnimationFrame(() => document.getElementById("engraving-name")?.focus())
      return
    }
    setBusy(true)
    try {
      const { design } = await designApi.create({
        name: designName(config, award),
        mode: "3d",
        product_id: product.id,
        variant_id: variant.id,
        state_json: buildDesignState(config, customFace, award),
      })
      await addItem(variant.id, 1, cartMetadata(config, design, award))
      track("add_to_cart", {
        item_id: product.id,
        variant_id: variant.id,
        value: variant.amount ?? undefined,
        currency: variant.currency,
        quantity: 1,
      })
      say("info", "Added to your cart. We'll send a proof before we cut.")
    } catch {
      say("error", "We couldn't add this design. Please try again in a moment.")
    } finally {
      setBusy(false)
    }
  }

  async function saveLayout() {
    const controller = controllerRef.current
    if (!controller) return null
    controller.flush()
    try {
      const record = await controller.save()
      if (!record) say("error", "Fix the highlighted layout issue first.")
      return record
    } catch {
      say("error", "We couldn't save this design. Please try again in a moment.")
      return null
    }
  }

  async function addToCart2D() {
    if (!product || !variant) return
    if (!hasEngraving(config) && !controllerRef.current?.hasContent()) {
      say("error", "Add a line of engraving or a photo before adding to cart.")
      setTab2d("compose")
      return
    }
    const record = await saveLayout()
    if (!record) return
    setBusy(true)
    try {
      await addItem(variant.id, 1, {
        design_id: record.id,
        design_name: record.name,
        preview_url: record.preview_url,
        customization_mode: "2d",
        configuration: {
          ...summarizeConfig({ ...config, face: "custom" }),
          ...(award ? { model: studioPiece(award).label, piece: award } : {}),
          engraving: engravingLines(config),
        },
      })
      track("design_added_to_cart", { design_id: record.id, mode: "2d", product_id: product.id })
      say("info", "Added to cart with your design")
    } catch {
      say("error", "We couldn't add this design. Please try again in a moment.")
    } finally {
      setBusy(false)
    }
  }

  async function handleSave() {
    const record = await saveLayout()
    if (record) say("info", "Saved to your gallery")
  }

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({
          title: award ? studioPiece(award).label : "My Legacy Crafts plaque",
          url,
        })
        return
      }
      await navigator.clipboard.writeText(url)
      say(
        "info",
        customFace
          ? "Link copied. The 2D layout stays on this device — the link shares every other choice."
          : "Link copied — anyone with it sees this exact design."
      )
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return
      say("info", `Copy this link to share: ${url}`)
    }
  }

  function handleReset() {
    setConfig({
      ...DEFAULT_CONFIG,
      ...(award ? ({ pshape: "rect", art: "plate", emblem: "none", mount: "desk" } as const) : {}),
    })
    removeLayout()
    say("info", "Reset to the house default.")
  }

  function removeLayout() {
    clearLayout(productId)
    setLayout(null)
    controllerRef.current?.clear()
    set("face", "text")
  }

  const in2d = mode === "2d"
  const sizeLabel = SIZES.find((s) => s.id === config.size)?.label

  const body = (
    <section
      aria-labelledby="configurator-heading"
      className="grid h-full min-h-0 grid-rows-[minmax(0,34dvh)_minmax(0,1fr)] overflow-hidden text-[12px] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] lg:grid-rows-1 lg:text-[13px]"
    >
      <div className="relative min-h-0 w-full overflow-hidden">
        <div
          className={cn("absolute inset-0", in2d && "invisible")}
          aria-hidden={in2d || undefined}
        >
          {award ? (
            <AwardStage award={award} config={config} layoutImage={customFace?.image ?? null} />
          ) : (
            <PlaqueStage
              config={config}
              layoutImage={customFace?.image ?? null}
              reduced={reduced}
            />
          )}
        </div>
        {opened2d ? <LayoutStage className={in2d ? undefined : "invisible"} /> : null}
        <StudioTopBar mode={mode} onModeChange={changeMode} />
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden border-t border-[#131111]/10 bg-[#FBFBF7] lg:border-t-0 lg:border-l">
        <div className={cn("shrink-0 pt-5 lg:pt-6", panelX)}>
          <StudioPiecePicker value={award ?? "plaque"} />
          <h1
            id="configurator-heading"
            className="m-0 font-outfit text-[1.15em] leading-none font-normal tracking-[-0.03em] text-[#131111] lg:text-[1.35em]"
          >
            {award ? studioPiece(award).label : "Customise your plaque"}
          </h1>
          <div className="mt-4">
            {in2d ? (
              <StudioTabs
                tabs={TABS_2D}
                value={tab2d}
                onChange={setTab2d}
                idBase={`${tabsId}-2d`}
                label="Layout tools"
              />
            ) : (
              <StudioTabs
                tabs={
                  award
                    ? [
                        { id: "wood", label: "Finish & base" },
                        { id: "engraving", label: "Engraving" },
                      ]
                    : TABS_3D
                }
                value={tab3d}
                onChange={setTab3d}
                idBase={`${tabsId}-3d`}
                label="Customise"
              />
            )}
          </div>
        </div>

        <div
          role="tabpanel"
          id={in2d ? `${tabsId}-2d-panel` : `${tabsId}-3d-panel`}
          aria-labelledby={in2d ? `${tabsId}-2d-tab-${tab2d}` : `${tabsId}-3d-tab-${tab3d}`}
          className={cn(
            "relative min-h-0 flex-1 overflow-y-auto overscroll-contain pb-5 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            panelX
          )}
        >
          {in2d ? (
            tab2d === "compose" ? (
              <LayoutComposePanel />
            ) : (
              <LayoutLibraryPanel />
            )
          ) : (
            <div className="flex flex-col gap-6">
              {tab3d === "shape" ? (
                <>
                  <SwatchGroup
                    legend="Form"
                    name="form"
                    value={config.form}
                    options={formOptions}
                    onChange={(v) => set("form", v)}
                  />
                  <SwatchGroup
                    legend="Edge"
                    name="edge"
                    value={config.edge}
                    options={edgeOptions}
                    onChange={(v) => set("edge", v)}
                  />
                  <SwatchGroup
                    legend="Size"
                    name="size"
                    value={config.size}
                    options={sizeOptions}
                    onChange={(v) => set("size", v)}
                  />
                </>
              ) : null}

              {award && tab3d === "wood" ? (
                <>
                  <SwatchGroup
                    legend="Figure & plate metal"
                    name="plate"
                    value={config.plate}
                    options={plateOptions}
                    onChange={(v) => set("plate", v)}
                  />
                  <SwatchGroup
                    legend="Timber base"
                    name="wood"
                    value={config.wood}
                    options={woodOptions.filter((w) =>
                      ["walnut", "ebony", "cherry"].includes(w.id)
                    )}
                    onChange={(v) => set("wood", v)}
                  />
                  <SwatchGroup
                    legend="Finish"
                    name="finish"
                    value={config.finish}
                    options={finishOptions}
                    onChange={(v) => set("finish", v)}
                  />
                  <p className="m-0 font-outfit text-xs leading-5 text-[#6B635C]">
                    {studioPiece(award).detail}. Your lettering and artwork are engraved on the
                    front plate.
                  </p>
                </>
              ) : null}
              {!award && tab3d === "wood" ? (
                <>
                  <SwatchGroup
                    legend="Timber"
                    name="wood"
                    value={config.wood}
                    options={woodOptions}
                    onChange={(v) => set("wood", v)}
                  />
                  <SwatchGroup
                    legend="Finish"
                    name="finish"
                    value={config.finish}
                    options={finishOptions}
                    onChange={(v) => set("finish", v)}
                  />
                  <SwatchGroup
                    legend="Inlay"
                    name="border"
                    value={config.border}
                    options={borderOptions}
                    onChange={(v) => set("border", v)}
                  />
                </>
              ) : null}

              {tab3d === "plate" ? (
                <>
                  <SwatchGroup
                    legend="Plate shape"
                    name="pshape"
                    value={config.pshape}
                    options={plateShapeOptions}
                    onChange={(v) => set("pshape", v)}
                  />
                  {hasPlate(config) ? (
                    <>
                      <SwatchGroup
                        legend="Metal"
                        name="plate"
                        value={config.plate}
                        options={plateOptions}
                        onChange={(v) => set("plate", v)}
                      />
                      <ArtworkPlacement value={config.art} onChange={(v) => set("art", v)} />
                    </>
                  ) : (
                    <p className="m-0 font-outfit text-[0.75em] leading-[1.35] text-[#6B635C]">
                      No metal plate — engraving and photos sit in the wood.
                    </p>
                  )}
                  <SwatchGroup
                    legend="Emblem"
                    name="emblem"
                    value={config.emblem}
                    options={emblemOptions}
                    onChange={(v) => set("emblem", v)}
                  />
                </>
              ) : null}

              {tab3d === "engraving" ? (
                <>
                  {layout ? (
                    <div className="flex items-end justify-between gap-3">
                      <SwatchGroup
                        legend="Plate face"
                        name="face"
                        value={config.face}
                        options={faceOptions}
                        onChange={(v) => set("face", v)}
                      />
                      <button
                        type="button"
                        onClick={removeLayout}
                        className={cn(
                          "mb-[0.6em] shrink-0 font-outfit text-[0.75em] text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111]",
                          ringFocus
                        )}
                      >
                        Remove layout
                      </button>
                    </div>
                  ) : null}

                  {customFace ? (
                    <p className="m-0 font-outfit text-[0.75em] leading-[1.35] text-[#6B635C]">
                      {artworkOnWood(config)
                        ? "The wood shows your 2D layout."
                        : "The plate shows your 2D layout."}
                    </p>
                  ) : (
                    <fieldset className="m-0 min-w-0 border-0 p-0">
                      <legend className="p-0 font-outfit text-[0.6875em] font-medium tracking-[0.14em] text-[#131111] uppercase">
                        Engraving
                      </legend>
                      <div className="mt-[0.55em] flex flex-col gap-[0.45em]">
                        {LINE_FIELDS.map((field) => (
                          <div key={field.key} className="flex items-center gap-[0.6em]">
                            <label
                              htmlFor={`engraving-${field.key}`}
                              className="w-[5.2em] shrink-0 font-outfit text-[0.8125em] text-[#131111]"
                            >
                              {field.label}
                            </label>
                            <div className="relative min-w-0 flex-1">
                              <input
                                id={`engraving-${field.key}`}
                                value={config[field.key]}
                                maxLength={LINE_LIMITS[field.key]}
                                placeholder={field.placeholder}
                                autoComplete="off"
                                onChange={(e) =>
                                  set(field.key, cleanLine(e.target.value, LINE_LIMITS[field.key]))
                                }
                                className="h-[2.4em] w-full rounded-[0.125em] border border-[#131111]/20 bg-white pr-[3.2em] pl-[0.75em] font-outfit text-[0.875em] text-[#131111] placeholder:text-[#6B635C]/70 focus-visible:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
                              />
                              <span
                                className="pointer-events-none absolute top-1/2 right-[0.7em] -translate-y-1/2 font-outfit text-[0.6875em] text-[#6B635C] tabular-nums"
                                aria-hidden
                              >
                                {config[field.key].length}/{LINE_LIMITS[field.key]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {product ? (
                    <button
                      type="button"
                      onClick={() => changeMode("2d")}
                      className={cn(
                        "flex h-[2.6em] items-center justify-center gap-[0.5em] rounded-full border border-[#131111]/25 font-outfit text-[0.75em] tracking-[0.08em] text-[#131111] uppercase transition-colors hover:bg-[#131111]/5",
                        ringFocus
                      )}
                    >
                      <PenLine className="size-[1.1em]" strokeWidth={1.5} aria-hidden />
                      {layout ? "Edit in 2D" : "Add a photo in 2D"}
                    </button>
                  ) : null}
                  <SwatchGroup
                    legend="Lettering"
                    name="font"
                    value={config.font}
                    options={fontOptions}
                    onChange={(v) => set("font", v)}
                  />
                  <SwatchGroup
                    legend="Fill"
                    name="fill"
                    value={config.fill}
                    options={fillOptions}
                    onChange={(v) => set("fill", v)}
                  />
                  <SwatchGroup
                    legend="Alignment"
                    name="align"
                    value={config.align}
                    options={alignOptions}
                    onChange={(v) => set("align", v)}
                  />
                </>
              ) : null}

              {tab3d === "display" ? (
                <SwatchGroup
                  legend="Display"
                  name="mount"
                  value={config.mount}
                  options={mountOptions}
                  onChange={(v) => set("mount", v)}
                />
              ) : null}
            </div>
          )}
        </div>

        <div
          className={cn(
            "relative shrink-0 border-t border-[#131111]/10 bg-[#FBFBF7] pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-4",
            panelX
          )}
        >
          <p
            role="status"
            className={cn(
              "pointer-events-none absolute bottom-[calc(100%+0.6em)] left-1/2 m-0 w-max max-w-[calc(100%-2.5em)] -translate-x-1/2 rounded-[0.5em] px-[0.9em] py-[0.5em] font-outfit text-[0.75em] leading-[1.35] text-[#F2F1EF] shadow-[0_10px_30px_-14px_rgba(19,17,17,0.6)] transition-opacity duration-200",
              status ? "opacity-100" : "opacity-0",
              status?.tone === "error" ? "bg-[#8A2D25]" : "bg-[#131111]"
            )}
          >
            {status?.text ?? ""}
          </p>
          <div className="flex items-baseline justify-between gap-3">
            <p className="m-0 min-w-0 truncate font-outfit text-[0.8125em] tracking-[-0.01em] text-[#6B635C]">
              {product ? (
                <Link
                  href={`/products/${product.handle}`}
                  className="text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111]"
                >
                  {product.title}
                </Link>
              ) : award ? (
                studioPiece(award).label
              ) : (
                "Engraved plaque"
              )}
              {!award && sizeLabel ? ` · ${sizeLabel}` : null}
            </p>
            <p
              className="m-0 font-outfit text-[1.15em] tracking-[-0.03em] text-[#131111] tabular-nums"
              aria-live="polite"
            >
              {price ?? "—"}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <Button
              onClick={in2d ? addToCart2D : addToCart3D}
              disabled={!canBuy || saving || cartLoading}
              loading={saving}
              className={cn(
                "h-[2.6em] min-w-0 flex-1 rounded-full font-outfit text-[0.75em] tracking-[0.08em] uppercase",
                ringFocus
              )}
              style={{ backgroundColor: "#131111", color: "#F2F1EF" }}
            >
              {!product
                ? "Unavailable"
                : variant && !variant.inStock
                  ? "Out of stock"
                  : "Add to cart"}
            </Button>
            {in2d ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !product}
                className={cn(
                  "flex h-[2.6em] items-center justify-center rounded-full border border-[#131111]/25 px-[1em] font-outfit text-[0.75em] tracking-[0.08em] text-[#131111] uppercase transition-colors hover:bg-[#131111]/5 disabled:opacity-50",
                  ringFocus
                )}
              >
                Save
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Copy share link"
                  className={roundButton}
                >
                  <Link2 className="size-[1.1em]" strokeWidth={1.5} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset design"
                  className={roundButton}
                >
                  <RotateCcw className="size-[1.1em]" strokeWidth={1.5} aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <LayoutEditorProvider
      enabled={opened2d && savedDesign.ready}
      product={product ?? { id: `draft-${award ?? "plaque"}` }}
      variantId={variant?.id}
      plaque={config}
      award={award}
      initialDesign={savedDesign.record}
      onLayoutChange={handleLayoutChange}
      onArtChange={(art) => set("art", art)}
      controllerRef={controllerRef}
    >
      {body}
    </LayoutEditorProvider>
  )
}
