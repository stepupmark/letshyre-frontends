import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const URL = "/en/interview-guide"

test("walks through the eight steps in three phases", async ({ page }) => {
  await page.goto(URL)
  const main = page.getByRole("main")
  await expect(
    main.getByRole("heading", { level: 2, name: "Before you start" })
  ).toBeVisible()
  const steps = main.locator("ol > li")
  await expect(steps).toHaveCount(8)
  await expect(steps.first().getByRole("heading", { level: 3 })).toHaveText(
    "Download the desktop app"
  )
})

test("table of contents jumps to a step and marks it", async ({ page }) => {
  await page.goto(URL)
  const toc = page.getByRole("navigation", { name: "On this page" })
  // collapsed behind a toggle on small screens
  const toggle = toc.locator("summary")
  if (await toggle.isVisible()) await toggle.click()
  const link = toc.getByRole("link", { name: "Verify your identity" })
  await link.click()
  await expect(page).toHaveURL(/#verify-your-identity$/)
  await expect(
    page.getByRole("heading", { level: 3, name: "Verify your identity" })
  ).toBeInViewport()
  await expect(link).toHaveAttribute("aria-current", "location")

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("ships WebPage and breadcrumb JSON-LD", async ({ request }) => {
  const html = await (await request.get(URL)).text()
  expect(html).toContain('"@type":"WebPage"')
  expect(html).toContain('"@type":"BreadcrumbList"')
})
