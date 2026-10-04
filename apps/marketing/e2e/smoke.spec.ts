import { expect, test } from "@playwright/test"

import { mockApi } from "./mock-api.ts"
import { RTL, SITEMAP } from "./sitemap.ts"

for (const { path, lang } of SITEMAP) {
  test(`${path}: renders cleanly`, async ({ page, request }) => {
    const raw = await request.get(path)
    expect(raw.status()).toBe(200)
    expect(await raw.text()).toMatch(/<h1[\s>]/)

    // the real API rejects localhost origins, so answer its calls with an empty envelope
    await page.route(
      (target) => target.hostname !== "localhost",
      (route) =>
        route.fulfill({
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: JSON.stringify({ success: true, data: [] }),
        })
    )
    await mockApi(page)

    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("requestfailed", (req) => errors.push(`failed: ${req.url()}`))
    page.on("response", (res) => {
      if (res.status() >= 400) errors.push(`${res.status()}: ${res.url()}`)
    })

    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (event) => {
        console.error(`CSP: ${event.violatedDirective} ${event.blockedURI}`)
      })
    })
    await page.goto(path)
    await page.waitForLoadState("networkidle")
    const html = page.locator("html")
    await expect(html).toHaveAttribute("lang", lang)
    await expect(html).toHaveAttribute("dir", RTL.has(lang) ? "rtl" : "ltr")
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    expect(errors).toEqual([])
  })
}

test("client-side navigation loads the next page's copy", async ({ page }) => {
  await page.goto("/en/about")
  const aboutTitle = await page.title()
  await page.getByRole("banner").getByRole("link").first().click()
  await expect(page).toHaveURL(/\/en$/)
  await expect(page).not.toHaveTitle(aboutTitle)
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
})

test("unknown pages show the 404 screen", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist")
  expect(response?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})
