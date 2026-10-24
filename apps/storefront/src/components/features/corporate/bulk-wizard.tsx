"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import * as XLSX from "xlsx"
import {
  EditorialCtaButton,
  EditorialCtaLink,
  EditorialTextLink,
  editorialFieldClass,
  editorialLabelClass,
} from "@/components/layout/editorial/editorial-cta"
import {
  bulkApi,
  corporateApi,
  type BulkOrderLineRecord,
  type BulkOrderRecord,
  type CorporateProfileRecord,
} from "@/lib/bulk-client"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)

type ProductOption = { id: string; title: string; variantId?: string }

type ParsedRow = { name?: string; designation?: string; award_category?: string }

type PaymentTerms = "prepaid" | "net_30" | "net_60"

/** Maps common header variants to our canonical fields. */
function normalizeRow(row: Record<string, unknown>): ParsedRow {
  const lower: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) lower[k.trim().toLowerCase()] = v
  const pick = (...keys: string[]) => {
    for (const k of keys) if (lower[k] != null && String(lower[k]).trim() !== "") return String(lower[k]).trim()
    return undefined
  }
  return {
    name: pick("name", "recipient", "full name", "employee name"),
    designation: pick("designation", "title", "role", "position"),
    award_category: pick("award_category", "award category", "award", "category"),
  }
}

function allowedTerms(profile: CorporateProfileRecord | null): PaymentTerms[] {
  if (!profile?.is_verified || profile.payment_terms === "prepaid") return ["prepaid"]
  if (profile.payment_terms === "net_60") return ["prepaid", "net_30", "net_60"]
  return ["prepaid", "net_30"]
}

