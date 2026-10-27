import { axe, expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("hero has one h1, both sign-up paths and passes axe in both themes", async ({
  page,
}) => {
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

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" })
    await page.goto("/en")
    await axe(page)
  }
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
