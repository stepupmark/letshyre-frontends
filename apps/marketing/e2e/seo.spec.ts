import { readFileSync } from "node:fs"

import { expect, test } from "./fixtures.ts"
import { MOVED_PATHS } from "../app/lib/pages.ts"
import { jsonLdOf, metaOf, titleOf } from "../scripts/html.ts"
import { SEO_ALLOWLIST } from "./seo-allowlist.ts"
import { SITEMAP } from "./sitemap.ts"

interface BaselinePage {
  url: string
  title: string
  description: string
  og: Record<string, string>
  jsonLd: { types: string[]; faqQuestions: number }
}

const baseline = JSON.parse(
  readFileSync(
    new URL("../../../docs/baseline/seo-baseline.json", import.meta.url),
    "utf8"
  )
) as { pages: BaselinePage[] }

const before = new Map(
  baseline.pages.map((p) => [new URL(p.url).pathname.replace(/\/$/, ""), p])
)
const allowed = (path: string, field: string) =>
  SEO_ALLOWLIST.some(
    (a) => path.replace(/^\/[a-z]{2}/, "") === a.page && a.field === field
  )

test.describe("seo baseline", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "static HTML")

  for (const { path: url } of SITEMAP) {
    const path = Object.entries(MOVED_PATHS).reduce(
      (p, [from, to]) => p.replace(new RegExp(`${to}$`), from),
      url
    )
    const old = before.get(path)
    if (!old) continue

    test(`${url} keeps its search appearance`, async ({ request }) => {
      const html = await (await request.get(url)).text()
      const types = jsonLdOf(html)
        .map((block) => (JSON.parse(block) as { "@type": string })["@type"])
        .sort()
      const now = {
        title: titleOf(html),
        description: metaOf(html, "description"),
        ogImage: new URL(metaOf(html, "og:image")).pathname,
        jsonLd: types,
        faqQuestions: (html.match(/"@type":"Question"/g) ?? []).length,
      }
      const then = {
        title: old.title,
        description: old.description,
        ogImage: new URL(old.og["og:image"] ?? "").pathname,
        jsonLd: [...old.jsonLd.types].sort(),
        faqQuestions: old.jsonLd.faqQuestions,
      }

      for (const field of Object.keys(now) as (keyof typeof now)[]) {
        if (allowed(path, field)) continue
        expect.soft(now[field], field).toEqual(then[field])
      }
    })
  }

  test("the allowlist only names baseline pages", () => {
    for (const { page } of SEO_ALLOWLIST) {
      expect(before.has(`/en${page}`), page).toBe(true)
    }
  })
})