export function BulkOrderWizard({ products }: { products: ProductOption[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [productId, setProductId] = useState(products[0]?.id ?? "")
  const [poNumber, setPoNumber] = useState("")
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>("prepaid")
  const [profile, setProfile] = useState<CorporateProfileRecord | null>(null)
  const [order, setOrder] = useState<BulkOrderRecord | null>(null)
  const [lines, setLines] = useState<BulkOrderLineRecord[]>([])
  const [summary, setSummary] = useState<{ total: number; valid: number; invalid: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmResult, setConfirmResult] = useState<{
    cart_id: string | null
    count: number
    payment_terms: PaymentTerms
    net_terms: boolean
  } | null>(null)

  const selected = products.find((p) => p.id === productId)
  const termsOptions = allowedTerms(profile)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { corporate_profiles } = await corporateApi.list()
        if (!cancelled) setProfile(corporate_profiles[0] ?? null)
      } catch {
        if (!cancelled) setProfile(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!termsOptions.includes(paymentTerms)) setPaymentTerms("prepaid")
  }, [termsOptions, paymentTerms])

  async function startOrder() {
    setBusy(true)
    setError(null)
    try {
      if (paymentTerms !== "prepaid" && !profile) {
        throw new Error("Create a corporate profile before requesting net terms.")
      }
      if (paymentTerms !== "prepaid" && !poNumber.trim()) {
        throw new Error("A purchase order number is required for net-terms orders.")
      }
      const { bulk_order } = await bulkApi.create({
        product_id: productId,
        variant_id: selected?.variantId,
        po_number: poNumber || undefined,
        corporate_profile_id: profile?.id,
      })
      setOrder(bulk_order)
      setStep(2)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !order) return
    setBusy(true)
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
      const rows = json.map(normalizeRow)
      const result = await bulkApi.upload(order.id, rows)
      setLines(result.lines)
      setSummary(result.parsed)
    } catch (err) {
      setError((err as Error).message || "Could not read that file.")
    } finally {
      setBusy(false)
      e.target.value = ""
    }
  }

  async function confirm() {
    if (!order) return
    setBusy(true)
    setError(null)
    try {
      const res = await bulkApi.confirm(order.id, { payment_terms: paymentTerms })
      if (res.cart_id) {
        const previous = useCartStore.getState().cart
        await useCartStore.getState().adoptCart(res.cart_id, previous)
      }
      setConfirmResult({
        cart_id: res.cart_id,
        count: res.line_item_ids.length,
        payment_terms: res.payment_terms,
        net_terms: res.net_terms,
      })
      setStep(3)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const hasErrors = lines.some((l) => (l.validation_errors?.length ?? 0) > 0)

  return (
    <div>
      <ol className="m-0 flex flex-wrap gap-x-[1.75em] gap-y-[0.5em] p-0">
        {["Order details", "Upload & preview", "Confirm"].map((label, i) => (
          <li
            key={label}
            className={cn(
              "list-none font-outfit text-[0.875em] leading-[1.25em] tracking-[-0.02em] uppercase",
              step === i + 1 ? "text-[#131111] underline underline-offset-[0.2em]" : "text-[#6B635C]"
            )}
          >
            {String(i + 1).padStart(2, "0")} / {label}
          </li>
        ))}
      </ol>

      {error ? (
        <p className="mt-[1.5em] m-0 font-outfit text-[0.875em] text-[#8A2D25]" role="alert">
          {error}
        </p>
      ) : null}

      {step === 1 && (
        <div className="mt-[2em] max-w-[32em] space-y-[1.75em]">
          {!profile ? (
            <p className="m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
              No corporate profile yet — prepaid checkout only.{" "}
              <Link
                href="/account/corporate"
                className="text-[#131111] uppercase underline underline-offset-[0.15em]"
              >
                Create one
              </Link>{" "}
              to unlock net terms after verification.
            </p>
          ) : null}
          {profile && !profile.is_verified ? (
            <p className="m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
              {profile.company_name} is pending verification. Net terms unlock after an admin
              verifies the account.
            </p>
          ) : null}
          <div>
            <label htmlFor="bulk-product" className={editorialLabelClass}>
              Product
            </label>
            <select
              id="bulk-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={fieldClass}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bulk-po" className={editorialLabelClass}>
              Purchase order number{paymentTerms !== "prepaid" ? " (required)" : " (optional)"}
            </label>
            <input
              id="bulk-po"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-2026-0042"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="bulk-terms" className={editorialLabelClass}>
              Payment terms
            </label>
            <select
              id="bulk-terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
              className={fieldClass}
            >
              {termsOptions.map((t) => (
                <option key={t} value={t}>
                  {t === "prepaid" ? "Prepaid" : t === "net_30" ? "Net 30" : "Net 60"}
                </option>
              ))}
            </select>
            {paymentTerms !== "prepaid" ? (
              <p className="mt-[0.75em] m-0 font-outfit text-[0.875em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
                Billed to {profile?.company_name ?? "your corporate account"} against your credit
                limit. PO number required.
              </p>
            ) : null}
          </div>
          <EditorialCtaButton type="button" disabled={busy || !productId} onClick={() => void startOrder()}>
            {busy ? "Starting" : "Continue"}
          </EditorialCtaButton>
        </div>
      )}

      {step === 2 && order ? (
        <div className="mt-[2em]">
          <div className="flex flex-wrap items-center gap-[1.5em] border-y border-[#CDCDCD] py-[1.75em]">
            <label className="inline-flex h-[3.875em] w-[19.5em] max-w-full cursor-pointer items-center justify-center gap-[1.25em] rounded-full bg-[#131111] py-[0.625em] pr-[0.625em] pl-[0.5em] font-outfit text-[1em] leading-[1.25em] font-light tracking-[-0.02em] text-[#F2F1EF] uppercase">
              <span className="size-[0.5em] shrink-0 rounded-full bg-[#F2F1EF]" aria-hidden />
              {busy ? "Processing" : "Upload .xlsx / .csv"}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="hidden" disabled={busy} />
            </label>
            <p className="m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
              Columns: name, designation, award_category.
            </p>
          </div>

          {summary ? (
            <p className="mt-[1.5em] m-0 flex flex-wrap gap-x-[1.75em] font-outfit text-[0.875em] tracking-[-0.02em] uppercase text-[#131111]/70">
              <span>Total {summary.total}</span>
              <span>Valid {summary.valid}</span>
              <span className={summary.invalid > 0 ? "text-[#8A2D25]" : undefined}>
                Errors {summary.invalid}
              </span>
            </p>
          ) : null}

          {lines.length > 0 ? (
            <div className="mt-[1.5em] overflow-x-auto">
              <table className="w-full border-y border-[#CDCDCD] text-left font-outfit text-[1em] tracking-[-0.02em]">
                <thead>
                  <tr className="border-b border-[#CDCDCD]">
                    <th className="py-[0.85em] pr-[1em] font-normal uppercase">#</th>
                    <th className="py-[0.85em] pr-[1em] font-normal uppercase">Name</th>
                    <th className="py-[0.85em] pr-[1em] font-normal uppercase">Designation</th>
                    <th className="py-[0.85em] pr-[1em] font-normal uppercase">Award</th>
                    <th className="py-[0.85em] font-normal uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => {
                    const errs = l.validation_errors ?? []
                    return (
                      <tr key={l.id} className="border-b border-[#CDCDCD]">
                        <td className="py-[0.85em] pr-[1em]">{l.row_number}</td>
                        <td className="py-[0.85em] pr-[1em]">
                          {l.name || <span className="text-[#8A2D25]">—</span>}
                        </td>
                        <td className="py-[0.85em] pr-[1em]">{l.designation ?? "—"}</td>
                        <td className="py-[0.85em] pr-[1em]">{l.award_category ?? "—"}</td>
                        <td className="py-[0.85em]">
                          {errs.length === 0 ? (
                            <span>OK</span>
                          ) : (
                            <span className="text-[#8A2D25]">{errs.map((e) => e.issue).join("; ")}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {lines.length > 0 ? (
            <div className="mt-[2em] flex flex-col items-start gap-[1em]">
              <EditorialCtaButton type="button" disabled={busy || hasErrors} onClick={() => void confirm()}>
                {busy ? "Generating" : "Generate designs"}
              </EditorialCtaButton>
              {hasErrors ? (
                <p className="m-0 font-outfit text-[0.875em] text-[#6B635C]">
                  Fix all errors before confirming.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 3 && confirmResult ? (
        <div className="mt-[2em] max-w-[32em]">
          <h2 className="m-0 font-outfit text-[clamp(1.75rem,3vw,2.5em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance text-[#131111]">
            Bulk order ready
          </h2>
          <p className="mt-[1em] m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
            {confirmResult.count > 0
              ? `${confirmResult.count} personalized designs were generated and added to your cart.`
              : "Your designs were generated. Review them in your gallery, then proceed to checkout."}
          </p>
          {confirmResult.net_terms ? (
            <p className="mt-[1em] m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
              Payment: {confirmResult.payment_terms === "net_30" ? "Net 30" : "Net 60"} — billed to
              your corporate account (no prepaid gateway).
            </p>
          ) : null}
          <div className="mt-[1.75em] flex flex-col items-start gap-[1.25em]">
            <EditorialCtaLink href="/checkout">
              {confirmResult.net_terms ? "Checkout on account" : "Go to checkout"}
            </EditorialCtaLink>
            <EditorialTextLink href="/cart">Review cart →</EditorialTextLink>
            <EditorialTextLink href="/account/corporate">Corporate dashboard →</EditorialTextLink>
          </div>
        </div>
      ) : null}
    </div>
  )
}
