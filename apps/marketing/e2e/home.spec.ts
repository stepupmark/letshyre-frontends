import { expect, test } from "@playwright/test"

import { mockApi } from "./mock-api.ts"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("hero has one h1 and both sign-up paths", async ({ page }) => {
  await page.goto("/en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Hire on evidence,\s*not on hope\./
  )
  const hero = page.getByRole("region", { name: /Hire on evidence/ })
  await expect(hero.getByRole("link", { name: "I'm hiring" })).toHaveAttribute(
    "href",
    /\/employer\/register$/
  )
  await expect(
    hero.getByRole("link", { name: "I'm looking for a role" })
  ).toHaveAttribute("href", /\/employee\/register$/)
})

test("the How it works link lands on both tracks", async ({ page }) => {
  test.skip(test.info().project.name === "mobile", "link is in the menu")
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/en")
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("button", { name: "Product" })
    .click()
  await page
    .locator("[data-slot=navigation-menu-content]")
    .getByRole("link", { name: /How It Works/ })
    .click()
  await expect(page).toHaveURL(/\/en#how-it-works$/)

  const section = page.locator("#how-it-works")
  await expect(section).toBeInViewport()
  await section.getByRole("tab", { name: "For professionals" }).click()
  await expect(
    section.getByRole("heading", { name: "Take up to 3 AI interviews" })
  ).toBeVisible()
})

test("FAQ answers are prerendered and open on demand", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/en")).text()
  expect(html).toContain("Up to three, for three different roles")

  await page.goto("/en")
  const question = page.getByText("How many interviews can a candidate take?")
  const answer = page.getByText("Up to three, for three different roles")
  await expect(answer).toBeHidden()
  await question.click()
  await expect(answer).toBeVisible()
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
