import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

import { mockApi } from "./mock-api.ts"
import { SITEMAP } from "./sitemap.ts"

// Open states are covered next to their feature: mobile menu and newsletter in
// header.spec, FAQ in home.spec, form errors in contact.spec, chat in assistant.spec.

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]

const axe = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

for (const { path } of SITEMAP) {
  test(`${path}: no axe violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState("networkidle")
    await axe(page)
  })
}

test("language menu, open", async ({ page }) => {
  await page.goto("/en/pricing")
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: /language/i })
    .click()
  await expect(page.getByRole("menu")).toBeVisible()
  await axe(page)
})
