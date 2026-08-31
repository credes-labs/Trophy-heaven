import { test, expect, type Page } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Cart, checkout, and account verification (independent of full-verify-storefront).
 * Run:
 *   pnpm exec playwright test e2e/full-verify-cart-checkout-account.spec.ts \
 *     --project=chromium --workers=1
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const VERIFY_DIR = path.join(ROOT, ".tmp/full-verify")
const SCREENSHOT_DIR = path.join(VERIFY_DIR, "screenshots")
const REPORT_PATH = path.join(VERIFY_DIR, "08-pw-cart-checkout-account.md")
const RESULTS_JSON = path.join(VERIFY_DIR, "08-playwright-results.json")

const PASSWORD = "TestPass123!"
const BASE = process.env.E2E_BASE_URL || "http://localhost:3000"

type FlowResult = {
  id: string
  name: string
  status: "PASS" | "FAIL"
  screenshots: string[]
  notes?: string
}

const flowResults: FlowResult[] = []

function record(
  id: string,
  name: string,
  status: "PASS" | "FAIL",
  screenshots: string[],
  notes?: string
) {
  flowResults.push({ id, name, status, screenshots, notes })
}

async function shot(page: Page, filename: string): Promise<string> {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  const full = path.join(SCREENSHOT_DIR, filename)
  await page.screenshot({ path: full, fullPage: true })
  return filename
}

async function clearCartStorage(page: Page): Promise<void> {
  await page.goto("/")
  await page.evaluate(() => {
    try {
      localStorage.removeItem("lc_cart_id")
    } catch {
      /* restricted origin */
    }
  })
}

async function cartItemCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const btn = document.querySelector('[aria-label^="Open cart"]')
    const label = btn?.getAttribute("aria-label") ?? ""
    const fromAria = label.match(/(\d+)\s+item/)
    if (fromAria) return Number(fromAria[1])
    const text = btn?.textContent ?? ""
    const fromText = text.match(/CART\s*\((\d+)\)/i)
    return fromText ? Number(fromText[1]) : 0
  })
}

