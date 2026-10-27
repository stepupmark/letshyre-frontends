import { axe, expect, test } from "./fixtures.ts"

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
    await axe(page)

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
