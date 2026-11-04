import { expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"

// a preview for review: the sitemap-driven smoke and axe specs never reach it
test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("home v3 plays through cleanly and stays out of search", async ({
  page,
  request,
}) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("response", (res) => {
    if (res.status() >= 400) errors.push(`${res.status()}: ${res.url()}`)
  })

  await page.goto("/en/home-v3")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Hire on evidence,\s*not on hope\./
  )

  // walk the pinned scenes so every lazy photo is requested and decodes
  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < height; y += 600) {
    await page.mouse.wheel(0, 600)
  }
  await page.waitForLoadState("networkidle")
  for (const photo of await page.locator("picture img").all()) {
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)
  }

  await page.keyboard.press("Home")
  await page.getByRole("link", { name: "Skip the walkthrough" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.locator("#pricing")).toBeFocused()
  expect(errors).toEqual([])

  const html = await (await request.get("/en/home-v3")).text()
  expect(html).toMatch(/<meta name="robots" content="noindex/)
  const sitemap = await (await request.get("/sitemap.xml")).text()
  expect(sitemap).not.toContain("home-v3")
})
