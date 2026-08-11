"use client"

import { useState } from "react"
import Link from "next/link"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import {
  bulkApi,
  type BulkOrderLineRecord,
  type BulkOrderRecord,
} from "@/lib/bulk-client"

type ProductOption = { id: string; title: string; variantId?: string }

type ParsedRow = { name?: string; designation?: string; award_category?: string }

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

export function BulkOrderWizard({ products }: { products: ProductOption[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [productId, setProductId] = useState(products[0]?.id ?? "")
  const [poNumber, setPoNumber] = useState("")
  const [paymentTerms, setPaymentTerms] = useState<"prepaid" | "net_30" | "net_60">("prepaid")
  const [order, setOrder] = useState<BulkOrderRecord | null>(null)
  const [lines, setLines] = useState<BulkOrderLineRecord[]>([])
  const [summary, setSummary] = useState<{ total: number; valid: number; invalid: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmResult, setConfirmResult] = useState<{ cart_id: string | null; count: number } | null>(null)

  const selected = products.find((p) => p.id === productId)

  async function startOrder() {
    setBusy(true)
    setError(null)
    try {
      const { bulk_order } = await bulkApi.create({
        product_id: productId,
        variant_id: selected?.variantId,
        po_number: poNumber || undefined,
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
      // Server re-parses + re-validates; the client parse is just for UX.
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
      const res = await bulkApi.confirm(order.id)
      setConfirmResult({ cart_id: res.cart_id, count: res.line_item_ids.length })
      setStep(3)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const hasErrors = lines.some((l) => (l.validation_errors?.length ?? 0) > 0)

  return (
    <div className="space-y-8">
      <ol className="flex gap-4 text-sm">
        {["Order details", "Upload & preview", "Confirm"].map((label, i) => (
          <li
            key={label}
            className={
              step === i + 1 ? "font-semibold text-accent" : "text-muted-foreground"
            }
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 1 && (
        <div className="max-w-lg space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Purchase order number (optional)</label>
            <input
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-2026-0042"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Payment terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value as typeof paymentTerms)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="prepaid">Prepaid</option>
              <option value="net_30">Net 30 (verified accounts)</option>
              <option value="net_60">Net 60 (verified accounts)</option>
            </select>
            {paymentTerms !== "prepaid" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Net terms require a verified corporate account and are subject to your credit limit.
              </p>
            )}
          </div>
          <Button onClick={startOrder} disabled={busy || !productId}>
            {busy ? "Starting…" : "Continue"}
          </Button>
        </div>
      )}

      {step === 2 && order && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border p-6">
            <label className="cursor-pointer rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:opacity-90">
              {busy ? "Processing…" : "Upload .xlsx / .csv"}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="hidden" disabled={busy} />
            </label>
            <p className="text-sm text-muted-foreground">
              Columns: <code>name</code>, <code>designation</code>, <code>award_category</code>.
            </p>
          </div>

          {summary && (
            <div className="flex gap-6 text-sm">
              <span>Total rows: <strong>{summary.total}</strong></span>
              <span className="text-success">Valid: <strong>{summary.valid}</strong></span>
              <span className="text-destructive">With errors: <strong>{summary.invalid}</strong></span>
            </div>
          )}

          {lines.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Designation</th>
                    <th className="px-3 py-2">Award</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => {
                    const errs = l.validation_errors ?? []
                    return (
                      <tr key={l.id} className="border-t border-border">
                        <td className="px-3 py-2">{l.row_number}</td>
                        <td className="px-3 py-2">{l.name || <span className="text-destructive">—</span>}</td>
                        <td className="px-3 py-2">{l.designation ?? "—"}</td>
                        <td className="px-3 py-2">{l.award_category ?? "—"}</td>
                        <td className="px-3 py-2">
                          {errs.length === 0 ? (
                            <span className="text-success">OK</span>
                          ) : (
                            <span className="text-destructive">{errs.map((e) => e.issue).join("; ")}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {lines.length > 0 && (
            <div className="flex items-center gap-3">
              <Button onClick={confirm} disabled={busy || hasErrors} variant="accent">
                {busy ? "Generating…" : `Generate ${summary?.valid ?? 0} designs & add to cart`}
              </Button>
              {hasErrors && (
                <span className="text-sm text-muted-foreground">Fix all errors before confirming.</span>
              )}
            </div>
          )}
        </div>
      )}

      {step === 3 && confirmResult && (
        <div className="max-w-lg space-y-4 rounded-lg border border-border p-6">
          <h2 className="font-serif text-2xl">Bulk order ready</h2>
          <p className="text-sm text-muted-foreground">
            {confirmResult.count > 0
              ? `${confirmResult.count} personalized designs were generated and added to your cart.`
              : "Your designs were generated. Review them in your gallery, then proceed to checkout."}
          </p>
          <div className="flex gap-3">
            <Link
              href="/cart"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Go to cart
            </Link>
            <Link href="/account/corporate" className="rounded-md border px-5 py-2.5 text-sm hover:bg-muted">
              Corporate dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
