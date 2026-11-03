import { expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"

// a preview for review: the sitemap-driven smoke and axe specs never reach it
test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("home v2 renders its screenshots and stays out of search", async ({
  page,
  request,
}) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("response", (res) => {
    if (res.status() >= 400) errors.push(`${res.status()}: ${res.url()}`)
  })

  await page.goto("/en/home-v2")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Hire on evidence,\s*not on hope\./
  )

  const shots = page.locator("figure img")
  await expect(shots).toHaveCount(3)
  for (const shot of await shots.all()) {
    await shot.scrollIntoViewIfNeeded()
    await expect(shot).toHaveAttribute("alt", /LetsHyre/)
    await expect
      .poll(() => shot.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)
  }
  expect(errors).toEqual([])

  const html = await (await request.get("/en/home-v2")).text()
  expect(html).toMatch(/<meta name="robots" content="noindex/)
  const sitemap = await (await request.get("/sitemap.xml")).text()
  expect(sitemap).not.toContain("home-v2")
})
