import { axe, expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"
import { otherEngine, SITEMAP } from "./sitemap.ts"

// Open states are covered next to their feature: mobile menu and newsletter in
// header.spec, form errors in contact.spec, chat in assistant.spec.

// every test here runs axe itself, the menu one scoped to the open dialog
test.use({ axeAtEnd: false })

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

for (const { path, lang } of SITEMAP) {
  test(`${path}: no axe violations`, async ({ page }, info) => {
    test.skip(otherEngine(lang, info.project.name), "chromium only")
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
  await expect(page.getByRole("dialog")).toBeVisible()
  // the popup sits over the footer links, which axe would count as tiny targets
  await axe(page, "[role=dialog]")
})
