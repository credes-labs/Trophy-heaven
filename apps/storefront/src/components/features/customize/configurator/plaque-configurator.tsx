"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useReducedMotion } from "motion/react"
import { Link2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { designApi } from "@/lib/design-client"
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
  getPlate,
  getWood,
  hasEngraving,
  resolveVariant,
  serializeConfig,
  type FaceLayout,
  type LineKey,
  type PlaqueConfig,
  type PlaqueVariant,
  type WoodId,
} from "@/lib/configurator/plaque"
import { faceDims, formOutline, outlinePath, plateOutline, plateRect } from "@/lib/configurator/shapes"
import { clearLayout, readLayout } from "@/lib/configurator/layout-store"
import { PlaqueStage } from "./plaque-stage"
import { StudioTopBar } from "./studio-top-bar"
import { SwatchGroup, type SwatchOption } from "./swatch-group"

export type ConfiguratorProduct = {
  id: string
  title: string
  handle: string
}

const LINE_FIELDS: { key: LineKey; label: string; placeholder: string }[] = [
  { key: "title", label: "Title line", placeholder: "Excellence Award" },
  { key: "name", label: "Recipient", placeholder: "Ananya Rao" },
  { key: "detail", label: "Detail line", placeholder: "Annual Honours 2026" },
]

const TABS = [
  { id: "shape", label: "Shape" },
  { id: "wood", label: "Wood" },
  { id: "plate", label: "Plate" },
  { id: "engraving", label: "Engraving" },
  { id: "display", label: "Display" },
] as const
type TabId = (typeof TABS)[number]["id"]

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
  gloss: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.08) 38%, rgba(255,255,255,0) 60%)",
}

const ICON = "h-[1.9em] w-[1.9em]"

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
      <rect x={-rect.width / 2} y={h - rect.cy - rect.height / 2} width={rect.width} height={rect.height} rx="0.03" fill="#c9a45c" />
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
      {border !== "none" ? <rect x="12" y="9" width="16" height="22" rx="1" fill="none" stroke="#c9a45c" strokeWidth="1.2" /> : null}
      {border === "double" ? <rect x="14" y="11" width="12" height="18" fill="none" stroke="#c9a45c" strokeWidth="0.6" /> : null}
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
        <circle cx="20" cy="20" r="11" fill="none" stroke="#131111" strokeOpacity="0.3" strokeDasharray="2 2" />
      ) : (
        <circle cx="20" cy="20" r="13" fill="#c9a45c" />
      )}
      {kind === "star" ? <path d="M20 11 L22.6 17.4 L29.5 17.6 L24 21.8 L26 28.4 L20 24.6 L14 28.4 L16 21.8 L10.5 17.6 L17.4 17.4 Z" fill="#331207" /> : null}
      {kind === "monogram" ? (
        <text x="20" y="21" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#331207" style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}>
          AR
        </text>
      ) : null}
      {kind === "laurel" ? (
        <path d="M14 26 Q10 20 14 13 M26 26 Q30 20 26 13" fill="none" stroke="#331207" strokeWidth="2.4" strokeDasharray="2.2 1.2" />
      ) : null}
    </svg>
  )
}

function AlignIcon({ align }: { align: PlaqueConfig["align"] }) {
  const lines = [16, 24, 12]
  return (
    <svg viewBox="0 0 40 40" className={ICON} aria-hidden>
      {lines.map((width, i) => (
        <rect key={i} x={align === "left" ? 9 : 20 - width / 2} y={12 + i * 7} width={width} height="2.4" rx="1.2" fill="#131111" />
      ))}
    </svg>
  )
}

