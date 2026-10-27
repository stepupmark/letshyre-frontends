import { axe, expect, test } from "./fixtures.ts"

const URL = "/en/candidate-guide"

test("chapter list jumps to a chapter and marks it", async ({ page }) => {
  await page.goto(URL)
  const toc = page.getByRole("navigation", { name: "In this guide" })
  const toggle = toc.locator("summary")
  if (await toggle.isVisible()) await toggle.click()
  const link = toc.getByRole("link", { name: "Pass the checks" })
  await link.click()
  await expect(page).toHaveURL(/#pass-the-checks$/)
  await expect(
    page.getByRole("heading", { level: 2, name: "Pass the checks" })
  ).toBeInViewport()
  await expect(link).toHaveAttribute("aria-current", "location")

  await axe(page)
})

test("ships FAQ JSON-LD and is published in English only", async ({
  request,
}) => {
  const html = await (await request.get(URL)).text()
  expect(html).toContain('"@type":"FAQPage"')
  expect(html).not.toMatch(/hreflang="hi"/)
})

test("replaces the interview guide only where it's published", async ({
  request,
}) => {
  const en = await request.get("/en/interview-guide", { maxRedirects: 0 })
  expect(en.status()).toBe(301)
  expect(en.headers().location).toBe(URL)

  const hi = await request.get("/hi/interview-guide", { maxRedirects: 0 })
  expect(hi.status()).toBe(200)
  expect(await hi.text()).not.toMatch(/hreflang="(en|x-default)"/)
})