async function addProductFromPdp(page: Page, handle = "oak-side-table"): Promise<void> {
  await page.goto(`/products/${handle}`)
  await expect(page.getByRole("heading", { name: new RegExp(handle.replace(/-/g, " "), "i") })).toBeVisible({
    timeout: 20_000,
  })

  const sizeM = page.getByRole("button", { name: /M \(8/i })
  if (await sizeM.isVisible().catch(() => false)) await sizeM.click()

  const atc = page.locator(".pdp-buy-row").getByRole("button", { name: /^add to cart$/i })
  await expect(atc).toBeEnabled({ timeout: 15_000 })
  const before = await cartItemCount(page)
  await atc.click()
  await expect
    .poll(async () => cartItemCount(page), { timeout: 30_000 })
    .toBeGreaterThan(before)
}

async function ensureCheckoutAuth(page: Page, email: string): Promise<void> {
  const gate = page.getByRole("heading", { name: /sign in to continue/i })
  if (!(await gate.isVisible().catch(() => false))) return
  await page.getByRole("link", { name: /create an account/i }).click()
  await expect(page).toHaveURL(/\/account\/register/)
  await page.getByLabel(/First name/i).fill("Asha")
  await page.getByLabel(/Last name/i).fill("Verma")
  await page.getByLabel(/^Email$/i).fill(email)
  await page.getByLabel(/^Password$/i).fill(PASSWORD)
  await page.getByLabel(/Confirm password/i).fill(PASSWORD)
  await page.getByRole("checkbox").check()
  await page.getByRole("button", { name: /create account/i }).click()
  await expect(page).toHaveURL(/\/checkout/, { timeout: 30_000 })
  await expect(page.getByRole("heading", { name: /delivery address/i })).toBeVisible({
    timeout: 20_000,
  })
}

async function fillCheckoutAddress(page: Page, email: string): Promise<void> {
  await ensureCheckoutAuth(page, email)
  const addNew = page.getByRole("button", { name: /add a new address/i })
  if (await addNew.isVisible().catch(() => false)) await addNew.click()
  await page.getByLabel(/^Pincode/i).fill("400001")
  await page.getByLabel(/^City/i).fill("Mumbai")
  await page.getByLabel(/^State/i).fill("Maharashtra")
  await page.getByLabel(/Flat, House no/i).fill("12 MG Road")
  await page.getByLabel(/Apartment, Area/i).fill("Fort")
  await page.getByLabel(/Full Name/i).fill("Asha Verma")
  await page.getByLabel(/Email Address/i).fill(email)
  await page.getByLabel(/^Phone$/i).fill("9876543210")
  await page.getByRole("button", { name: /^continue$/i }).click()
}

async function registerWithRetry(page: Page, email: string): Promise<void> {
  await page.goto("/account/register")
  await page.getByLabel(/First name/i).fill("E2E")
  await page.getByLabel(/Last name/i).fill("CartVerify")
  await page.getByLabel(/^Email$/i).fill(email)
  await page.getByLabel(/^Password$/i).fill(PASSWORD)
  await page.getByLabel(/Confirm password/i).fill(PASSWORD)
  await page.getByRole("checkbox").check()

  for (let attempt = 0; attempt < 4; attempt++) {
    await page.getByRole("button", { name: /create account/i }).click()
    try {
      await expect(page).toHaveURL(/\/account(?!\/(register|login))/, { timeout: 20_000 })
      return
    } catch {
      const errText = await page
        .locator(".text-destructive, [class*='destructive']")
        .first()
        .textContent()
        .catch(() => null)
      if (errText && /too many requests/i.test(errText) && attempt < 3) {
        await page.waitForTimeout(65_000)
        continue
      }
      if (errText) throw new Error(`Register failed: ${errText}`)
      throw new Error("Register did not navigate to /account")
    }
  }
}

async function loginWithRetry(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/account/login")
  await page.getByLabel(/^Email$/i).fill(email)
  await page.getByLabel(/^Password$/i).fill(password)

  for (let attempt = 0; attempt < 4; attempt++) {
    await page.getByRole("button", { name: /sign in/i }).click()
    try {
      await expect(page).toHaveURL(/\/account(?!\/login)/, { timeout: 20_000 })
      return
    } catch {
      const errText = await page
        .locator(".text-destructive, [class*='destructive']")
        .first()
        .textContent()
        .catch(() => null)
      if (errText && /too many requests/i.test(errText) && attempt < 3) {
        await page.waitForTimeout(65_000)
        continue
      }
      if (errText) throw new Error(`Login failed: ${errText}`)
      throw new Error("Login did not leave /account/login")
    }
  }
}

async function logoutIfNeeded(page: Page): Promise<void> {
  await page.goto("/account")
  await page.waitForFunction(
    () =>
      location.pathname.includes("/login") ||
      Array.from(document.querySelectorAll("button")).some((b) =>
        /logout/i.test(b.textContent ?? "")
      ),
    { timeout: 25_000 }
  )
  if (/\/account\/login/.test(page.url())) return

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /^\s*Logout\s*$/i.test(b.textContent ?? "")
    )
    ;(btn as HTMLButtonElement | undefined)?.click()
  })

  try {
    await expect(page).toHaveURL(/\/account\/login/, { timeout: 10_000 })
  } catch {
    await page.evaluate(() => {
      for (const k of Object.keys(localStorage)) {
        if (/medusa|auth|token|jwt/i.test(k)) localStorage.removeItem(k)
      }
    })
    await page.goto("/account/login")
  }
}