function MountIcon({ mount }: { mount: PlaqueConfig["mount"] }) {
  return (
    <svg viewBox="0 0 40 40" className={ICON} fill="none" stroke="#131111" strokeWidth="1.5" aria-hidden>
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

export function PlaqueConfigurator({
  product,
  variants,
  initialConfig,
}: {
  product: ConfiguratorProduct | null
  variants: PlaqueVariant[]
  initialConfig: PlaqueConfig
}) {
  const [config, setConfig] = useState<PlaqueConfig>(initialConfig)
  const [layout, setLayout] = useState<FaceLayout | null>(null)
  const [tab, setTab] = useState<TabId>(initialConfig.face === "custom" ? "engraving" : "shape")
  const [status, setStatus] = useState<{ tone: "info" | "error"; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const reduced = Boolean(useReducedMotion())
  const addItem = useCartStore((s) => s.addItem)
  const cartLoading = useCartStore((s) => s.loading)
  const woodSwatches = useWoodSwatches()
  const tabsId = useId()
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({})

  const variant = resolveVariant(variants, config.size)
  const price = variant?.amount != null ? formatMoney(variant.amount, variant.currency) : null
  const canBuy = Boolean(product && variant?.inStock)
  const customFace = config.face === "custom" && layout ? layout : null

  // The URL is the shareable record of the configuration.
  useEffect(() => {
    const query = serializeConfig(config)
    if (window.location.search.slice(1) !== query) {
      window.history.replaceState(null, "", `${window.location.pathname}?${query}`)
    }
  }, [config])

  // A layout applied in the 2D editor comes back through sessionStorage.
  useEffect(() => {
    if (!product) return
    const stored = readLayout(product.id)
    if (stored) {
      setLayout(stored)
    } else if (initialConfig.face === "custom") {
      setConfig((c) => ({ ...c, face: "text" }))
      setStatus({ tone: "info", text: "That 2D layout isn't on this device — showing the engraving lines instead." })
    }
  }, [product, initialConfig.face])

  function set<K extends keyof PlaqueConfig>(key: K, value: PlaqueConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }))
    setStatus(null)
  }

  const layoutHref = product
    ? `/customize/${product.id}/2d?${new URLSearchParams({
        ...(variant ? { variant: variant.id } : {}),
        ...Object.fromEntries(new URLSearchParams(serializeConfig(config))),
      }).toString()}`
    : undefined

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
        backgroundImage: [sheen, woodSwatches[id] ? `url(${woodSwatches[id]})` : undefined].filter(Boolean).join(", ") || undefined,
      }}
    />
  )
  const woodOptions: SwatchOption<PlaqueConfig["wood"]>[] = WOODS.map((w) => ({ id: w.id, label: w.label, visual: woodVisual(w.id) }))
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
    () => PLATE_SHAPES.map((s) => ({ id: s.id, label: s.label, visual: <PlateShapeIcon shape={s.id} /> })),
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
        style={{ background: METAL_GRADIENT[config.plate], color: "color" in f ? f.color : plateColor.ink, fontFamily: "var(--font-playfair)" }}
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
        <span className="font-outfit text-[0.9375em] font-medium tracking-[-0.02em] text-[#131111]">{s.label}</span>
      ),
    }
  })

  async function handleAddToCart() {
    if (!product || !variant) return
    if (!hasEngraving(config) && !customFace) {
      setStatus({ tone: "error", text: "Add at least one line of engraving before adding to cart." })
      setTab("engraving")
      requestAnimationFrame(() => document.getElementById("engraving-name")?.focus())
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      const name = designName(config)
      const { design } = await designApi.create({
        name,
        mode: "3d",
        product_id: product.id,
        variant_id: variant.id,
        state_json: buildDesignState(config, customFace),
      })
      await addItem(variant.id, 1, cartMetadata(config, design))
      track("add_to_cart", {
        item_id: product.id,
        variant_id: variant.id,
        value: variant.amount ?? undefined,
        currency: variant.currency,
        quantity: 1,
      })
      setStatus({ tone: "info", text: "Added to your cart. We'll send a proof before we cut." })
    } catch {
      setStatus({ tone: "error", text: "We couldn't add this design. Please try again in a moment." })
    } finally {
      setSaving(false)
    }
  }

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "My Legacy Crafts plaque", url })
        return
      }
      await navigator.clipboard.writeText(url)
      setStatus({
        tone: "info",
        text: customFace
          ? "Link copied. The 2D layout stays on this device — the link shares every other choice."
          : "Link copied — anyone with it sees this exact design.",
      })
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return
      setStatus({ tone: "info", text: `Copy this link to share: ${url}` })
    }
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG)
    setStatus({ tone: "info", text: "Reset to the house default." })
  }

  function removeLayout() {
    clearLayout()
    setLayout(null)
    set("face", "text")
  }

  function onTabKey(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    const target = e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : delta ? (index + delta + TABS.length) % TABS.length : -1
    if (target < 0) return
    e.preventDefault()
    const next = TABS[target].id
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section
      aria-labelledby="configurator-heading"
      className="grid h-full grid-rows-[45dvh_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28em)] lg:grid-rows-1"
    >
      <div className="relative min-h-0 w-full">
        <PlaqueStage config={config} layoutImage={customFace?.image ?? null} reduced={reduced} />
        <StudioTopBar mode="3d" hrefs={{ "3d": "/customize", "2d": layoutHref }} />
      </div>

      <div className="flex min-h-0 flex-col border-t border-[#131111]/10 bg-[#FBFBF7] lg:border-t-0 lg:border-l">
        <div className="shrink-0 px-[clamp(1.25rem,2.5vw,2.25em)] pt-[0.9em] lg:pt-[1.75em]">
          <p className="m-0 hidden font-outfit text-[0.75em] tracking-[0.14em] text-[#6B635C] uppercase lg:block">Design studio</p>
          <h1
            id="configurator-heading"
            className="m-0 font-outfit text-[1.375rem] leading-[1.05] font-normal tracking-[-0.04em] text-balance text-[#131111] lg:mt-[0.4em] lg:text-[clamp(1.75rem,3vw,2.5em)]"
          >
            Compose your plaque
          </h1>
          <p className="mt-[0.6em] mb-0 hidden font-outfit text-[0.9375em] leading-[1.45] tracking-[-0.01em] text-pretty text-[#6B635C] lg:block">
            Turn it, change the timber and the plate, and read your engraving back at size. Every finish is
            included in the price — we send a proof before we cut.
          </p>
          <div
            role="tablist"
            aria-label="Customise"
            className="-mx-[0.25em] mt-[0.8em] flex gap-[0.25em] overflow-x-auto [scrollbar-width:none] border-b border-[#131111]/10 lg:mt-[1.25em]"
          >
            {TABS.map((t, index) => {
              const selected = t.id === tab
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el
                  }}
                  type="button"
                  role="tab"
                  id={`${tabsId}-tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls={`${tabsId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  onKeyDown={(e) => onTabKey(e, index)}
                  className={cn(
                    "-mb-px shrink-0 border-b-[1.5px] px-[0.6em] pt-[0.3em] pb-[0.7em] font-outfit text-[0.75em] font-medium tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#131111]",
                    selected ? "border-[#131111] text-[#131111]" : "border-transparent text-[#6B635C] hover:text-[#131111]"
                  )}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${tabsId}-panel`}
          aria-labelledby={`${tabsId}-tab-${tab}`}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-[clamp(1.25rem,2.5vw,2.25em)] pt-[1.1em] pb-[1.5em] lg:pt-[1.5em]"
        >
          <div className="flex flex-col gap-[1.6em]">
            {tab === "shape" ? (
              <>
                <SwatchGroup legend="Form" name="form" value={config.form} options={formOptions} onChange={(v) => set("form", v)} />
                <SwatchGroup legend="Edge" name="edge" value={config.edge} options={edgeOptions} onChange={(v) => set("edge", v)} />
                <SwatchGroup legend="Size" name="size" value={config.size} options={sizeOptions} onChange={(v) => set("size", v)} />
              </>
            ) : null}

            {tab === "wood" ? (
              <>
                <SwatchGroup legend="Timber" name="wood" value={config.wood} options={woodOptions} onChange={(v) => set("wood", v)} />
                <SwatchGroup legend="Finish" name="finish" value={config.finish} options={finishOptions} onChange={(v) => set("finish", v)} />
                <SwatchGroup legend="Inlay" name="border" value={config.border} options={borderOptions} onChange={(v) => set("border", v)} />
              </>
            ) : null}

            {tab === "plate" ? (
              <>
                <SwatchGroup legend="Metal" name="plate" value={config.plate} options={plateOptions} onChange={(v) => set("plate", v)} />
                <SwatchGroup legend="Plate shape" name="pshape" value={config.pshape} options={plateShapeOptions} onChange={(v) => set("pshape", v)} />
                <SwatchGroup legend="Emblem" name="emblem" value={config.emblem} options={emblemOptions} onChange={(v) => set("emblem", v)} />
              </>
            ) : null}

            {tab === "engraving" ? (
              <>
                {layout ? (
                  <div>
                    <SwatchGroup legend="Plate face" name="face" value={config.face} options={faceOptions} onChange={(v) => set("face", v)} />
                    <p className="mt-[0.8em] mb-0 flex flex-wrap gap-x-[1em] gap-y-[0.3em] font-outfit text-[0.8125em]">
                      {layoutHref ? (
                        <Link href={layoutHref} className="text-[#131111] underline underline-offset-[0.2em]">
                          Edit the 2D layout
                        </Link>
                      ) : null}
                      <button type="button" onClick={removeLayout} className="text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111]">
                        Remove layout
                      </button>
                    </p>
                  </div>
                ) : null}

                {customFace ? null : (
                  <fieldset className="m-0 min-w-0 border-0 p-0">
                    <legend className="p-0 font-outfit text-[0.75em] font-medium tracking-[0.14em] text-[#131111] uppercase">
                      Lines
                    </legend>
                    <div className="mt-[0.9em] flex flex-col gap-[0.9em]">
                      {LINE_FIELDS.map((field) => (
                        <div key={field.key}>
                          <div className="flex items-baseline justify-between">
                            <label
                              htmlFor={`engraving-${field.key}`}
                              className="font-outfit text-[0.8125em] tracking-[-0.01em] text-[#131111]"
                            >
                              {field.label}
                            </label>
                            <span className="font-outfit text-[0.6875em] text-[#6B635C] tabular-nums" aria-hidden>
                              {config[field.key].length}/{LINE_LIMITS[field.key]}
                            </span>
                          </div>
                          <input
                            id={`engraving-${field.key}`}
                            value={config[field.key]}
                            maxLength={LINE_LIMITS[field.key]}
                            placeholder={field.placeholder}
                            autoComplete="off"
                            onChange={(e) => set(field.key, cleanLine(e.target.value, LINE_LIMITS[field.key]))}
                            className="mt-[0.35em] h-[2.75em] w-full rounded-[0.125em] border border-[#131111]/20 bg-white px-[0.85em] font-outfit text-[0.9375em] text-[#131111] placeholder:text-[#6B635C]/70 focus-visible:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                )}

                {customFace ? null : (
                  <>
                    <SwatchGroup legend="Lettering" name="font" value={config.font} options={fontOptions} onChange={(v) => set("font", v)} />
                    <SwatchGroup legend="Fill" name="fill" value={config.fill} options={fillOptions} onChange={(v) => set("fill", v)} />
                    <SwatchGroup legend="Alignment" name="align" value={config.align} options={alignOptions} onChange={(v) => set("align", v)} />
                  </>
                )}

                {product && !layout ? (
                  <p className="m-0 rounded-[0.25em] border border-[#131111]/10 bg-[#F2F1EF] px-[1em] py-[0.85em] font-outfit text-[0.8125em] leading-[1.45] text-[#6B635C]">
                    Need a logo or a freeform layout?{" "}
                    <Link href={layoutHref!} className="text-[#131111] underline underline-offset-[0.2em]">
                      Compose it in 2D Layout
                    </Link>{" "}
                    — it comes back onto this plate.
                  </p>
                ) : null}
              </>
            ) : null}

            {tab === "display" ? (
              <SwatchGroup legend="Display" name="mount" value={config.mount} options={mountOptions} onChange={(v) => set("mount", v)} />
            ) : null}

            <p className="m-0 font-outfit text-[0.75em] tracking-[-0.01em] text-[#6B635C] lg:hidden">
              Every finish is included in the price. We send a proof before we cut.
            </p>
          </div>
        </div>

        <div
          className="shrink-0 border-t border-[#131111]/10 bg-[#FBFBF7] px-[clamp(1.25rem,2.5vw,2.25em)] pt-[0.9em] pb-[max(0.6em,env(safe-area-inset-bottom))] lg:py-[1.1em]"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="m-0 font-outfit text-[0.8125em] tracking-[-0.01em] text-[#6B635C]">
              {product ? (
                <Link
                  href={`/products/${product.handle}`}
                  className="text-[#6B635C] underline underline-offset-[0.2em] hover:text-[#131111]"
                >
                  {product.title}
                </Link>
              ) : (
                "Engraved plaque"
              )}
            </p>
            <p className="m-0 font-outfit text-[1.375em] tracking-[-0.03em] text-[#131111] tabular-nums" aria-live="polite">
              {price ?? "—"}
            </p>
          </div>
          <div className="mt-[0.85em] flex items-center gap-2">
            <Button
              onClick={handleAddToCart}
              disabled={!canBuy || saving || cartLoading}
              loading={saving}
              className="h-[3em] flex-1 rounded-full font-outfit text-[0.8125em] tracking-[0.08em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
              style={{ backgroundColor: "#131111", color: "#F2F1EF" }}
            >
              {!product ? "Unavailable" : variant && !variant.inStock ? "Out of stock" : "Add to cart"}
            </Button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Copy share link"
              className="flex size-[3em] items-center justify-center rounded-full border border-[#131111]/20 text-[#131111] hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            >
              <Link2 className="size-[1.1em]" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset design"
              className="flex size-[3em] items-center justify-center rounded-full border border-[#131111]/20 text-[#131111] hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            >
              <RotateCcw className="size-[1.1em]" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
          <p
            role="status"
            className={`mt-[0.6em] mb-0 min-h-[1.25em] font-outfit text-[0.75em] leading-[1.35] break-words ${
              status?.tone === "error" ? "text-[#8A2D25]" : "text-[#6B635C]"
            }`}
          >
            {status?.text ?? ""}
          </p>
        </div>
      </div>
    </section>
  )
}
