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

test("ships SoftwareApplication and WebPage JSON-LD", async ({ request }) => {
  const html = await (await request.get("/en")).text()
  const types = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ].map((m) => (JSON.parse(m[1] ?? "{}") as { "@type": string })["@type"])
  expect(types).toEqual(
    expect.arrayContaining(["SoftwareApplication", "WebPage"])
  )
})
