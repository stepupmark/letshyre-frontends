// Runs after `react-router build`: sitemap, robots, SEO and size checks, CSP.

import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

import { type Locale, localePath } from "@workspace/i18n"
import { loadEnv } from "vite"

import { parseEnv } from "../app/lib/env.schema.ts"
import { PAGES, type PageId } from "../app/lib/pages.ts"
import { readyLocales } from "../app/lib/readiness.ts"
import { injectMetaPolicy, nginxMap, pagePolicy } from "./csp.ts"
import { initialScriptsOf } from "./html.ts"
import { checkPage } from "./seo-checks.ts"
import { renderRobots, renderSitemap } from "./sitemap.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const CLIENT = join(ROOT, "build/client")
const HTML_BUDGET = 60 * 1024
// react, react-router and i18next alone are ~130 kB; keep this a ratchet, not a target
const JS_BUDGET = 280 * 1024

const env = parseEnv(loadEnv("production", ROOT, "VITE_"))
const site = env.VITE_SITE_URL.replace(/\/$/, "")
const apiOrigin = new URL(env.VITE_API_BASE_URL).origin
const production = env.VITE_ENV === "production"
const enforceCsp = process.env.CSP_ENFORCE === "true"

const FEATURE: Partial<Record<PageId, string>> = {
  terms: "legal",
  privacy: "legal",
  refund: "legal",
}

const gitDates = new Map<string, string>()
const lastCommit = (path: string) => {
  if (!gitDates.has(path)) {
    let date = ""
    try {
      date = execFileSync("git", ["log", "-1", "--format=%cs", "--", path], {
        cwd: ROOT,
        encoding: "utf8",
      }).trim()
    } catch {
      // no git (tarball build): fall back to today
    }
    gitDates.set(path, date)
  }
  return gitDates.get(path) ?? ""
}

const today = new Date().toISOString().slice(0, 10)
const lastmod = (id: PageId) => (lang: Locale) =>
  [
    `app/features/${FEATURE[id] ?? id}`,
    ...PAGES[id].namespaces.map((ns) => `app/locales/${lang}/${ns}.json`),
  ]
    .map(lastCommit)
    .filter(Boolean)
    .sort()
    .at(-1) ?? today

const htmlFile = (route: string) => join(CLIENT, route, "index.html")
const gzipSize = (file: string) => gzipSync(readFileSync(file)).length
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`

const ready = readyLocales(join(ROOT, "app/locales"))
const problems: string[] = []
const policies = new Map<string, string>()

writeFileSync(
  join(CLIENT, "sitemap.xml"),
  renderSitemap(
    site,
    [...ready].map(([id, locales]) => ({
      path: PAGES[id].path,
      locales,
      lastmod: lastmod(id),
    }))
  )
)
writeFileSync(join(CLIENT, "robots.txt"), renderRobots(site, production))

const routes = [...ready].flatMap(([id, locales]) =>
  locales.map((lang) => ({ lang, path: PAGES[id].path, locales }))
)

for (const page of routes) {
  const route = localePath(page.lang, page.path)
  const file = htmlFile(route)
  if (!existsSync(file)) {
    problems.push(`${route}: not prerendered`)
    continue
  }
  let html = readFileSync(file, "utf8")

  for (const problem of checkPage(
    { ...page, html },
    {
      site,
      production,
      fileExists: (path) => existsSync(join(CLIENT, path)),
    }
  )) {
    problems.push(`${route}: ${problem}`)
  }

  const policy = pagePolicy(html, apiOrigin)
  policies.set(route, policy)
  if (enforceCsp) {
    html = injectMetaPolicy(html, policy)
    writeFileSync(file, html)
  }

  const htmlSize = gzipSize(file)
  if (htmlSize > HTML_BUDGET) {
    problems.push(
      `${route}: HTML is ${kb(htmlSize)} gzip, budget ${kb(HTML_BUDGET)}`
    )
  }
  const jsSize = initialScriptsOf(html)
    .map((src) => gzipSize(join(CLIENT, src)))
    .reduce((a, b) => a + b, 0)
  if (jsSize > JS_BUDGET) {
    problems.push(
      `${route}: initial JS is ${kb(jsSize)} gzip, budget ${kb(JS_BUDGET)}`
    )
  }
}

// any unknown URL is answered with the 404 page, so its policy is the default
let fallbackPolicy = "default-src 'self'"
const notFound = htmlFile("/404")
if (existsSync(notFound)) {
  const html = readFileSync(notFound, "utf8")
  fallbackPolicy = pagePolicy(html, apiOrigin)
  if (enforceCsp)
    writeFileSync(notFound, injectMetaPolicy(html, fallbackPolicy))
  if (!html.includes("noindex")) problems.push("/404: should be noindex")
} else {
  problems.push("/404: not prerendered")
}

writeFileSync(join(ROOT, "build/csp.map"), nginxMap(policies, fallbackPolicy))

if (problems.length) {
  console.error(problems.map((p) => `✖ ${p}`).join("\n"))
  console.error(`\npostbuild: ${problems.length} problem(s)`)
  process.exit(1)
}
console.log(
  `postbuild: ${routes.length} pages checked, sitemap and robots written (${production ? "indexable" : "noindex"}), CSP ${enforceCsp ? "enforced" : "report-only"}`
)
