import { test, expect, type Page } from "@playwright/test"
import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Logic-layer shop/cart/PDP verification.
 * E2E_BASE_URL=http://localhost:3000 pnpm exec playwright test e2e/logic-layer-shop.spec.ts --project=chromium --workers=1
 */
const REPORT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../.tmp/logic-layer-review"
)
const SCREENSHOT_DIR = path.join(REPORT_DIR, "screenshots")

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true })
}

async function clearCartStorage(page: Page) {
  await page.addInitScript(() => {
    try {
      if (sessionStorage.getItem("__lc_e2e_cart_cleared")) return
      localStorage.removeItem("lc_cart_id")
      sessionStorage.setItem("__lc_e2e_cart_cleared", "1")
    } catch {
      /* ignore */
    }
  })
}

function pdpAtc(page: Page) {
  return page.locator(".pdp-buy-row button.pdp-atc")
}

async function openPdp(page: Page, handle = "achievement-statuette") {
  await page.goto(`/products/${handle}`, { waitUntil: "domcontentloaded" })
  await expect(page).toHaveURL(new RegExp(`/products/${handle}`))
  await expect(pdpAtc(page)).toBeVisible({ timeout: 20_000 })
  // Cart init is best-effort — ATC/ensureCart will create if missing
  await page.waitForTimeout(800)
}

async function addToCartOpenDrawer(page: Page) {
  const atc = pdpAtc(page)
  await expect(atc).toBeEnabled()
  await atc.click()
  const drawer = page.getByRole("dialog", { name: /shopping cart/i })
  await expect(drawer).toBeVisible({ timeout: 25_000 })
  await expect(drawer.getByRole("button", { name: /increase quantity/i }).first()).toBeVisible({
    timeout: 10_000,
  })
  return drawer
}

test.describe("logic-layer shop/cart/PDP", () => {
  test.describe.configure({ timeout: 90_000 })

  test("1. /shop loads products with priced cards", async ({ page }) => {
    await page.goto("/shop", { waitUntil: "domcontentloaded" })
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 20_000 })
    const priced =
      (await page.getByText(/From\s*₹/).count()) +
      (await page.locator("main").getByText(/₹\s*[\d,]+/).count())
    if (priced === 0) await shot(page, "fail-shop-no-prices")
    expect(priced).toBeGreaterThan(0)
  })

  test("2-4. PDP ATC, drawer pending, cart page pending", async ({ page }) => {
    await clearCartStorage(page)
    await openPdp(page)

    const label = ((await pdpAtc(page).textContent()) ?? "").trim()
    if (/out of stock/i.test(label) || (await pdpAtc(page).isDisabled())) {
      test.info().annotations.push({ type: "note", description: "N/A OOS" })
      return
    }

    const drawer = await addToCartOpenDrawer(page)

    await page.route(/\/store\/carts\/[^/]+\/line-items\/[^/?]+/, async (route) => {
      await new Promise((r) => setTimeout(r, 800))
      await route.continue()
    })

    const drawerInc = drawer.getByRole("button", { name: /increase quantity/i }).first()
    await drawerInc.click()
    await expect(drawerInc).toBeDisabled({ timeout: 2_000 })
    await expect(drawerInc).toBeEnabled({ timeout: 15_000 })

    await drawer.getByRole("button", { name: /close cart/i }).click()
    await page.goto("/cart", { waitUntil: "domcontentloaded" })
    const cartInc = page.getByRole("button", { name: /increase quantity/i }).first()
    await expect(cartInc).toBeVisible({ timeout: 25_000 })
    const before = await page.locator('[aria-live="polite"]').first().textContent()
    await cartInc.click()
    await expect(cartInc).toBeDisabled({ timeout: 2_000 })
    await expect(cartInc).toBeEnabled({ timeout: 15_000 })
    const after = await page.locator('[aria-live="polite"]').first().textContent()
    expect(Number(after)).toBeGreaterThanOrEqual(Number(before ?? "1"))
  })

  test("5. Double-click ATC keeps single lc_cart_id", async ({ page }) => {
    await clearCartStorage(page)
    let creates = 0
    await page.route(/\/store\/carts\/?(\?|$)/, async (route) => {
      if (route.request().method() === "POST") creates += 1
      await route.continue()
    })

    await openPdp(page, "achievement-statuette")
    if (await pdpAtc(page).isDisabled()) {
      test.info().annotations.push({ type: "note", description: "ATC disabled" })
      return
    }

    const idBefore = await page.evaluate(() => localStorage.getItem("lc_cart_id"))
    const beforeCreates = creates
    const atc = pdpAtc(page)
    await Promise.all([atc.click({ force: true }), atc.click({ force: true })])
    await expect(page.getByRole("dialog", { name: /shopping cart/i })).toBeVisible({
      timeout: 25_000,
    })
    const idAfter = await page.evaluate(() => localStorage.getItem("lc_cart_id"))
    expect(idAfter).toBeTruthy()
    expect(idAfter).toBe(idBefore)
    expect(creates - beforeCreates).toBe(0)
  })

  test("6. Customize link includes ?variant=", async ({ page }) => {
    await openPdp(page, "engraved-wooden-plaque")
    const href = await page.getByRole("link", { name: /customize this design/i }).getAttribute("href")
    if (!href?.includes("?variant=")) await shot(page, "fail-customize-missing-variant")
    expect(href).toMatch(/\/customize\/.+\?variant=[^&]+/)
  })

  test("7. OOS ATC or N/A when seed has stock", async ({ page }) => {
    await openPdp(page)
    const atc = pdpAtc(page)
    const label = ((await atc.textContent()) ?? "").trim()
    if (/out of stock/i.test(label)) {
      await expect(atc).toBeDisabled()
    } else {
      test.info().annotations.push({ type: "note", description: `N/A stock; ATC="${label}"` })
    }
  })

  test("8. Cart empty vs with items", async ({ page }) => {
    await clearCartStorage(page)
    await page.goto("/cart", { waitUntil: "domcontentloaded" })
    await expect(page.getByText(/your cart is empty/i).first()).toBeVisible({ timeout: 20_000 })

    await openPdp(page, "ascent-figure-award")
    if (await pdpAtc(page).isDisabled()) {
      test.info().annotations.push({ type: "note", description: "ATC disabled" })
      return
    }
    const drawer = await addToCartOpenDrawer(page)
    await drawer.getByRole("button", { name: /close cart/i }).click()
    await page.goto("/cart", { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("button", { name: /increase quantity/i }).first()).toBeVisible({
      timeout: 25_000,
    })
  })

  test("9. Drawer stepper disabled while pending", async ({ page }) => {
    await clearCartStorage(page)
    await openPdp(page, "ascent-figure-award")
    if (await pdpAtc(page).isDisabled()) {
      test.info().annotations.push({ type: "note", description: "ATC disabled" })
      return
    }

    const drawer = await addToCartOpenDrawer(page)
    await page.route(/\/store\/carts\/[^/]+\/line-items\/[^/?]+/, async (route) => {
      await new Promise((r) => setTimeout(r, 900))
      await route.continue()
    })
    const inc = drawer.getByRole("button", { name: /increase quantity/i }).first()
    const dec = drawer.getByRole("button", { name: /decrease quantity/i }).first()
    await inc.click()
    await expect(inc).toBeDisabled({ timeout: 2_000 })
    await expect(dec).toBeDisabled()
    await expect(inc).toBeEnabled({ timeout: 15_000 })
  })
})
