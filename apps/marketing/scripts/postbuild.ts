// Runs after `react-router build`: sitemap, robots, SEO and size checks, CSP.

import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"
import { type Locale, localePath } from "@workspace/i18n"
import { loadEnv } from "vite"

import { parseEnv } from "../app/lib/env.schema.ts"
import {
  MOVED_PATHS,
  PAGES,
  type PageId,
  PREVIEW_PAGES,
  REPLACED_BY,
} from "../app/lib/pages.ts"
import { feedPath, postPath } from "../app/lib/blog/paths.ts"
import { BLOG_DIR, readiness } from "../app/lib/readiness.ts"
import {
  initialScriptsOf,
  injectMetaPolicy,
  nginxMap,
} from "../../../tooling/csp.ts"
import { pagePolicy } from "./csp.ts"
import { renderFeed } from "./feed.ts"
import { type LlmsPage, renderLlms } from "./llms.ts"
import { checkPage } from "./seo-checks.ts"
import { renderRobots, renderSitemap } from "./sitemap.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const CLIENT = join(ROOT, "build/client")
const HTML_BUDGET = 60 * 1024
// react, react-router and i18next alone are ~130 kB; keep this a ratchet, not a target
const JS_BUDGET = 280 * 1024
// the scroll-design preview carries the motion runtime; owner-approved exemption while it's under review
const JS_BUDGET_EXEMPT: readonly PageId[] = ["homeV3"]

const env = parseEnv(loadEnv("production", ROOT, "VITE_"))
const site = env.VITE_SITE_URL.replace(/\/$/, "")
const apiOrigin = new URL(env.VITE_API_BASE_URL).origin
const production = env.VITE_ENV === "production"
const enforceCsp = process.env.CSP_ENFORCE === "true"
const indexNowKey = process.env.INDEXNOW_KEY

// the code each page is built from; a shared component changing doesn't make every page new
const SOURCES: Partial<Record<PageId, string[]>> = {
  home: [
    "app/features/home",
    ":(exclude)app/features/home/components/v2",
    ":(exclude)app/features/home/home-v2-page.tsx",
  ],
  homeV2: ["app/features/home"],
  homeV3: ["app/features/home-v3"],
  terms: ["app/features/legal"],
  privacy: ["app/features/legal"],
  refund: ["app/features/legal"],
  employerGuide: ["app/features/employer-guide"],
  candidateGuide: ["app/features/candidate-guide"],
  blog: ["app/features/blog", BLOG_DIR],
}

const gitDates = new Map<string, string>()
const lastCommit = (paths: string[]) => {
  const key = paths.join("\0")
  if (!gitDates.has(key)) {
    let date = ""
    try {
      date = execFileSync(
        "git",
        ["log", "-1", "--format=%cs", "--", ...paths],
        {
          cwd: ROOT,
          encoding: "utf8",
        }
      ).trim()
    } catch {
      // no git (tarball build): fall back to today
    }
    gitDates.set(key, date)
  }
  return gitDates.get(key) ?? ""
}

const today = new Date().toISOString().slice(0, 10)
const lastmod = (id: PageId) => (lang: Locale) =>
  lastCommit([
    ...(SOURCES[id] ?? [`app/features/${id}`]),
    ...PAGES[id].namespaces.map((ns) => `app/locales/${lang}/${ns}.json`),
  ]) || today

