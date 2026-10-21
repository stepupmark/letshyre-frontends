import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const PAGES = [
  { url: "/en/employers", nav: "For employers" },
  { url: "/en/candidates", nav: "For candidates" },
]

for (const { url, nav } of PAGES) {
  test(`${url} passes axe and ships FAQ JSON-LD in English only`, async ({
    page,
    request,
  }) => {
    await page.goto(url)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    const { violations } = await new AxeBuilder({ page })
      .withTags(WCAG)
      .analyze()
    expect(violations).toEqual([])

    const html = await (await request.get(url)).text()
    expect(html).toContain('"@type":"FAQPage"')
    expect(html).not.toMatch(/hreflang="hi"/)
    expect(html).toContain(`>${nav}<`)
  })
}

test("header links the audience pages only where they are published", async ({
  page,
}) => {
  await page.goto("/hi/pricing")
  await expect(page.locator('a[href$="/employers"]')).toHaveCount(0)
  await expect(page.locator('a[href$="/candidates"]')).toHaveCount(0)
})
