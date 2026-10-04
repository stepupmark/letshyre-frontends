import { expect, test } from "@playwright/test"

import { mockApi } from "./mock-api.ts"
import { SITEMAP } from "./sitemap.ts"

// Opt-in (VISUAL=1): font rendering differs per OS, so baselines only match the
// platform that recorded them. Refresh with VISUAL=1 pnpm test:e2e -u.

const PAGES = ["", "/pricing", "/contact", "/terms"]
const LOCALES = ["en", "ar", "de"]
const WIDTHS = [360, 768, 1280, 1920]

const shipped = new Set(SITEMAP.map((p) => p.path))

test.skip(!process.env.VISUAL, "set VISUAL=1")
test.skip(({ browserName }) => browserName !== "chromium", "one engine")

for (const lang of LOCALES) {
  for (const page of PAGES) {
    const path = `/${lang}${page}`
    if (!shipped.has(path)) continue

    for (const width of WIDTHS) {
      test(`${path} at ${width}px`, async ({ page: tab }) => {
        await mockApi(tab)
        await tab.setViewportSize({ width, height: 900 })
        await tab.goto(path)
        await tab.waitForLoadState("networkidle")
        await tab.evaluate(() => document.fonts.ready)
        await expect(tab).toHaveScreenshot(
          `${lang}${page.replaceAll("/", "-") || "-home"}-${width}.png`,
          { fullPage: true, maxDiffPixelRatio: 0.01 }
        )
      })
    }
  }
}