function writeReport() {
  const pass = flowResults.filter((r) => r.status === "PASS").length
  const fail = flowResults.filter((r) => r.status === "FAIL").length
  const screenshotCount = flowResults.reduce((n, r) => n + r.screenshots.length, 0)

  const lines = [
    "# Playwright cart / checkout / account verification",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Base:** ${BASE}`,
    `**Medusa:** http://localhost:9000`,
    `**Spec:** \`apps/storefront/e2e/full-verify-cart-checkout-account.spec.ts\``,
    `**Workers:** 1 (serial)`,
    "",
    "## Summary",
    "",
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Flows PASS | ${pass} |`,
    `| Flows FAIL | ${fail} |`,
    `| Screenshots | ${screenshotCount} |`,
    "",
    "## Flow results",
    "",
    "| ID | Flow | Status | Screenshots | Notes |",
    "|----|------|--------|-------------|-------|",
    ...flowResults.map((r) => {
      const shots = r.screenshots.map((s) => `\`${s}\``).join(", ") || "—"
      const notes = (r.notes ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")
      return `| ${r.id} | ${r.name} | **${r.status}** | ${shots} | ${notes} |`
    }),
    "",
    "## Screenshot index",
    "",
    ...flowResults.flatMap((r) =>
      r.screenshots.map((s) => `- \`screenshots/${s}\` — ${r.id} ${r.name}`)
    ),
    "",
  ]

  fs.mkdirSync(VERIFY_DIR, { recursive: true })
  fs.writeFileSync(REPORT_PATH, lines.join("\n"), "utf8")
  fs.writeFileSync(
    RESULTS_JSON,
    JSON.stringify({ pass, fail, screenshotCount, flowResults }, null, 2),
    "utf8"
  )
}

