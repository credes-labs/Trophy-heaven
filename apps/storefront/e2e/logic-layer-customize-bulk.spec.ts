import { test, expect } from "@playwright/test"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Logic-layer verification for customize 2D/3D cart metadata + bulk adoptCart.
 * Requires seeded Medusa (:9000) + storefront (:3000).
 * Screenshots land under test-results on failure.
 */
const FIXTURES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../.tmp/logic-layer-review/fixtures"
)

test.describe("logic-layer customize + bulk", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 })

  test("2D customize: variant query, owner token, server preview_url", async ({ page }) => {
    await page.goto("/products/engraved-wooden-plaque")
    const customize = page.getByRole("link", { name: "Customize this design" })
    await expect(customize).toBeVisible()
    const href = await customize.getAttribute("href")
    expect(href).toMatch(/\/customize\/[^/]+\/2d\?variant=/)
    const variantFromUrl = new URL(href!, "http://localhost:3000").searchParams.get("variant")
    expect(variantFromUrl).toBeTruthy()

    await customize.click()
    await expect(page.getByRole("heading", { name: /Design your Engraved Wooden Plaque/i })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`variant=${variantFromUrl}`))

    await page.getByRole("button", { name: "Add text" }).click()
    await expect(page.getByRole("button", { name: /Text:/i })).toBeVisible()

    const designPost = page.waitForResponse(
      (r) => r.url().includes("/store/designs") && r.request().method() === "POST" && r.status() === 201
    )
    await page.getByRole("button", { name: "Save" }).click()
    await designPost

    const tokens = await page.evaluate(() => {
      const raw = localStorage.getItem("lc_design_owner_tokens")
      return raw ? (JSON.parse(raw) as Record<string, string>) : {}
    })
    expect(Object.keys(tokens).length).toBeGreaterThan(0)

    const lineItem = page.waitForResponse(
      (r) => r.url().includes("/line-items") && r.request().method() === "POST" && r.ok()
    )
    await page.getByRole("button", { name: "Add to cart" }).click()
    const res = await lineItem
    const body = res.request().postDataJSON() as {
      variant_id: string
      metadata?: { preview_url?: string | null; design_id?: string; customization_mode?: string }
    }
    expect(body.variant_id).toBe(variantFromUrl)
    expect(body.metadata?.design_id).toBeTruthy()
    expect(body.metadata?.customization_mode).toBe("2d")
    const preview = body.metadata?.preview_url
    expect(preview == null || !String(preview).startsWith("data:")).toBeTruthy()
    if (preview) expect(String(preview)).toMatch(/^https?:\/\//)
  })

  test("3D customize: drops data: screenshot from cart metadata (H3)", () => {
    test.skip(true, "Crystal Star Award (full_3d flagship) was retired from the catalog")
  })

  test("bulk wizard loads; guest continue requires auth", async ({ page }) => {
    await page.goto("/corporate/bulk")
    await expect(page.getByRole("heading", { name: "Bulk order" })).toBeVisible()
    await expect(page.getByText("1. Order details")).toBeVisible()
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(page.getByText(/Sign in required|Unauthenticated|401|Request failed/i)).toBeVisible({
      timeout: 15_000,
    })
  })

  test("bulk invalid rows surface errors; confirm merges prior cart (H4)", async ({ page }) => {
    test.skip(
      !process.env.E2E_BULK_EMAIL || !process.env.E2E_BULK_PASSWORD,
      "Set E2E_BULK_EMAIL / E2E_BULK_PASSWORD for authenticated bulk merge"
    )

    // Seed a plain shop line before bulk confirm.
    await page.goto("/products/achievement-statuette")
    await page.getByRole("button", { name: "Add to cart" }).first().click()
    await expect(page.getByRole("button", { name: /CART \(\d+\)/i })).toBeVisible()
    const beforeCount = await page.evaluate(() => {
      const m = document.body.innerText.match(/CART \((\d+)\)/i)
      return m ? Number(m[1]) : 0
    })
    expect(beforeCount).toBeGreaterThan(0)

    await page.goto("/account/login")
    await page.getByRole("textbox", { name: "Email" }).fill(process.env.E2E_BULK_EMAIL!)
    await page.getByRole("textbox", { name: "Password" }).fill(process.env.E2E_BULK_PASSWORD!)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/account/, { timeout: 30_000 })

    await page.goto("/corporate/bulk")
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(page.getByText("2. Upload & preview")).toBeVisible()

    // Invalid upload first
    await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, "bulk-invalid.csv"))
    await expect(page.getByText(/With errors/i)).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole("button", { name: /Generate .* designs? & add to cart/i })).toBeDisabled()

    // Valid upload then confirm
    await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, "bulk-valid.csv"))
    await expect(page.getByText(/With errors:\s*0/i)).toBeVisible({ timeout: 30_000 })
    const confirmBtn = page.getByRole("button", { name: /Generate .* designs? & add to cart/i })
    await expect(confirmBtn).toBeEnabled()
    await confirmBtn.click()
    await expect(page.getByRole("heading", { name: /Bulk order ready/i })).toBeVisible({
      timeout: 90_000,
    })

    await page.goto("/cart")
    // Prior shop item(s) should still be present after adoptCart merge.
    await expect(page.getByText(/Achievement Statuette/i).first()).toBeVisible()
    const afterCount = await page.evaluate(() => {
      const m = document.body.innerText.match(/CART \((\d+)\)/i)
      return m ? Number(m[1]) : 0
    })
    expect(afterCount).toBeGreaterThan(beforeCount)
  })
})
