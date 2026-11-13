"use client"

import { useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import type { Material3D } from "@trophy-heaven/schemas"
import { Button } from "@/components/ui/button"
import { Viewer3D } from "./viewer-3d"
import { useCartStore } from "@/stores/cart-store"
import { designApi, type DesignRecord } from "@/lib/design-client"
import { ENGRAVING_FONTS } from "@/lib/fonts"
import { isAllowedLogo, sanitizeSvg } from "@/lib/sanitize"
import {
  TROPHY_BASES,
  MATERIAL_3D_OPTIONS,
  buildDesign3DState,
  editorValuesFromState,
  validateDesign3D,
  material3DTo2D,
  type Editor3DValues,
} from "@/lib/design-3d"
import type { Design3DState } from "@trophy-heaven/schemas"
import { cn } from "@/lib/utils"
import { cheapestInStockVariant } from "@/lib/product-filters"
import { cartLinePreviewUrl } from "@/lib/cart-line"

const DEFAULT_VALUES: Editor3DValues = {
  baseModelId: TROPHY_BASES[0].id,
  material: "polished_gold",
  environment: "studio",
  engravingText: "",
  engravingFont: "Cinzel",
  logoUrl: null,
  lod: "auto",
}

export function Editor3D({
  product,
  initialDesign,
  preferredVariantId,
}: {
  product: HttpTypes.StoreProduct
  initialDesign?: DesignRecord | null
  preferredVariantId?: string
}) {
  const addItem = useCartStore((s) => s.addItem)
  const variantId =
    product.variants?.find((v) => v.id === preferredVariantId)?.id ??
    cheapestInStockVariant(product)?.id

  const [values, setValues] = useState<Editor3DValues>(() =>
    initialDesign?.state_json
      ? editorValuesFromState(initialDesign.state_json as Design3DState)
      : DEFAULT_VALUES
  )
  const [name, setName] = useState(initialDesign?.name ?? "My 3D trophy")
  const [designId, setDesignId] = useState<string | null>(initialDesign?.id ?? null)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  function patch(p: Partial<Editor3DValues>) {
    setValues((v) => ({ ...v, ...p }))
  }

  async function onUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isAllowedLogo(file)) {
      setErrors(["Unsupported file type. Upload a PNG, JPG, or SVG."])
      e.target.value = ""
      return
    }
    let url: string
    if (file.type === "image/svg+xml") {
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
    patch({ logoUrl: url })
    e.target.value = ""
  }

  async function handleSave(): Promise<DesignRecord | null> {
    const state = buildDesign3DState(values)
    const validation = validateDesign3D(state)
    setErrors(validation)
    if (validation.length) return null
    setSaving(true)
    try {
      let record: DesignRecord
      if (designId) {
        record = (await designApi.update(designId, { name, state_json: state })).design
      } else {
        record = (
          await designApi.create({
            name,
            mode: "3d",
            product_id: product.id,
            variant_id: variantId,
            state_json: state,
          })
        ).design
        setDesignId(record.id)
      }
      setMsg("Saved to your gallery")
      setTimeout(() => setMsg(null), 2500)
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
      preview_url: cartLinePreviewUrl(screenshot) ?? record.preview_url,
      customization_mode: "3d",
    })
    setMsg("Added to cart with your 3D design")
    setTimeout(() => setMsg(null), 2500)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        <Viewer3D values={values} onScreenshot={setScreenshot} />
        {screenshot && (
          <div className="flex items-center gap-3 rounded-md border border-border p-2">
            <img src={screenshot} alt="Captured preview" className="h-16 w-16 rounded object-cover" />
            <span className="text-xs text-[#6B635C]">
              Screenshot captured — it will be used as the cart preview.
            </span>
          </div>
        )}
        <p className="text-xs text-[#6B635C]">
          Drag to orbit, scroll to zoom. On touch devices use one finger to rotate, two to zoom.
          A 2D equivalent (material: {material3DTo2D(values.material)}) is available at{" "}
          <Link href={`/customize/${product.id}/2d`} className="text-[#131111] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
            the 2D editor
          </Link>
          .
        </p>
      </div>

      <aside className="space-y-6 rounded-lg border border-border bg-card p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Design name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Base</p>
          <div className="grid grid-cols-2 gap-2">
            {TROPHY_BASES.map((b) => (
              <button
                key={b.id}
                onClick={() => patch({ baseModelId: b.id })}
                className={cn(
                  "rounded-md border px-2 py-2 text-xs text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
                  values.baseModelId === b.id ? "border-accent ring-2 ring-accent" : "border-border"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Material</p>
          <div className="grid grid-cols-3 gap-2">
            {MATERIAL_3D_OPTIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => patch({ material: m.value as Material3D })}
                className={cn(
                  "rounded-md border p-1.5 text-[11px] text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
                  values.material === m.value ? "border-accent ring-2 ring-accent" : "border-border"
                )}
              >
                <span className="mb-1 block h-5 w-full rounded" style={{ backgroundColor: m.color }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Engraving</label>
          <input
            value={values.engravingText}
            onChange={(e) => patch({ engravingText: e.target.value })}
            placeholder="e.g. Employee of the Year 2026"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          />
          <select
            value={values.engravingFont}
            onChange={(e) => patch({ engravingFont: e.target.value })}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {ENGRAVING_FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Logo</p>
          <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-border px-3 py-3 text-sm text-[#6B635C] hover:bg-muted">
            Upload logo
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={onUploadLogo} className="hidden" />
          </label>
          {values.logoUrl && (
            <button type="button" onClick={() => patch({ logoUrl: null })} className="mt-1 text-xs text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
              Remove logo
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Environment</label>
            <select
              value={values.environment}
              onChange={(e) => patch({ environment: e.target.value as "studio" | "none" })}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            >
              <option value="studio">Studio HDRI</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quality</label>
            <select
              value={values.lod}
              onChange={(e) => patch({ lod: e.target.value as Editor3DValues["lod"] })}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            >
              <option value="auto">Auto</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {errors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        )}
        {msg && (
          <p className="rounded-md bg-accent/10 px-3 py-2 text-center text-sm text-accent-foreground">{msg}</p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:outline-solid" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="accent" className="flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:outline-solid" onClick={handleAddToCart} disabled={saving || !variantId}>
            Add to cart
          </Button>
        </div>
      </aside>
    </div>
  )
}
