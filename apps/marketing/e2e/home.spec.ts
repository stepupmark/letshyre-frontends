import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

import { mockApi } from "./mock-api.ts"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const hero = (page: Page) =>
  page.getByRole("region", {
    name: "The AI Hiring Platform for Notice-Period Talent",
  })

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("hero leads with one h1 and both audiences", async ({ page }) => {
  await page.goto("/en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The AI Hiring Platform for Notice-Period Talent"
  )
  await expect(
    hero(page).getByRole("link", { name: "I'm Hiring" })
  ).toHaveAttribute("href", /\/employer\/register$/)
  await expect(
    hero(page).getByRole("link", { name: "I'm looking for a job" })
  ).toHaveAttribute("href", /\/employee\/register$/)
})

test("scorecard preview is real content, not an image", async ({ page }) => {
  await page.goto("/en")
  const preview = page.getByRole("figure")
  await expect(preview.getByRole("progressbar")).toHaveCount(4)
  await expect(
    preview.getByRole("progressbar", { name: "Communication" })
  ).toHaveAttribute("aria-valuenow", "88")
  await expect(
    preview.getByRole("table", { name: "Verification" })
  ).toBeVisible()
  await expect(preview.getByRole("img")).toHaveCount(0)
})

test("the How it works link scrolls to its section", async ({ page }) => {
  test.skip(test.info().project.name === "mobile", "link is in the menu")
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/en")
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "How It Works" })
    .click()
  await expect(page).toHaveURL(/\/en#how-it-works$/)
  await expect(
    page.getByRole("heading", { level: 2, name: "How it works" })
  ).toBeInViewport()
  await expect(page.locator("#how-it-works").getByRole("listitem")).toHaveCount(
    3
  )
})

test("FAQ answers are prerendered and open on demand", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/en")).text()
  expect(html).toContain("over 98% accuracy")

  await page.goto("/en")
  const question = page.getByRole("button", {
    name: "How accurate is the AI interview evaluation?",
  })
  await expect(question).toHaveAttribute("aria-expanded", "false")
  await question.click()
  await expect(question).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByText("over 98% accuracy")).toBeVisible()

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("ships SoftwareApplication, FAQPage and WebPage JSON-LD", async ({
  request,
}) => {
  const html = await (await request.get("/en")).text()
  const types = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ].map((m) => (JSON.parse(m[1] ?? "{}") as { "@type": string })["@type"])
  expect(types).toEqual(
    expect.arrayContaining(["SoftwareApplication", "FAQPage", "WebPage"])
  )
})
