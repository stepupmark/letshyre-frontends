import { expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"

// a preview for review: the sitemap-driven smoke and axe specs never reach it
test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("home v2 renders cleanly and stays out of search", async ({
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
    /See how they interview\s*before you ever call\./
  )
  await expect(
    page.getByRole("img", { name: /shortlist/ }).first()
  ).toBeVisible()
  await page.keyboard.press("End")
  await page.waitForLoadState("networkidle")
  expect(errors).toEqual([])

  const html = await (await request.get("/en/home-v2")).text()
  expect(html).toMatch(/<meta name="robots" content="noindex/)
  const sitemap = await (await request.get("/sitemap.xml")).text()
  expect(sitemap).not.toContain("home-v2")
})
