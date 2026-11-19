import { readdirSync, readFileSync } from "node:fs"

import { expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"
import { otherEngine, SITEMAP } from "./sitemap.ts"

const LOCALES =
  "en hi fr ja ar te ta es nl ru kn ml ur bn de pt it ko id".split(" ")

const EN = new URL("../app/locales/en/", import.meta.url)
const flatKeys = (node: unknown, prefix: string): string[] =>
  node && typeof node === "object"
    ? Object.entries(node).flatMap(([k, v]) => flatKeys(v, `${prefix}.${k}`))
    : [prefix]

// two segments or more, so single words like "title" don't count
const KEYS = readdirSync(EN).flatMap((file) =>
  Object.entries(JSON.parse(readFileSync(new URL(file, EN), "utf8")) as object)
    .flatMap(([k, v]) => flatKeys(v, k))
    .filter((key) => key.includes("."))
)

// these end with the language menu open, which a11y.spec checks on its own
test.use({ axeAtEnd: false })

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

for (const { path, lang, alternates } of SITEMAP) {
  test(`${path}: offers its ready locales and shows no raw keys`, async ({
    page,
  }, info) => {
    test.skip(otherEngine(lang, info.project.name), "chromium only")
    await page.goto(path)
    const text = await page.locator("body").innerText()
    expect(KEYS.filter((key) => text.includes(key))).toEqual([])

    const trigger = page
      .getByRole("contentinfo")
      .locator("button:has(> span[lang])")
    // a click before hydration does nothing, and long posts hydrate late on a busy machine
    await expect(async () => {
      if (!(await page.getByRole("dialog").isVisible())) await trigger.click()
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 1000 })
    }).toPass()
    const items = page.getByRole("dialog").getByRole("link")
    await expect(items).toHaveCount(alternates.size)
    for (const [lang, href] of alternates) {
      await expect(
        page.getByRole("dialog").locator(`a[hreflang="${lang}"]`)
      ).toHaveAttribute("href", href)
    }
  })
}

test.describe("untranslated pages", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "server behaviour")

  test("are 404s, with no redirect to English", async ({ request }) => {
    const missing = SITEMAP.filter((p) => p.lang === "en").flatMap(
      ({ path, alternates }) =>
        LOCALES.filter((l) => !alternates.has(l)).map((l) =>
          path.replace(/^\/en/, `/${l}`)
        )
    )
    test.skip(missing.length === 0, "every page is translated")
    for (const path of missing.slice(0, 5)) {
      const res = await request.get(path, { maxRedirects: 0 })
      expect(res.status(), path).toBe(404)
    }
  })
})

test("choosing a language remembers it in a cookie", async ({
  page,
  context,
}) => {
  await page.goto("/en/about")
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: /language/i })
    .click()
  await page.getByRole("dialog").getByRole("link").first().click()
  const cookies = await context.cookies()
  expect(cookies.find((c) => c.name === "lh_locale")?.value).toMatch(
    /^[a-z]{2}$/
  )
})
