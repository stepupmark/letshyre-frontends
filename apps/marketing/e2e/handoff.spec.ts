import { fileURLToPath } from "node:url"
import { loadEnv } from "vite"

import { expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"
import { SITEMAP } from "./sitemap.ts"

// docs/baseline/url-contract.md §3: the only dashboard paths marketing may link to
const CONTRACT = [
  /^\/get-started$/,
  /^\/employer\/register$/,
  /^\/employee\/register$/,
  /^\/employee\/sign-in$/,
  /^\/employer\/billing\?checkout=[\w-]+$/,
]

const { VITE_APP_URL = "" } = loadEnv(
  "production",
  fileURLToPath(new URL("..", import.meta.url)),
  "VITE_"
)
const APP_ORIGIN = new URL(VITE_APP_URL).origin

const APP_PATHS =
  /^\/(employer|employee|get-started|forgot-password|shared-scorecard)(\/|$)/

test.skip(({ browserName }) => browserName !== "chromium", "link audit")

for (const { path } of SITEMAP.filter((p) => p.lang === "en")) {
  test(`${path}: app links follow the contract`, async ({ page }) => {
    await mockApi(page)
    await page.goto(path)
    await page.waitForLoadState("networkidle")

    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href))

    expect(hrefs.some((href) => new URL(href).origin === APP_ORIGIN)).toBe(true)

    const offContract = hrefs
      .map((href) => new URL(href))
      .filter(
        (url) =>
          url.origin === APP_ORIGIN ||
          (url.origin === new URL(page.url()).origin &&
            APP_PATHS.test(url.pathname))
      )
      .map((url) => ({ origin: url.origin, path: url.pathname + url.search }))
      .filter(
        ({ origin, path }) =>
          origin !== APP_ORIGIN || !CONTRACT.some((re) => re.test(path))
      )
    expect(offContract).toEqual([])
  })
}

test("pricing checkout buttons carry the plan key", async ({ page }) => {
  await mockApi(page)
  await page.goto("/en/pricing")
  const checkout = page.locator('a[href*="/employer/billing?checkout="]')
  await expect(checkout.first()).toBeVisible()
  for (const href of await checkout.evaluateAll((links) =>
    links.map((a) => (a as HTMLAnchorElement).href)
  )) {
    expect(new URL(href).searchParams.get("checkout")).toMatch(/^[\w-]+$/)
  }
})
