import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * Money-path smoke + accessibility checks (docs/kit/07 §7.4/§7.5). These are
 * resilient to an empty catalog so they can run in CI without a seeded backend;
 * the full guest-checkout journey runs against a seeded environment.
 */
test.describe("storefront smoke", () => {
  test("home page renders and is accessible", async ({ page }) => {
    // Reduce motion so reveal animations don't leave elements mid-fade
    // (transient opacity causes flaky color-contrast readings).
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    await expect(page).toHaveTitle(/Trophy Heaven/i)
    // Trigger every scroll-reveal section, then let all motion settle —
    // axe otherwise measures elements mid-fade (partial opacity) and
    // reports spurious color-contrast violations.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.75
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
    })
    await page.waitForTimeout(1500)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? "")
    )
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
  })

  test("search page is reachable from the header", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Search" }).first().click()
    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible()
    await expect(page.getByRole("textbox", { name: "Search" })).toBeVisible()
  })

  test("corporate landing shows the bulk calculator", async ({ page }) => {
    await page.goto("/corporate")
    await expect(page.getByText(/Estimate your bulk price/i)).toBeVisible()
  })

  test("shop page loads", async ({ page }) => {
    await page.goto("/shop")
    await expect(page).toHaveURL(/\/shop/)
    await expect(page.locator("main")).toBeVisible()
  })

  test("cart page loads", async ({ page }) => {
    await page.goto("/cart")
    await expect(page).toHaveURL(/\/cart/)
    await expect(page.locator("main")).toBeVisible()
  })

  test("blog page loads", async ({ page }) => {
    await page.goto("/blog")
    await expect(page).toHaveURL(/\/blog/)
    await expect(page.locator("main")).toBeVisible()
  })

  test("category pages load with branded heroes", async ({ page }) => {
    for (const slug of ["trophies"]) {
      await page.goto(`/${slug}`)
      await expect(page).toHaveURL(new RegExp(`/${slug}`))
      await expect(page.locator("main")).toBeVisible()
    }
  })

  test("retired furniture and artwork routes redirect to trophies", async ({ page }) => {
    for (const slug of ["furniture", "artwork"]) {
      await page.goto(`/${slug}`)
      await expect(page).toHaveURL(/\/trophies$/)
    }
  })

  test("footer has no dead internal links", async ({ page }) => {
    await page.goto("/")
    const footer = page.locator("footer")
    const dead = ["/sale", "/careers", "/press"]
    for (const href of dead) {
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(0)
    }
    await expect(footer.getByRole("link", { name: "Collection", exact: true })).toBeVisible()
    await expect(footer.getByRole("link", { name: "About Us" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms")
    await expect(footer.getByRole("link", { name: "New Arrivals" })).toHaveAttribute(
      "href",
      "/shop?sort=newest"
    )
  })

  test("login and forgot-password pages render", async ({ page }) => {
    await page.goto("/account/login")
    await expect(page.getByText(/welcome back/i)).toBeVisible()
    await page.getByRole("link", { name: /forgot password/i }).click()
    await expect(page).toHaveURL(/\/account\/forgot-password/)
    await expect(page.getByText(/reset your password/i)).toBeVisible()
  })

  test("register page requires terms consent", async ({ page }) => {
    await page.goto("/account/register")
    await expect(page.getByText("Create account", { exact: true }).first()).toBeVisible()
    await expect(page.getByRole("checkbox")).toBeVisible()
    await expect(page.getByLabel(/phone/i)).toBeVisible()
  })

  test("mobile viewport: bottom nav is visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    const nav = page.locator("nav").last()
    await expect(nav).toBeVisible()
  })
})
