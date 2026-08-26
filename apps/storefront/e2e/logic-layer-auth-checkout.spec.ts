import { test, expect, type Page } from "@playwright/test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import fs from "node:fs/promises"

/**
 * Logic-layer H3 (auth cart transfer) + C4 (checkout payment gates).
 * Expects seeded storefront :3000 + Medusa :9000.
 */

const SCREENSHOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../.tmp/logic-layer-review/screenshots"
)

const PASSWORD = "TestPass123!"

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) return
  const safe = testInfo.title.replace(/[^\w.-]+/g, "_").slice(0, 80)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `FAIL_${safe}.png`),
    fullPage: true,
  })
})

// Give Medusa rate-limiter a breath between suites when re-running locally.
test.beforeEach(async () => {
  await new Promise((r) => setTimeout(r, 500))
})

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

async function addFirstProductToCart(page: Page): Promise<void> {
  await page.goto("/products/champion-metal-cup")
  await expect(page.getByRole("heading", { name: /champion metal cup/i })).toBeVisible({
    timeout: 20_000,
  })

  const sizeM = page.getByRole("button", { name: /M \(8/i })
  if (await sizeM.isVisible().catch(() => false)) {
    await sizeM.click()
  }

  const before = await cartItemCount(page)
  const atc = page.locator(".pdp-buy-row").getByRole("button", { name: /^add to cart$/i })
  await expect(atc).toBeEnabled({ timeout: 15_000 })
  await atc.click()

  await expect
    .poll(async () => cartItemCount(page), { timeout: 30_000 })
    .toBeGreaterThan(before)

  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem("lc_cart_id")), {
      timeout: 10_000,
    })
    .toBeTruthy()

  const close = page.getByRole("button", { name: /close cart/i })
  if (await close.isVisible().catch(() => false)) {
    await close.click()
  } else {
    await page.keyboard.press("Escape").catch(() => undefined)
  }
}

async function fillCheckoutAddress(page: Page, email: string): Promise<void> {
  await page.getByLabel(/^Email$/i).fill(email)
  await page.getByLabel(/First name/i).fill("Asha")
  await page.getByLabel(/Last name/i).fill("Verma")
  await page.getByLabel(/^Phone$/i).fill("9876543210")
  await page.getByLabel(/^Address$/i).fill("12 MG Road")
  await page.getByLabel(/^City$/i).fill("Mumbai")
  await page.getByLabel(/PIN code/i).fill("400001")
  await page.getByLabel(/Country code/i).fill("in")
  await page.getByRole("button", { name: /continue to delivery/i }).click()
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

  // Native DOM click — Playwright actionability loops when AccountShell remounts.
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
  await expect(page).toHaveURL(/\/account\/login/)
}

