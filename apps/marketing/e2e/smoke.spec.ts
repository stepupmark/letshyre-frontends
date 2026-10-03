import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { PAGES } from "../app/lib/pages.ts"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

for (const [id, page] of Object.entries(PAGES)) {
  const url = `/en${page.path}`

  test(`${id}: prerendered with copy, one h1 and no axe violations`, async ({
    page: tab,
    request,
  }) => {
    const raw = await (await request.get(url)).text()
    expect(raw).toMatch(/<title>[^<]+<\/title>/)
    expect(raw).toContain('rel="canonical"')

    // the real API rejects localhost origins, so answer its calls with an empty envelope
    await tab.route(
      (target) => target.hostname !== "localhost",
      (route) =>
        route.fulfill({
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: JSON.stringify({ success: true, data: [] }),
        })
    )

    const errors: string[] = []
    tab.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    await tab.goto(url)
    await expect(tab.locator("html")).toHaveAttribute("lang", "en")
    await expect(tab.getByRole("heading", { level: 1 })).toHaveCount(1)

    const { violations } = await new AxeBuilder({ page: tab })
      .withTags(WCAG)
      .analyze()
    expect(violations).toEqual([])
    expect(errors).toEqual([])
  })
}

test("client-side navigation loads the next page's copy", async ({ page }) => {
  await page.goto("/en/about")
  const aboutTitle = await page.title()
  await page.getByRole("banner").getByRole("link").first().click()
  await expect(page).toHaveURL(/\/en$/)
  await expect(page).not.toHaveTitle(aboutTitle)
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
})

test("unknown pages show the 404 screen", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist")
  expect(response?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})
