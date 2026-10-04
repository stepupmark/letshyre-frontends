import { DEFAULT_LOCALE, type Locale, localePath } from "@workspace/i18n"

import {
  alternatesOf,
  canonicalOf,
  h1Count,
  jsonLdOf,
  metaOf,
  titleOf,
} from "./html.ts"

export interface SeoPage {
  lang: Locale
  path: string
  locales: readonly Locale[]
  html: string
}

interface Options {
  site: string
  production: boolean
  fileExists: (publicPath: string) => boolean
}

const TITLE_SUFFIX = " | letshyre.ai"
const TITLE_MAX = 60
const DESC_MIN = 50
const DESC_MAX = 160

// Results are cut by pixel width, and CJK glyphs are about twice as wide.
const WIDE =
  /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/
export function width(s: string): number {
  let n = 0
  for (const ch of s) n += WIDE.test(ch) ? 2 : 1
  return n
}

function jsonLdProblems(blocks: string[]): string[] {
  const defined = new Set<string>()
  const referenced = new Set<string>()
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (!node || typeof node !== "object") return
    const record = node as Record<string, unknown>
    if (typeof record["@id"] === "string") {
      ;(record["@type"] ? defined : referenced).add(record["@id"])
    }
    Object.values(record).forEach(walk)
  }
  try {
    for (const block of blocks) walk(JSON.parse(block))
  } catch {
    return ["JSON-LD doesn't parse"]
  }
  const dangling = [...referenced].filter((id) => !defined.has(id))
  return dangling.length
    ? [`JSON-LD @id not defined: ${dangling.join(", ")}`]
    : []
}

/** Problems with one prerendered page, empty when it's fine. */
export function checkPage(
  { lang, path, locales, html }: SeoPage,
  { site, production, fileExists }: Options
): string[] {
  const problems: string[] = []
  const fail = (ok: boolean, message: string) => {
    if (!ok) problems.push(message)
  }
  const self = site + localePath(lang, path)

  const title = titleOf(html)
  fail(title.endsWith(TITLE_SUFFIX), `title should end with "${TITLE_SUFFIX}"`)
  fail(width(title) <= TITLE_MAX, `title wider than ${TITLE_MAX}: "${title}"`)

  const description = metaOf(html, "description")
  const w = width(description)
  fail(
    w >= DESC_MIN && w <= DESC_MAX,
    `description width ${w}, expected ${DESC_MIN}-${DESC_MAX}`
  )

  fail(canonicalOf(html) === self, `canonical isn't ${self}`)

  const expected = new Map(
    locales.map((l) => [l, site + localePath(l, path)] as const)
  )
  expected.set("x-default" as Locale, site + localePath(DEFAULT_LOCALE, path))
  const actual = alternatesOf(html)
  fail(
    actual.size === expected.size &&
      [...expected].every(([l, href]) => actual.get(l) === href),
    `hreflang ${[...actual.keys()].join(",")} doesn't match ready locales ${[...expected.keys()].join(",")}`
  )

  const image = metaOf(html, "og:image")
  fail(
    image.startsWith(site) && fileExists(image.slice(site.length)),
    `og:image missing on disk: ${image}`
  )
  for (const key of ["og:title", "og:locale", "twitter:card"]) {
    fail(metaOf(html, key) !== "", `${key} missing`)
  }

  problems.push(...jsonLdProblems(jsonLdOf(html)))
  fail(h1Count(html) === 1, `expected one <h1>, found ${h1Count(html)}`)

  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html)
  fail(
    noindex !== production,
    production
      ? "production page is noindex"
      : "non-production page is indexable"
  )

  return problems
}
