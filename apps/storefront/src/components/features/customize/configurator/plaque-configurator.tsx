"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useReducedMotion } from "motion/react"
import { Link2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { designApi } from "@/lib/design-client"
import { formatMoney } from "@/lib/format"
import { track } from "@/lib/analytics"
import { drawWood } from "@/lib/three/draw"
import {
  DEFAULT_CONFIG,
  FONTS,
  FORMS,
  LINE_LIMITS,
  MOUNTS,
  PLATES,
  SIZES,
  WOODS,
  buildDesignState,
  cartMetadata,
  cleanLine,
  designName,
  hasEngraving,
  resolveVariant,
  serializeConfig,
  type LineKey,
  type PlaqueConfig,
  type PlaqueVariant,
  type WoodId,
} from "@/lib/configurator/plaque"
import { formOutline, outlinePath } from "@/lib/configurator/shapes"
import { PlaqueStage } from "./plaque-stage"
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

const METAL_GRADIENT: Record<(typeof PLATES)[number]["id"], string> = {
  brass: "radial-gradient(circle at 32% 28%, #f4dfa6 0%, #c9a45c 45%, #7d5f2a 100%)",
  nickel: "radial-gradient(circle at 32% 28%, #ffffff 0%, #d4d2cc 45%, #84827c 100%)",
  black: "radial-gradient(circle at 32% 28%, #6b625a 0%, #2a2622 50%, #0f0d0b 100%)",
}

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
  return (
    <svg viewBox="-1 -0.15 2 2.3" className="h-[1.9em] w-[1.9em]" aria-hidden>
      <path d={outlinePath(formOutline(form), 2)} fill="#331207" />
      <rect x="-0.58" y="1.1" width="1.16" height="0.42" rx="0.03" fill="#c9a45c" />
    </svg>
  )
}

