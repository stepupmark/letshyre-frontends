import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

import { mockApi } from "./mock-api.ts"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const card = (page: Page, name: string) =>
  page.locator("[data-slot=card]", {
    has: page.getByRole("heading", { level: 3, name, exact: true }),
  })

test("shows live prices and hands off to the right place", async ({ page }) => {
  await mockApi(page)
  await page.goto("/en/pricing")

  await expect(card(page, "Pro")).toContainText("₹2,450")
  await expect(card(page, "Business")).toContainText("₹4,900")
  await expect(
    card(page, "Pro").getByRole("link", { name: "Buy Pro" })
  ).toHaveAttribute("href", /\/employer\/billing\?checkout=pro$/)
  await expect(
    card(page, "Free").getByRole("link", { name: "Start free" })
  ).toHaveAttribute("href", /\/employer\/register$/)
  await expect(
    card(page, "Custom").getByRole("link", { name: "Talk to sales" })
  ).toHaveAttribute("href", "/en/contact?topic=sales")
  await expect(
    page.getByRole("link", { name: "Buy 100 credits for ₹4,900" })
  ).toHaveAttribute("href", /checkout=100-credits$/)

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("holds the layout with skeletons while prices load", async ({ page }) => {
  await mockApi(page, { prices: "hang" })
  await page.goto("/en/pricing")
  await expect(card(page, "Pro").getByTestId("price-skeleton")).toBeVisible()
  await expect(
    page.getByRole("status").filter({ hasText: "Loading current prices" })
  ).toHaveCount(1)
  // every plan and top-up pack is already laid out
  for (const name of ["Free", "Pro", "Business", "Custom"])
    await expect(card(page, name)).toBeVisible()
  await expect(
    page
      .getByRole("region", { name: "Need more credits?" })
      .locator("[data-slot=card]")
  ).toHaveCount(4)

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("compares plans in a table with a caption and scoped headers", async ({
  page,
}) => {
  await mockApi(page)
  await page.goto("/en/pricing")
  const table = page.getByRole("table", { name: "What each plan includes" })
  await expect(table.locator("caption")).toHaveCount(1)
  await expect(table.locator("th[scope=col]")).toHaveCount(5)
  await expect(table.locator("th[scope=row]")).toHaveCount(8)
})

test("on small screens the picker swaps the compared plan", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await mockApi(page)
  await page.goto("/en/pricing")
  const table = page.getByRole("table", { name: "What each plan includes" })
  await expect(
    table.getByRole("columnheader", { name: "Business" })
  ).toBeVisible()
  await expect(table.getByRole("columnheader", { name: "Pro" })).toBeHidden()

  const picker = page.getByRole("group", { name: "Plan to compare" })
  await picker.getByRole("button", { name: "Pro" }).click()
  await expect(picker.getByRole("button", { name: "Pro" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  await expect(table.getByRole("columnheader", { name: "Pro" })).toBeVisible()
  await expect(
    table.getByRole("columnheader", { name: "Business" })
  ).toBeHidden()
})

test("ships FAQPage, BreadcrumbList and WebPage JSON-LD", async ({
  request,
}) => {
  const html = await (await request.get("/en/pricing")).text()
  const types = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ].map((m) => (JSON.parse(m[1] ?? "{}") as { "@type": string })["@type"])
  expect(types).toEqual(
    expect.arrayContaining(["FAQPage", "BreadcrumbList", "WebPage"])
  )
})
