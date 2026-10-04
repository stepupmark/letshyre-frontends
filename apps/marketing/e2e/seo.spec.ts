import { readFileSync } from "node:fs"

import { expect, test } from "@playwright/test"

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
  SEO_ALLOWLIST.some((a) => a.path === path && a.field === field)

test.describe("seo baseline", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "static HTML")

  for (const { path } of SITEMAP) {
    const old = before.get(path)
    if (!old) continue

    test(`${path} keeps its search appearance`, async ({ request }) => {
      const html = await (await request.get(path)).text()
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
    for (const { path } of SEO_ALLOWLIST) {
      expect(before.has(path), path).toBe(true)
    }
  })
})