const htmlFile = (route: string) => join(CLIENT, route, "index.html")
const gzipSize = (file: string) => gzipSync(readFileSync(file)).length
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`

const { pages: ready, posts } = readiness(ROOT, env.VITE_ENV === "staging")
const postLocales = (slug: string) =>
  posts.filter((post) => post.slug === slug).map((post) => post.lang)
const slugs = [...new Set(posts.map((post) => post.slug))]
const problems: string[] = []
const policies = new Map<string, string>()

writeFileSync(
  join(CLIENT, "sitemap.xml"),
  renderSitemap(site, [
    ...[...ready]
      .filter(([id]) => !PREVIEW_PAGES.includes(id))
      .map(([id, locales]) => ({
        path: PAGES[id].path,
        locales,
        lastmod: lastmod(id),
      })),
    ...slugs.map((slug) => ({
      path: postPath(slug),
      locales: postLocales(slug),
      lastmod: (lang: Locale) => {
        const post = posts.find((p) => p.slug === slug && p.lang === lang)
        return post?.updatedAt ?? post?.publishedAt ?? today
      },
    })),
  ])
)
writeFileSync(join(CLIENT, "robots.txt"), renderRobots(site, production))

for (const lang of ready.get("blog") ?? []) {
  const copy = JSON.parse(
    readFileSync(join(ROOT, `app/locales/${lang}/blog.json`), "utf8")
  ) as { meta: { name: string }; index: { description: string } }
  const file = join(CLIENT, localePath(lang, feedPath))
  mkdirSync(join(file, ".."), { recursive: true })
  writeFileSync(
    file,
    renderFeed(
      site,
      lang,
      { title: copy.meta.name, description: copy.index.description },
      posts.filter((post) => post.lang === lang)
    )
  )
}

// IndexNow checks this file before it accepts a ping (scripts/indexnow.ts)
if (indexNowKey && !/^[a-zA-Z0-9-]{8,128}$/.test(indexNowKey))
  problems.push("INDEXNOW_KEY: use 8 to 128 letters, digits or dashes")
else if (indexNowKey)
  writeFileSync(join(CLIENT, `${indexNowKey}.txt`), indexNowKey)

const englishMeta = (id: PageId) => {
  const ns = PAGES[id].namespaces[0]
  const catalog = JSON.parse(
    readFileSync(join(ROOT, `app/locales/en/${ns}.json`), "utf8")
  ) as { meta: { title: string; description: string } }
  return catalog.meta
}
const llmsPages: LlmsPage[] = [...ready]
  .filter(
    ([id, locales]) => locales.includes("en") && !PREVIEW_PAGES.includes(id)
  )
  .map(([id]) => ({ id, path: PAGES[id].path, ...englishMeta(id) }))
writeFileSync(
  join(CLIENT, "llms.txt"),
  renderLlms(
    site,
    { name: "LetsHyre", summary: englishMeta("home").description },
    llmsPages,
    posts
      .filter((post) => post.lang === "en")
      .map((post) => ({ path: postPath(post.slug), ...post }))
  )
)

const routes = [
  ...[...ready].flatMap(([id, locales]) =>
    locales.map((lang) => ({
      lang,
      path: PAGES[id].path,
      locales,
      preview: PREVIEW_PAGES.includes(id),
      jsExempt: JS_BUDGET_EXEMPT.includes(id),
    }))
  ),
  ...posts.map((post) => ({
    lang: post.lang,
    path: postPath(post.slug),
    locales: postLocales(post.slug),
    preview: false,
    jsExempt: false,
  })),
]

const pagePaths = new Set(
  routes.map((page) => localePath(page.lang, page.path))
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
      production: production && !page.preview,
      fileExists: (path) => existsSync(join(CLIENT, path)),
      isPage: (path) => pagePaths.has(path),
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
  if (jsSize > JS_BUDGET && !page.jsExempt) {
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
// old URL -> new URL pairs for the host's 301s
const replaced = Object.entries(REPLACED_BY).flatMap(([from, to]) =>
  (ready.get(to) ?? []).map(
    (lang) =>
      `~^/${lang}${PAGES[from as PageId].path}$ /${lang}${PAGES[to].path};
`
  )
)
writeFileSync(
  join(ROOT, "build/redirects.map"),
  [
    ...Object.entries(MOVED_PATHS).map(
      ([from, to]) => `~^/([a-z]{2})${from}$ /$1${to};
`
    ),
    ...replaced,
  ].join("")
)

if (problems.length) {
  console.error(problems.map((p) => `✖ ${p}`).join("\n"))
  console.error(`\npostbuild: ${problems.length} problem(s)`)
  process.exit(1)
}
console.log(
  `postbuild: ${routes.length} pages checked, sitemap, feeds, robots and llms.txt written (${production ? "indexable" : "noindex"}), CSP ${enforceCsp ? "enforced" : "report-only"}`
)
