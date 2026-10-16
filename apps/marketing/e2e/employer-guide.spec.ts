import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const URL = "/en/employer-guide"

test("chapter list jumps to a chapter and marks it", async ({ page }) => {
  await page.goto(URL)
  const toc = page.getByRole("navigation", { name: "In this guide" })
  const toggle = toc.locator("summary")
  if (await toggle.isVisible()) await toggle.click()
  const link = toc.getByRole("link", { name: "Unlock the candidates you want" })
  await link.click()
  await expect(page).toHaveURL(/#unlock-candidates$/)
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Unlock the candidates you want",
    })
  ).toBeInViewport()
  await expect(link).toHaveAttribute("aria-current", "location")

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("ships FAQ JSON-LD and is published in English only", async ({
  request,
}) => {
  const html = await (await request.get(URL)).text()
  expect(html).toContain('"@type":"FAQPage"')
  expect(html).not.toMatch(/hreflang="hi"/)
})

test("footer links the guide only where it is published", async ({ page }) => {
  const footer = page.getByRole("contentinfo")
  await page.goto("/en/pricing")
  await expect(
    footer.getByRole("link", { name: "Employer guide" })
  ).toBeVisible()
  await page.goto("/hi/about")
  await expect(
    footer.getByRole("link", { name: "एम्प्लॉयर गाइड" })
  ).toHaveCount(0)
})