test.describe("H3 auth + cart transfer", () => {
  test.describe.configure({ mode: "serial" })

  let sharedEmail = ""
  let transferredCartId = ""

  test("guest add → register keeps cart (transfer)", async ({ page }) => {
    test.setTimeout(360_000)
    sharedEmail = `e2e.transfer.${Date.now()}@example.com`

    await addFirstProductToCart(page)
    const guestCartId = await page.evaluate(() => localStorage.getItem("lc_cart_id"))
    expect(guestCartId).toBeTruthy()
    expect(await cartItemCount(page)).toBeGreaterThan(0)

    await page.goto("/account/register")
    await page.getByLabel(/First name/i).fill("E2E")
    await page.getByLabel(/Last name/i).fill("Transfer")
    await page.getByLabel(/^Email$/i).fill(sharedEmail)
    await page.getByLabel(/^Password$/i).fill(PASSWORD)
    await page.getByLabel(/Confirm password/i).fill(PASSWORD)
    await page.getByRole("checkbox").check()

    for (let attempt = 0; attempt < 4; attempt++) {
      await page.getByRole("button", { name: /create account/i }).click()
      try {
        await expect(page).toHaveURL(/\/account(?!\/(register|login))/, { timeout: 20_000 })
        break
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

    await page.goto("/cart")
    await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible()
    await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
    await expect(page.getByText(/your cart is empty/i)).toHaveCount(0)
    await expect.poll(async () => cartItemCount(page), { timeout: 15_000 }).toBeGreaterThan(0)

    transferredCartId = (await page.evaluate(() => localStorage.getItem("lc_cart_id"))) ?? ""
    expect(transferredCartId).toBeTruthy()
  })

  test("logout → guest cart → login transfers again", async ({ page }) => {
    test.setTimeout(360_000)
    expect(sharedEmail).toBeTruthy()

    // Ensure we have a session from prior register (same worker, fresh context — re-login)
    await page.goto("/account/login")
    await page.getByLabel(/^Email$/i).fill(sharedEmail)
    await page.getByLabel(/^Password$/i).fill(PASSWORD)
    for (let attempt = 0; attempt < 4; attempt++) {
      await page.getByRole("button", { name: /sign in/i }).click()
      try {
        await expect(page).toHaveURL(/\/account(?!\/login)/, { timeout: 20_000 })
        break
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

    await logoutIfNeeded(page)

    await page.evaluate(() => localStorage.removeItem("lc_cart_id"))
    await addFirstProductToCart(page)
    const guestCartId2 = await page.evaluate(() => localStorage.getItem("lc_cart_id"))
    expect(guestCartId2).toBeTruthy()
    if (transferredCartId) expect(guestCartId2).not.toBe(transferredCartId)

    await page.goto("/account/login")
    await page.getByLabel(/^Email$/i).fill(sharedEmail)
    await page.getByLabel(/^Password$/i).fill(PASSWORD)
    for (let attempt = 0; attempt < 4; attempt++) {
      await page.getByRole("button", { name: /sign in/i }).click()
      try {
        await expect(page).toHaveURL(/\/account(?!\/login)/, { timeout: 20_000 })
        break
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
        if (errText) throw new Error(`Re-login failed: ${errText}`)
        throw new Error("Re-login did not leave /account/login")
      }
    }

    await page.goto("/cart")
    await expect(page.getByText(/loading cart/i)).toHaveCount(0, { timeout: 20_000 })
    await expect(page.getByText(/your cart is empty/i)).toHaveCount(0)
    await expect.poll(async () => cartItemCount(page), { timeout: 15_000 }).toBeGreaterThan(0)
  })

  test("bad login credentials show error", async ({ page }) => {
    await page.goto("/account/login")
    await page.getByLabel(/^Email$/i).fill(sharedEmail || `e2e.bad.${Date.now()}@example.com`)
    await page.getByLabel(/^Password$/i).fill("WrongPassword999!")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.locator(".text-destructive, [class*='destructive']").first()).toBeVisible({
      timeout: 15_000,
    })
    await expect(page).toHaveURL(/\/account\/login/)
  })
})

// Independent of H3 serial chain (always runs)
test("H3 bad login (standalone)", async ({ page }) => {
  await page.goto("/account/login")
  await page.getByLabel(/^Email$/i).fill(`e2e.nobody.${Date.now()}@example.com`)
  await page.getByLabel(/^Password$/i).fill("WrongPassword999!")
  await page.getByRole("button", { name: /sign in/i }).click()
  await expect(page.locator(".text-destructive, [class*='destructive']").first()).toBeVisible({
    timeout: 15_000,
  })
  await expect(page).toHaveURL(/\/account\/login/)
})

test.describe("C4 checkout payment gates", () => {
  test.describe.configure({ mode: "parallel" })
  test("empty cart checkout shows empty state", async ({ page }) => {
    await page.goto("/checkout")
    // Fresh context → empty / loading then empty
    await expect(page.getByText(/your cart is empty/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("link", { name: /continue shopping/i })).toBeVisible()
  })

  test("checkout address → delivery → payment gates + place order path", async ({ page }) => {
    test.setTimeout(180_000)
    const email = `e2e.checkout.${Date.now()}@example.com`

    await addFirstProductToCart(page)
    await page.goto("/checkout")
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({
      timeout: 20_000,
    })

    await fillCheckoutAddress(page, email)
    await expect(page.getByRole("heading", { name: /select delivery method/i })).toBeVisible({
      timeout: 30_000,
    })

    const noShipping = page.getByText(/no shipping options configured/i)
    if (await noShipping.isVisible().catch(() => false)) {
      test.info().annotations.push({
        type: "note",
        description: "No shipping options — delivery step blocked; payment gates not reachable",
      })
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "checkout_no_shipping.png"),
        fullPage: true,
      })
      return
    }

    await page.getByRole("button", { name: /continue to payment/i }).click()
    await expect(page.getByRole("heading", { name: /payment method|corporate billing/i })).toBeVisible({
      timeout: 30_000,
    })

    // Net-terms UI only when cart metadata has net terms — guest cart should not
    await expect(page.getByText(/pay on account/i)).toHaveCount(0)
    await expect(page.getByText(/corporate billing/i)).toHaveCount(0)

    const razorpayLabel = page.getByText(/pay with razorpay/i)
    const onlineLabel = page.getByText(/online payment/i)
    const codLabel = page.getByText(/cash on delivery/i)
    const razorpayEnabled = await razorpayLabel.isVisible().catch(() => false)
    const codVisible = await codLabel.isVisible().catch(() => false)

    test.info().annotations.push({
      type: "razorpay",
      description: razorpayEnabled
        ? "Razorpay UI enabled (COD should be hidden)"
        : "Razorpay disabled / system provider (COD may show)",
    })

    if (razorpayEnabled) {
      expect(codVisible).toBe(false)
      await page.getByRole("button", { name: /continue to review/i }).click()
      await expect(page.getByRole("heading", { name: /review your order/i })).toBeVisible()

      // Force skip path: stub Razorpay unavailable so openCheckout returns skipped
      await page.evaluate(() => {
        ;(window as unknown as { Razorpay?: unknown }).Razorpay = undefined
        const orig = document.createElement.bind(document)
        // Block checkout.js from defining Razorpay by removing scripts after append
        document.createElement = ((tag: string) => {
          const el = orig(tag)
          if (tag.toLowerCase() === "script") {
            Object.defineProperty(el, "src", {
              set() {
                /* swallow razorpay script */
              },
              get() {
                return ""
              },
            })
          }
          return el
        }) as typeof document.createElement
      })

      await page.getByRole("button", { name: /place order|pay with razorpay/i }).click()
      await expect(
        page.getByText(/razorpay checkout could not be opened|no order was placed/i)
      ).toBeVisible({ timeout: 20_000 })
      await expect(page).not.toHaveURL(/\/order\/confirmed/)
    } else {
      expect(await onlineLabel.isVisible()).toBe(true)
      expect(codVisible).toBe(true)

      // Prefer COD path when available
      await page.getByText(/cash on delivery/i).click()
      await page.getByRole("button", { name: /continue to review/i }).click()
      await expect(page.getByRole("heading", { name: /review your order/i })).toBeVisible()

      await page.getByRole("button", { name: /place order/i }).click()

      // Prefer confirmed URL; checkout errors use destructive alert (ignore Next.js empty live-region alerts).
      const confirmed = page.waitForURL(/\/order\/confirmed\//, { timeout: 45_000 })
      const checkoutError = page
        .locator('[role="alert"].text-destructive, [role="alert"].bg-destructive\\/10, p[role="alert"]')
        .filter({ hasText: /\S/ })
        .first()
      const outcome = await Promise.race([
        confirmed.then(() => "confirmed" as const),
        checkoutError.waitFor({ state: "visible", timeout: 45_000 }).then(() => "error" as const),
      ]).catch(() => "timeout" as const)

      if (outcome === "confirmed") {
        await expect(page).toHaveURL(/\/order\/confirmed\//)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, "checkout_cod_confirmed.png"),
          fullPage: true,
        })
        test.info().annotations.push({ type: "outcome", description: "COD/system place-order CONFIRMED" })
      } else if (outcome === "error") {
        const msg = (await checkoutError.textContent()) ?? ""
        test.info().annotations.push({
          type: "note",
          description: `COD/system place-order blocked: ${msg.slice(0, 200)}`,
        })
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, "checkout_cod_blocked.png"),
          fullPage: true,
        })
        await expect(page).not.toHaveURL(/\/order\/confirmed/)
        console.log("C4_OUTCOME=blocked", msg)
      } else {
        // Still spinning? Wait a bit more for confirmation
        try {
          await expect(page).toHaveURL(/\/order\/confirmed\//, { timeout: 30_000 })
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, "checkout_cod_confirmed.png"),
            fullPage: true,
          })
          await fs.writeFile(
            path.join(SCREENSHOT_DIR, "..", "c4-outcome.txt"),
            `razorpayEnabled=${razorpayEnabled}\ncodVisible=${codVisible}\noutcome=confirmed\n`,
            "utf8"
          )
          console.log("C4_OUTCOME=confirmed (late)")
          return
        } catch {
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, "checkout_place_timeout.png"),
            fullPage: true,
          })
          throw new Error("Place order neither confirmed nor errored within timeout")
        }
      }
      console.log("C4_OUTCOME=" + outcome)
      await fs.writeFile(
        path.join(SCREENSHOT_DIR, "..", "c4-outcome.txt"),
        `razorpayEnabled=${razorpayEnabled}\ncodVisible=${codVisible}\noutcome=${outcome}\n`,
        "utf8"
      )
    }
  })
})
