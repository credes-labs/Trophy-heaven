import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * Money-path smoke + accessibility checks (docs/kit/07 §7.4/§7.5). These are
 * resilient to an empty catalog so they can run in CI without a seeded backend;
 * the full guest-checkout journey runs against a seeded environment.
 */
test.describe("storefront smoke", () => {
  test("home page renders and is accessible", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Legacy Crafts/i)
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
    await expect(page.getByLabel("Search")).toBeVisible()
  })

  test("corporate landing shows the bulk calculator", async ({ page }) => {
    await page.goto("/corporate")
    await expect(page.getByText(/Estimate your bulk price/i)).toBeVisible()
  })
})