function MountIcon({ mount }: { mount: PlaqueConfig["mount"] }) {
  return (
    <svg viewBox="0 0 40 40" className="h-[1.9em] w-[1.9em]" fill="none" stroke="#131111" strokeWidth="1.5" aria-hidden>
      {mount === "desk" ? (
        <>
          <path d="M13 29 L15 9 H27 L29 29" fill="#331207" stroke="none" />
          <rect x="8" y="29" width="24" height="5" rx="1.5" fill="#8a5a36" stroke="none" />
        </>
      ) : (
        <>
          <path d="M20 4 L13 12 M20 4 L27 12" />
          <rect x="12" y="12" width="16" height="22" rx="1.5" fill="#331207" stroke="none" />
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
  const [status, setStatus] = useState<{ tone: "info" | "error"; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const reduced = Boolean(useReducedMotion())
  const addItem = useCartStore((s) => s.addItem)
  const cartLoading = useCartStore((s) => s.loading)
  const woodSwatches = useWoodSwatches()

  const variant = resolveVariant(variants, config.size)
  const price = variant?.amount != null ? formatMoney(variant.amount, variant.currency) : null
  const canBuy = Boolean(product && variant?.inStock)

  // The URL is the shareable record of the configuration.
  useEffect(() => {
    const query = serializeConfig(config)
    if (window.location.search.slice(1) !== query) {
      window.history.replaceState(null, "", `${window.location.pathname}?${query}`)
    }
  }, [config])

  function set<K extends keyof PlaqueConfig>(key: K, value: PlaqueConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }))
    setStatus(null)
  }

  const formOptions = useMemo<SwatchOption<PlaqueConfig["form"]>[]>(
    () => FORMS.map((f) => ({ id: f.id, label: f.label, visual: <FormIcon form={f.id} /> })),
    []
  )
  const woodOptions: SwatchOption<PlaqueConfig["wood"]>[] = WOODS.map((w) => ({
    id: w.id,
    label: w.label,
    visual: (
      <span
        className="size-full bg-cover bg-center"
        style={{
          backgroundColor: w.grain[0],
          backgroundImage: woodSwatches[w.id] ? `url(${woodSwatches[w.id]})` : undefined,
        }}
      />
    ),
  }))
  const plateOptions: SwatchOption<PlaqueConfig["plate"]>[] = PLATES.map((p) => ({
    id: p.id,
    label: p.label,
    visual: <span className="size-full" style={{ background: METAL_GRADIENT[p.id] }} />,
  }))
  const mountOptions = useMemo<SwatchOption<PlaqueConfig["mount"]>[]>(
    () => MOUNTS.map((m) => ({ id: m.id, label: m.label, visual: <MountIcon mount={m.id} /> })),
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
    if (!hasEngraving(config)) {
      setStatus({ tone: "error", text: "Add at least one line of engraving before adding to cart." })
      document.getElementById("engraving-name")?.focus()
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
        state_json: buildDesignState(config),
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
      setStatus({ tone: "info", text: "Link copied — anyone with it sees this exact design." })
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return
      setStatus({ tone: "info", text: `Copy this link to share: ${url}` })
    }
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG)
    setStatus({ tone: "info", text: "Reset to the house default." })
  }

  return (
    <section
      aria-labelledby="configurator-heading"
      className="grid border-b border-[#131111]/10 lg:h-[calc(100svh-3rem)] lg:min-h-[40rem] lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28em)]"
    >
      <div className="relative aspect-[4/5] max-h-[72svh] w-full sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:max-h-none">
        <PlaqueStage config={config} reduced={reduced} />
      </div>

      <div className="flex min-h-0 flex-col border-[#131111]/10 bg-[#FBFBF7] lg:border-l">
        <div className="flex-1 px-[clamp(1.25rem,2.5vw,2.25em)] pt-[1.75em] pb-[1.5em] lg:overflow-y-auto">
          <p className="m-0 font-outfit text-[0.75em] tracking-[0.14em] text-[#6B635C] uppercase">Design studio</p>
          <h1
            id="configurator-heading"
            className="mt-[0.4em] mb-0 font-outfit text-[clamp(1.75rem,3vw,2.5em)] leading-[1.05] font-normal tracking-[-0.04em] text-balance text-[#131111]"
          >
            Compose your plaque
          </h1>
          <p className="mt-[0.75em] mb-0 font-outfit text-[0.9375em] leading-[1.45] tracking-[-0.01em] text-pretty text-[#6B635C]">
            Turn it, change the timber and the plate, and read your engraving back at size. Every finish is
            included in the price — we send a proof before we cut.
          </p>

          <div className="mt-[2em] flex flex-col gap-[1.75em]">
            <SwatchGroup legend="Form" name="form" value={config.form} options={formOptions} onChange={(v) => set("form", v)} />
            <SwatchGroup legend="Timber" name="wood" value={config.wood} options={woodOptions} onChange={(v) => set("wood", v)} />
            <SwatchGroup legend="Plate" name="plate" value={config.plate} options={plateOptions} onChange={(v) => set("plate", v)} />
            <SwatchGroup legend="Display" name="mount" value={config.mount} options={mountOptions} onChange={(v) => set("mount", v)} />
            <SwatchGroup legend="Size" name="size" value={config.size} options={sizeOptions} onChange={(v) => set("size", v)} />

            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="p-0 font-outfit text-[0.75em] font-medium tracking-[0.14em] text-[#131111] uppercase">
                Engraving
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

            <SwatchGroup legend="Lettering" name="font" value={config.font} options={fontOptions} onChange={(v) => set("font", v)} />
          </div>
          {product ? (
            <p className="mt-[2em] mb-0 font-outfit text-[0.8125em] leading-[1.45] text-[#6B635C]">
              Need a logo or a freeform layout?{" "}
              <Link
                href={`/customize/${product.id}/2d${variant ? `?variant=${encodeURIComponent(variant.id)}` : ""}`}
                className="text-[#131111] underline underline-offset-[0.2em]"
              >
                Open the layout editor
              </Link>
            </p>
          ) : null}
        </div>

        <div className="sticky bottom-0 border-t border-[#131111]/10 bg-[#FBFBF7] px-[clamp(1.25rem,2.5vw,2.25em)] py-[1.1em]">
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
