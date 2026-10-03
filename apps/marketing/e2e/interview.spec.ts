import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const URL = "/en/how-it-works-interview"

test("lists the eight steps in order", async ({ page }) => {
  await page.goto(URL)
  const steps = page.getByRole("main").locator("ol").last()
  await expect(steps.getByRole("heading", { level: 2 })).toHaveCount(8)
  await expect(steps.getByRole("heading").first()).toHaveText(
    "Download the Desktop App"
  )
})

test("table of contents jumps to a section", async ({ page }) => {
  await page.goto(URL)
  const toc = page.getByRole("navigation", { name: "On this page" })
  await toc.getByRole("link", { name: "What you need" }).click()
  await expect(page).toHaveURL(/#requirements$/)
  await expect(
    page.getByRole("heading", { level: 2, name: "What you need" })
  ).toBeInViewport()

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("ships WebPage and breadcrumb JSON-LD", async ({ request }) => {
  const html = await (await request.get(URL)).text()
  expect(html).toContain('"@type":"WebPage"')
  expect(html).toContain('"@type":"BreadcrumbList"')
})
