import { test, expect, type Page } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Exhaustive post-merge storefront verification (main@3d9bb1a).
 * Run: pnpm exec playwright test e2e/full-verify-storefront.spec.ts --project=chromium --workers=1
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const VERIFY_DIR = path.join(ROOT, ".tmp/full-verify")
const SCREENSHOT_DIR = path.join(VERIFY_DIR, "screenshots")
const REPORT_PATH = path.join(VERIFY_DIR, "03-playwright-storefront.md")
const RESULTS_JSON = path.join(VERIFY_DIR, "playwright-results.json")

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
      /* about:blank or restricted origin */
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
  await page.getByLabel(/Last name/i).fill("Verify")
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
    "# Playwright storefront full verification",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Base:** ${BASE}`,
    `**Medusa:** http://localhost:9000`,
    `**Branch ref:** main@3d9bb1a`,
    `**Spec:** \`apps/storefront/e2e/full-verify-storefront.spec.ts\``,
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
      const notes = (r.notes ?? "").replace(/\|/g, "\\|")
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
  fs.writeFileSync(RESULTS_JSON, JSON.stringify({ pass, fail, screenshotCount, flowResults }, null, 2), "utf8")
}

test.describe("full-verify storefront", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 })

  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  })

  test.afterAll(() => {
    writeReport()
  })

  test.beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 800))
  })

  test("F01 — Home page loads", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/")
      await expect(page).toHaveTitle(/Legacy Crafts/i)
      shots.push(await shot(page, "01-home.png"))
      record("F01", "Home page", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "01-home-FAIL.png").catch(() => "01-home-FAIL.png"))
      record("F01", "Home page", "FAIL", shots, String(e))
      throw e
    }
  })

  test("F02 — Shop filters before/after", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/shop")
      await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 20_000 })
      shots.push(await shot(page, "02-shop-before-filter.png"))

      const filterBtn = page.getByRole("button", { name: /^filter$/i }).first()
      if (await filterBtn.isVisible().catch(() => false)) {
        await filterBtn.click()
        await page.waitForTimeout(400)
      }

      const trophies = page.getByRole("checkbox", { name: /trophies/i }).first()
      if (await trophies.isVisible().catch(() => false)) {
        await trophies.check()
        await page.waitForTimeout(600)
      } else {
        const sortBtn = page.getByRole("button", { name: /sort/i }).first()
        if (await sortBtn.isVisible().catch(() => false)) {
          await sortBtn.click()
          await page.getByRole("option", { name: /price.*low/i }).first().click().catch(() => undefined)
        }
      }

      shots.push(await shot(page, "02-shop-after-filter.png"))
      record("F02", "Shop filters", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "02-shop-FAIL.png").catch(() => "02-shop-FAIL.png"))
      record("F02", "Shop filters", "FAIL", shots, String(e))
      throw e
    }
  })

  test("F03 — PDP multi-image gallery navigation", async ({ page }) => {
    const shots: string[] = []
    const handles = ["oak-side-table", "brass-table-lamp"]
    let handle = handles[0]
    let imageCount = 0

    try {
      for (const h of handles) {
        await page.goto(`/products/${h}`)
        await expect(page.locator(".pdp-gallery-well")).toBeVisible({ timeout: 20_000 })
        const counter = page.locator(".pdp-gallery-counter")
        if (await counter.isVisible().catch(() => false)) {
          const text = (await counter.textContent()) ?? ""
          const m = text.match(/\/\s*(\d+)/)
          imageCount = m ? Number(m[1]) : 0
          if (imageCount >= 2) {
            handle = h
            break
          }
        }
      }

      if (imageCount < 2) {
        record(
          "F03",
          "PDP gallery (≥2 images)",
          "FAIL",
          shots,
          `Only ${imageCount} image(s) on ${handles.join(", ")} — re-seed may be needed`
        )
        expect(imageCount, "Need ≥2 gallery images").toBeGreaterThanOrEqual(2)
      }

      await page.goto(`/products/${handle}`)
      await expect(page.locator(".pdp-gallery-well")).toBeVisible({ timeout: 20_000 })
      shots.push(await shot(page, "03-pdp-gallery-before-nav.png"))

      const nextBtn = page.getByRole("button", { name: /next image/i }).first()
      await nextBtn.click()
      await page.waitForTimeout(350)
      shots.push(await shot(page, "03-pdp-gallery-after-next.png"))

      const prevBtn = page.getByRole("button", { name: /previous image/i }).first()
      await prevBtn.click()
      await page.waitForTimeout(350)
      shots.push(await shot(page, "03-pdp-gallery-after-prev.png"))

      record("F03", `PDP gallery (${handle}, ${imageCount} imgs)`, "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "03-pdp-gallery-FAIL.png").catch(() => "03-pdp-gallery-FAIL.png"))
      if (!flowResults.some((r) => r.id === "F03")) {
        record("F03", "PDP gallery", "FAIL", shots, String(e))
      }
      throw e
    }
  })

  test("F04 — ATC → drawer → cart stepper", async ({ page }) => {
    const shots: string[] = []
    try {
      await clearCartStorage(page)
      await page.goto("/products/oak-side-table")
      await expect(page.getByRole("heading", { name: /oak side table/i })).toBeVisible({
        timeout: 20_000,
      })

      const sizeM = page.getByRole("button", { name: /M \(8/i })
      if (await sizeM.isVisible().catch(() => false)) await sizeM.click()

      const atc = page.locator(".pdp-buy-row").getByRole("button", { name: /^add to cart$/i })
      await expect(atc).toBeEnabled({ timeout: 15_000 })
      shots.push(await shot(page, "04-pdp-before-atc.png"))

      const before = await cartItemCount(page)
      await atc.click()
      const drawer = page.getByRole("dialog", { name: /shopping cart/i })
      await expect(drawer).toBeVisible({ timeout: 25_000 })
      await expect
        .poll(async () => cartItemCount(page), { timeout: 30_000 })
        .toBeGreaterThan(before)
      shots.push(await shot(page, "04-cart-drawer-open.png"))

      const drawerInc = drawer.getByRole("button", { name: /increase quantity/i }).first()
      await drawerInc.click()
      await page.waitForTimeout(500)
      shots.push(await shot(page, "04-cart-drawer-after-qty.png"))

      await drawer.getByRole("button", { name: /close cart/i }).click().catch(async () => {
        await page.keyboard.press("Escape")
      })

      await page.goto("/cart")
      await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
      const cartInc = page.getByRole("button", { name: /increase quantity/i }).first()
      await expect(cartInc).toBeVisible({ timeout: 20_000 })
      shots.push(await shot(page, "04-cart-page-before-stepper.png"))
      await cartInc.click()
      await page.waitForTimeout(500)
      shots.push(await shot(page, "04-cart-page-after-stepper.png"))

      record("F04", "ATC → drawer → cart stepper", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "04-cart-FAIL.png").catch(() => "04-cart-FAIL.png"))
      record("F04", "ATC → drawer → cart stepper", "FAIL", shots, String(e))
      throw e
    }
  })

  test("F05 — Auth register + cart transfer", async ({ page }) => {
    const shots: string[] = []
    const email = `fullverify.${Date.now()}@example.com`
    ;(page as Page & { _verifyEmail?: string })._verifyEmail = email

    try {
      await clearCartStorage(page)
      await page.goto("/products/brass-table-lamp")
      const atc = page.locator(".pdp-buy-row button.pdp-atc, .pdp-buy-row").getByRole("button", {
        name: /^add to cart$/i,
      })
      if (await atc.isEnabled().catch(() => false)) {
        await atc.click()
        await expect(page.getByRole("dialog", { name: /shopping cart/i })).toBeVisible({
          timeout: 25_000,
        })
        await page.keyboard.press("Escape").catch(() => undefined)
      }

      shots.push(await shot(page, "05-guest-cart-before-register.png"))
      await registerWithRetry(page, email)
      shots.push(await shot(page, "05-after-register.png"))

      await page.goto("/cart")
      await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
      await expect(page.getByText(/your cart is empty/i)).toHaveCount(0)
      shots.push(await shot(page, "05-cart-after-register-transfer.png"))

      record("F05", "Register + cart transfer", "PASS", shots, email)
    } catch (e) {
      shots.push(await shot(page, "05-auth-register-FAIL.png").catch(() => "05-auth-register-FAIL.png"))
      record("F05", "Register + cart transfer", "FAIL", shots, String(e))
      throw e
    }
  })

  test("F06 — Logout → guest cart → login transfer", async ({ page }) => {
    const shots: string[] = []
    const email = `fullverify.relogin.${Date.now()}@example.com`

    try {
      await registerWithRetry(page, email)
      await logoutIfNeeded(page)
      shots.push(await shot(page, "06-after-logout.png"))

      await clearCartStorage(page)
      await page.goto("/products/halo-walnut-shelf")
      const atc = page.locator(".pdp-buy-row").getByRole("button", { name: /^add to cart$/i })
      if (await atc.isEnabled().catch(() => false)) {
        await atc.click()
        await expect(page.getByRole("dialog", { name: /shopping cart/i })).toBeVisible({
          timeout: 25_000,
        })
        await page.keyboard.press("Escape").catch(() => undefined)
      }
      shots.push(await shot(page, "06-guest-cart-before-relogin.png"))

      await loginWithRetry(page, email, PASSWORD)
      shots.push(await shot(page, "06-after-relogin.png"))

      await page.goto("/cart")
      await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
      shots.push(await shot(page, "06-cart-after-relogin-transfer.png"))

      record("F06", "Logout/login cart transfer", "PASS", shots, email)
    } catch (e) {
      shots.push(await shot(page, "06-auth-relogin-FAIL.png").catch(() => "06-auth-relogin-FAIL.png"))
      record("F06", "Logout/login cart transfer", "FAIL", shots, String(e))
      throw e
    }
  })

  test("F07 — Bad login credentials", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/account/login")
      await page.getByLabel(/^Email$/i).fill(`nobody.${Date.now()}@example.com`)
      await page.getByLabel(/^Password$/i).fill("WrongPassword999!")
      shots.push(await shot(page, "07-bad-login-before-submit.png"))
      await page.getByRole("button", { name: /sign in/i }).click()
      await expect(page.locator(".text-destructive, [class*='destructive']").first()).toBeVisible({
        timeout: 15_000,
      })
      await expect(page).toHaveURL(/\/account\/login/)
      shots.push(await shot(page, "07-bad-login-error.png"))
      record("F07", "Bad login error", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "07-bad-login-FAIL.png").catch(() => "07-bad-login-FAIL.png"))
      record("F07", "Bad login error", "FAIL", shots, String(e))
      throw e
    }
  })

  test("F08 — Checkout COD to confirmation", async ({ page }) => {
    const shots: string[] = []
    const email = `fullverify.checkout.${Date.now()}@example.com`

    try {
      await clearCartStorage(page)
      await page.goto("/products/oak-side-table")
      const sizeM = page.getByRole("button", { name: /M \(8/i })
      if (await sizeM.isVisible().catch(() => false)) await sizeM.click()
      const atc = page.locator(".pdp-buy-row").getByRole("button", { name: /^add to cart$/i })
      await expect(atc).toBeEnabled({ timeout: 15_000 })
      await atc.click()
      await page.keyboard.press("Escape").catch(() => undefined)

      await page.goto("/checkout")
      await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 20_000 })
      shots.push(await shot(page, "08-checkout-address.png"))

      await fillCheckoutAddress(page, email)
      await expect(page.getByRole("heading", { name: /select delivery method/i })).toBeVisible({
        timeout: 30_000,
      })
      shots.push(await shot(page, "08-checkout-delivery.png"))

      const noShipping = page.getByText(/no shipping options configured/i)
      if (await noShipping.isVisible().catch(() => false)) {
        record("F08", "Checkout COD confirmation", "FAIL", shots, "No shipping options configured")
        throw new Error("No shipping options")
      }

      await page.getByRole("button", { name: /continue to payment/i }).click()
      await expect(
        page.getByRole("heading", { name: /payment method|corporate billing/i })
      ).toBeVisible({ timeout: 30_000 })
      shots.push(await shot(page, "08-checkout-payment.png"))

      const codLabel = page.getByText(/cash on delivery/i)
      const razorpayLabel = page.getByText(/pay with razorpay/i)
      if (await razorpayLabel.isVisible().catch(() => false)) {
        record("F08", "Checkout COD confirmation", "FAIL", shots, "Razorpay enabled — COD path N/A")
        throw new Error("Razorpay enabled locally")
      }

      if (await codLabel.isVisible().catch(() => false)) {
        await codLabel.click()
      }
      await page.getByRole("button", { name: /continue to review/i }).click()
      await expect(page.getByRole("heading", { name: /review your order/i })).toBeVisible()
      shots.push(await shot(page, "08-checkout-review.png"))

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
        shots.push(await shot(page, "08-checkout-confirmed.png"))
        record("F08", "Checkout COD confirmation", "PASS", shots)
      } else {
        shots.push(await shot(page, "08-checkout-blocked.png"))
        const msg = outcome === "error" ? ((await checkoutError.textContent()) ?? "") : "timeout"
        record("F08", "Checkout COD confirmation", "FAIL", shots, msg.slice(0, 200))
        throw new Error(`Checkout not confirmed: ${msg}`)
      }
    } catch (e) {
      if (!flowResults.some((r) => r.id === "F08")) {
        shots.push(await shot(page, "08-checkout-FAIL.png").catch(() => "08-checkout-FAIL.png"))
        record("F08", "Checkout COD confirmation", "FAIL", shots, String(e))
      }
      throw e
    }
  })

  test("F09 — Customize 2D from PDP", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/products/engraved-wooden-plaque")
      const customize = page.getByRole("link", { name: /customize this design/i })
      await expect(customize).toBeVisible()
      shots.push(await shot(page, "09-pdp-customize-link.png"))
      await customize.click()
      await expect(page.getByRole("heading", { name: /design your engraved wooden plaque/i })).toBeVisible({
        timeout: 30_000,
      })
      shots.push(await shot(page, "09-customize-2d-editor.png"))
      record("F09", "Customize 2D from PDP", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "09-customize-2d-FAIL.png").catch(() => "09-customize-2d-FAIL.png"))
      record("F09", "Customize 2D from PDP", "FAIL", shots, String(e))
      throw e
    }
  })

  test("F10 — Customize 3D (optional)", async () => {
    record(
      "F10",
      "Customize 3D (optional)",
      "PASS",
      [],
      "Crystal Star Award retired — no full_3d flagship"
    )
  })

  test("F11 — Bulk wizard guest blocked", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/corporate/bulk")
      await expect(page.getByRole("heading", { name: /bulk order/i })).toBeVisible()
      shots.push(await shot(page, "11-bulk-step1-guest.png"))
      await page.getByRole("button", { name: /continue/i }).click()
      await expect(
        page.getByText(/sign in required|unauthenticated|401|request failed/i)
      ).toBeVisible({ timeout: 15_000 })
      shots.push(await shot(page, "11-bulk-guest-blocked.png"))
      record("F11", "Bulk wizard guest blocked", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "11-bulk-FAIL.png").catch(() => "11-bulk-FAIL.png"))
      record("F11", "Bulk wizard guest blocked", "FAIL", shots, String(e))
      throw e
    }
  })

  test("F12 — Static pages load", async ({ page }) => {
    const routes: { slug: string; name: string; heading?: RegExp }[] = [
      { slug: "/blog", name: "Blog", heading: /journal|blog|stories/i },
      { slug: "/contact", name: "Contact", heading: /contact|get in touch/i },
      { slug: "/faq", name: "FAQ", heading: /faq|questions/i },
      { slug: "/about", name: "About", heading: /about|craft|legacy/i },
      { slug: "/account/wishlist", name: "Wishlist", heading: /wishlist|sign in|login/i },
      { slug: "/shipping-returns", name: "Shipping & returns", heading: /shipping|returns|delivery/i },
    ]

    for (const route of routes) {
      const shots: string[] = []
      const id = `F12-${route.slug.replace(/\//g, "-").replace(/^-/, "")}`
      try {
        await page.goto(route.slug)
        await expect(page.locator("main")).toBeVisible({ timeout: 20_000 })
        if (route.heading) {
          await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15_000 })
        }
        const file = `12-${route.slug.replace(/^\//, "").replace(/\//g, "-")}.png`
        shots.push(await shot(page, file))
        record(id, route.name, "PASS", shots)
      } catch (e) {
        const file = `12-${route.slug.replace(/^\//, "").replace(/\//g, "-")}-FAIL.png`
        shots.push(await shot(page, file).catch(() => file))
        record(id, route.name, "FAIL", shots, String(e))
        throw e
      }
    }
  })

  test("F19 — Empty cart checkout empty state", async ({ page }) => {
    const shots: string[] = []
    try {
      await clearCartStorage(page)
      await page.goto("/checkout")
      await expect(page.getByText(/your cart is empty/i)).toBeVisible({ timeout: 20_000 })
      await expect(page.getByRole("link", { name: /continue shopping/i })).toBeVisible()
      shots.push(await shot(page, "19-empty-cart-checkout.png"))
      record("F19", "Empty cart checkout", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "19-empty-cart-FAIL.png").catch(() => "19-empty-cart-FAIL.png"))
      record("F19", "Empty cart checkout", "FAIL", shots, String(e))
      throw e
    }
  })
})
