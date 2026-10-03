import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("home renders with a language and one h1", async ({ page }) => {
  await page.goto("/en")
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
})

test("home has no axe violations", async ({ page }) => {
  await page.goto("/en")
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(violations).toEqual([])
})