test.describe("full-verify cart checkout account", () => {
  test.describe.configure({ mode: "serial", timeout: 240_000 })

  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  })

  test.afterAll(() => {
    writeReport()
  })

  test.beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 800))
  })

  test("C08-01 — Guest ATC from PDP → drawer → cart page", async ({ page }) => {
    const shots: string[] = []
    try {
      await clearCartStorage(page)
      await page.goto("/products/oak-side-table")
      await expect(page.getByRole("heading", { name: /champion metal cup/i })).toBeVisible({
        timeout: 20_000,
      })

      const sizeM = page.getByRole("button", { name: /M \(8/i })
      if (await sizeM.isVisible().catch(() => false)) await sizeM.click()

      const atc = page.locator(".pdp-buy-row").getByRole("button", { name: /^add to cart$/i })
      await expect(atc).toBeEnabled({ timeout: 15_000 })
      shots.push(await shot(page, "08-01-guest-atc-pdp-before.png"))

      const before = await cartItemCount(page)
      await atc.click()

      const drawer = page.getByRole("dialog", { name: /shopping cart/i })
      await expect(drawer).toBeVisible({ timeout: 25_000 })
      await expect
        .poll(async () => cartItemCount(page), { timeout: 30_000 })
        .toBeGreaterThan(before)
      shots.push(await shot(page, "08-01-guest-atc-drawer-open.png"))

      await drawer.getByRole("button", { name: /close cart/i }).click().catch(async () => {
        await page.keyboard.press("Escape")
      })

      await page.goto("/cart")
      await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
      await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible()
      await expect(page.getByText(/your cart is empty/i)).toHaveCount(0)
      shots.push(await shot(page, "08-01-guest-atc-cart-page.png"))

      record("C08-01", "Guest ATC → drawer → cart page", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "08-01-guest-atc-FAIL.png").catch(() => "08-01-guest-atc-FAIL.png"))
      record("C08-01", "Guest ATC → drawer → cart page", "FAIL", shots, String(e))
      throw e
    }
  })

  test("C08-02 — Qty stepper disabled while pending", async ({ page }) => {
    const shots: string[] = []
    try {
      await clearCartStorage(page)
      await page.goto("/products/oak-side-table")
      const sizeM = page.getByRole("button", { name: /M \(8/i })
      if (await sizeM.isVisible().catch(() => false)) await sizeM.click()

      const atc = page.locator(".pdp-buy-row").getByRole("button", { name: /^add to cart$/i })
      await expect(atc).toBeEnabled({ timeout: 15_000 })
      await atc.click()

      const drawer = page.getByRole("dialog", { name: /shopping cart/i })
      await expect(drawer).toBeVisible({ timeout: 25_000 })
      shots.push(await shot(page, "08-02-stepper-before.png"))

      await page.route(/\/store\/carts\/[^/]+\/line-items\/[^/?]+/, async (route) => {
        await new Promise((r) => setTimeout(r, 900))
        await route.continue()
      })

      const inc = drawer.getByRole("button", { name: /increase quantity/i }).first()
      const dec = drawer.getByRole("button", { name: /decrease quantity/i }).first()
      await inc.click()
      await expect(inc).toBeDisabled({ timeout: 2_000 })
      await expect(dec).toBeDisabled()
      shots.push(await shot(page, "08-02-stepper-pending-disabled.png"))

      await expect(inc).toBeEnabled({ timeout: 15_000 })
      shots.push(await shot(page, "08-02-stepper-after-update.png"))

      record("C08-02", "Qty stepper pending disabled", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "08-02-stepper-FAIL.png").catch(() => "08-02-stepper-FAIL.png"))
      record("C08-02", "Qty stepper pending disabled", "FAIL", shots, String(e))
      throw e
    }
  })

  test("C08-03 — Empty cart state", async ({ page }) => {
    const shots: string[] = []
    try {
      await clearCartStorage(page)
      await page.goto("/cart")
      await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
      await expect(page.getByText(/your cart is empty/i)).toBeVisible({ timeout: 20_000 })
      shots.push(await shot(page, "08-03-empty-cart-page.png"))

      await page.goto("/checkout")
      await expect(page.getByText(/your cart is empty/i)).toBeVisible({ timeout: 20_000 })
      await expect(page.getByRole("link", { name: /continue shopping/i })).toBeVisible()
      shots.push(await shot(page, "08-03-empty-cart-checkout.png"))

      record("C08-03", "Empty cart state", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "08-03-empty-cart-FAIL.png").catch(() => "08-03-empty-cart-FAIL.png"))
      record("C08-03", "Empty cart state", "FAIL", shots, String(e))
      throw e
    }
  })

  test("C08-04 — Checkout address → delivery → payment → place order", async ({ page }) => {
    const shots: string[] = []
    const email = `c08.checkout.${Date.now()}@example.com`

    try {
      await clearCartStorage(page)
      await addProductFromPdp(page)
      await page.keyboard.press("Escape").catch(() => undefined)

      await page.goto("/checkout")
      await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 20_000 })
      shots.push(await shot(page, "08-04-checkout-address-before.png"))

      await fillCheckoutAddress(page, email)
      await expect(page.getByRole("heading", { name: /select delivery method/i })).toBeVisible({
        timeout: 30_000,
      })
      shots.push(await shot(page, "08-04-checkout-delivery.png"))

      const noShipping = page.getByText(/no shipping options configured/i)
      if (await noShipping.isVisible().catch(() => false)) {
        record("C08-04", "Checkout → place order", "FAIL", shots, "No shipping options configured")
        throw new Error("No shipping options")
      }

      await page.getByRole("button", { name: /continue to payment/i }).click()
      await expect(
        page.getByRole("heading", { name: /payment method|corporate billing/i })
      ).toBeVisible({ timeout: 30_000 })
      shots.push(await shot(page, "08-04-checkout-payment.png"))

      const razorpayLabel = page.getByText(/pay with razorpay/i)
      const codLabel = page.getByText(/cash on delivery/i)
      const razorpayEnabled = await razorpayLabel.isVisible().catch(() => false)

      if (razorpayEnabled) {
        await page.getByRole("button", { name: /continue to review/i }).click()
        await expect(page.getByRole("heading", { name: /review your order/i })).toBeVisible()
        shots.push(await shot(page, "08-04-checkout-review.png"))

        await page.evaluate(() => {
          ;(window as unknown as { Razorpay?: unknown }).Razorpay = undefined
        })
        await page.getByRole("button", { name: /place order|pay with razorpay/i }).click()
        await expect(
          page.getByText(/razorpay checkout could not be opened|no order was placed/i)
        ).toBeVisible({ timeout: 20_000 })
        shots.push(await shot(page, "08-04-checkout-razorpay-blocked.png"))
        record(
          "C08-04",
          "Checkout → place order",
          "PASS",
          shots,
          "Razorpay enabled — stub blocked as expected (no COD path)"
        )
        return
      }

      if (await codLabel.isVisible().catch(() => false)) {
        await codLabel.click()
      }
      await page.getByRole("button", { name: /continue to review/i }).click()
      await expect(page.getByRole("heading", { name: /review your order/i })).toBeVisible()
      shots.push(await shot(page, "08-04-checkout-review.png"))

      await page.getByRole("button", { name: /place order/i }).click()
      const confirmed = page.waitForURL(/\/order\/confirmed\//, { timeout: 60_000 })
      const checkoutError = page
        .locator('[role="alert"].text-destructive, [role="alert"].bg-destructive\\/10, p[role="alert"]')
        .filter({ hasText: /\S/ })
        .first()
      const outcome = await Promise.race([
        confirmed.then(() => "confirmed" as const),
        checkoutError.waitFor({ state: "visible", timeout: 60_000 }).then(() => "error" as const),
      ]).catch(() => "timeout" as const)

      if (outcome === "confirmed") {
        shots.push(await shot(page, "08-04-checkout-confirmed.png"))
        record("C08-04", "Checkout → place order", "PASS", shots, "COD/system confirmed")
      } else {
        shots.push(await shot(page, "08-04-checkout-blocked.png"))
        const msg =
          outcome === "error" ? ((await checkoutError.textContent()) ?? "") : "timeout waiting for confirmation"
        record("C08-04", "Checkout → place order", "FAIL", shots, msg.slice(0, 200))
        throw new Error(`Checkout not confirmed: ${msg}`)
      }
    } catch (e) {
      if (!flowResults.some((r) => r.id === "C08-04")) {
        shots.push(await shot(page, "08-04-checkout-FAIL.png").catch(() => "08-04-checkout-FAIL.png"))
        record("C08-04", "Checkout → place order", "FAIL", shots, String(e))
      }
      throw e
    }
  })

  test("C08-05 — Register → cart transfer → logout → login again", async ({ page }) => {
    const shots: string[] = []
    const email = `c08.auth.${Date.now()}@example.com`

    try {
      await clearCartStorage(page)
      await addProductFromPdp(page, "brass-table-lamp")
      await page.keyboard.press("Escape").catch(() => undefined)
      const guestCartId = await page.evaluate(() => localStorage.getItem("lc_cart_id"))
      expect(guestCartId).toBeTruthy()
      shots.push(await shot(page, "08-05-guest-cart-before-register.png"))

      await registerWithRetry(page, email)
      shots.push(await shot(page, "08-05-after-register.png"))

      await page.goto("/cart")
      await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
      await expect(page.getByText(/your cart is empty/i)).toHaveCount(0)
      await expect.poll(async () => cartItemCount(page), { timeout: 15_000 }).toBeGreaterThan(0)
      shots.push(await shot(page, "08-05-cart-after-register-transfer.png"))

      await logoutIfNeeded(page)
      shots.push(await shot(page, "08-05-after-logout.png"))

      await clearCartStorage(page)
      await addProductFromPdp(page, "halo-walnut-shelf")
      await page.keyboard.press("Escape").catch(() => undefined)
      shots.push(await shot(page, "08-05-guest-cart-before-relogin.png"))

      await loginWithRetry(page, email, PASSWORD)
      shots.push(await shot(page, "08-05-after-relogin.png"))

      await page.goto("/cart")
      await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
      await expect(page.getByText(/your cart is empty/i)).toHaveCount(0)
      await expect.poll(async () => cartItemCount(page), { timeout: 15_000 }).toBeGreaterThan(0)
      shots.push(await shot(page, "08-05-cart-after-relogin-transfer.png"))

      record("C08-05", "Register/transfer/logout/login", "PASS", shots, email)
    } catch (e) {
      shots.push(await shot(page, "08-05-auth-transfer-FAIL.png").catch(() => "08-05-auth-transfer-FAIL.png"))
      record("C08-05", "Register/transfer/logout/login", "FAIL", shots, String(e))
      throw e
    }
  })

  test("C08-06 — Bad login credentials show error", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/account/login")
      await page.getByLabel(/^Email$/i).fill(`c08.nobody.${Date.now()}@example.com`)
      await page.getByLabel(/^Password$/i).fill("WrongPassword999!")
      shots.push(await shot(page, "08-06-bad-login-before-submit.png"))

      await page.getByRole("button", { name: /sign in/i }).click()
      await expect(page.locator(".text-destructive, [class*='destructive']").first()).toBeVisible({
        timeout: 15_000,
      })
      await expect(page).toHaveURL(/\/account\/login/)
      shots.push(await shot(page, "08-06-bad-login-error.png"))

      record("C08-06", "Bad login error", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "08-06-bad-login-FAIL.png").catch(() => "08-06-bad-login-FAIL.png"))
      record("C08-06", "Bad login error", "FAIL", shots, String(e))
      throw e
    }
  })

  test("C08-07 — Account pages load without crash", async ({ page }) => {
    const email = `c08.pages.${Date.now()}@example.com`
    await registerWithRetry(page, email)

    const routes: { slug: string; label: string; file: string }[] = [
      { slug: "/account", label: "Dashboard", file: "08-07-account-dashboard.png" },
      { slug: "/account/orders", label: "Orders", file: "08-07-account-orders.png" },
      { slug: "/account/wishlist", label: "Wishlist", file: "08-07-account-wishlist.png" },
      { slug: "/account/addresses", label: "Addresses", file: "08-07-account-addresses.png" },
      { slug: "/account/settings", label: "Settings", file: "08-07-account-settings.png" },
      { slug: "/account/designs", label: "Designs", file: "08-07-account-designs.png" },
      { slug: "/account/coupons", label: "Coupons", file: "08-07-account-coupons.png" },
      { slug: "/account/corporate", label: "Corporate", file: "08-07-account-corporate.png" },
    ]

    const allShots: string[] = []
    try {
      for (const route of routes) {
        await page.goto(route.slug)
        await expect(page.locator("main")).toBeVisible({ timeout: 20_000 })
        await expect(page.getByText(/application error|something went wrong/i)).toHaveCount(0)
        await page.waitForTimeout(400)
        allShots.push(await shot(page, route.file))
      }
      record("C08-07", "Account pages load", "PASS", allShots, email)
    } catch (e) {
      allShots.push(await shot(page, "08-07-account-pages-FAIL.png").catch(() => "08-07-account-pages-FAIL.png"))
      record("C08-07", "Account pages load", "FAIL", allShots, String(e))
      throw e
    }
  })

  test("C08-08 — Forgot password page", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/account/forgot-password")
      await expect(page.locator("main")).toBeVisible({ timeout: 20_000 })
      await expect(page.getByLabel(/^Email$/i)).toBeVisible()
      shots.push(await shot(page, "08-08-forgot-password.png"))
      record("C08-08", "Forgot password page", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "08-08-forgot-password-FAIL.png").catch(() => "08-08-forgot-password-FAIL.png"))
      record("C08-08", "Forgot password page", "FAIL", shots, String(e))
      throw e
    }
  })
})
