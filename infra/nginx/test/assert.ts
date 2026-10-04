// Asserts the URL contract (docs/baseline/url-contract.md) against a running nginx.
// usage: node infra/nginx/test/assert.ts http://localhost:8088 [host]

import { readdirSync } from "node:fs"
import { request } from "node:http"
import { fileURLToPath } from "node:url"

const BASE = new URL(process.argv[2] ?? "http://localhost:8088")
const HOST = process.argv[3] ?? "letshyre.ai"
const REPO = fileURLToPath(new URL("../../../", import.meta.url))

interface Res {
  status: number
  headers: Record<string, string | string[] | undefined>
  body: string
}

const get = (path: string, host = HOST) =>
  new Promise<Res>((resolve, reject) => {
    request(
      { host: BASE.hostname, port: BASE.port, path, headers: { host } },
      (res) => {
        let body = ""
        res.setEncoding("utf8")
        res.on("data", (chunk: string) => (body += chunk))
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 0, headers: res.headers, body })
        })
      }
    )
      .on("error", reject)
      .end()
  })

const failures: string[] = []
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`)
  if (!ok) failures.push(label)
}
const header = (res: Res, name: string) => String(res.headers[name] ?? "")

async function redirects(
  path: string,
  status: number,
  to: string,
  host?: string
) {
  const res = await get(path, host)
  check(
    res.status === status && header(res, "location") === to,
    `${path} -> ${status} ${to} (got ${res.status} ${header(res, "location")})`
  )
}

async function notFound(path: string) {
  const res = await get(path)
  check(
    res.status === 404 && res.body.includes('content="noindex'),
    `${path} -> 404 page (got ${res.status})`
  )
}

const health = await get("/health")
check(health.status === 200 && health.body === "ok", "/health is ok")

await redirects("/", 301, "/en")
await redirects("/?utm_source=x", 301, "/en?utm_source=x")
await redirects("/en/pricing/", 301, "/en/pricing")
await redirects("/", 301, "https://letshyre.ai/", "www.letshyre.ai")

const sitemap = await get("/sitemap.xml")
const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (m) => new URL(m[1] ?? "").pathname
)
check(
  sitemap.status === 200 && urls.length > 0,
  `sitemap lists ${urls.length} pages`
)
check((await get("/robots.txt")).status === 200, "robots.txt is served")

const pageProblems: string[] = []
for (const path of urls) {
  const res = await get(path)
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(res.body)?.[1]
  if (res.status !== 200) pageProblems.push(`${path}: ${res.status}`)
  else if (!canonical || new URL(canonical).pathname !== path)
    pageProblems.push(`${path}: canonical ${canonical}`)
  else if (header(res, "cache-control") !== "no-cache")
    pageProblems.push(`${path}: cache-control ${header(res, "cache-control")}`)
  else if (!/'sha256-/.test(header(res, "content-security-policy-report-only")))
    pageProblems.push(`${path}: no report-only CSP`)
}
check(
  pageProblems.length === 0,
  "every sitemap page is 200, self-canonical, no-cache, with its CSP"
)
pageProblems.slice(0, 10).forEach((p) => console.log(`    ${p}`))

const home = await get("/en")
for (const name of [
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
]) {
  check(header(home, name) !== "", `pages send ${name}`)
}
check(
  header(home, "content-security-policy").includes("frame-ancestors 'none'"),
  "pages can't be framed"
)

const untranslated = ["hi", "fr", "de", "ar"].find(
  (lang) => !urls.includes(`/${lang}/pricing`)
)
if (untranslated) {
  await redirects(`/${untranslated}/pricing`, 302, "/en/pricing")
  await notFound(`/${untranslated}/does-not-exist`)
}
await notFound("/en/does-not-exist")
await notFound("/xx/nonsense")
await notFound("/assets/__missing__.js")

const data = await get("/en.data")
check(
  data.status === 200 && header(data, "cache-control") === "no-cache",
  "/en.data is served uncached"
)

const firstJs = (app: string) =>
  readdirSync(`${REPO}apps/${app}/build/client/assets`).find((f) =>
    f.endsWith(".js")
  )

for (const app of ["marketing", "app", "legacy"]) {
  const file = firstJs(app)
  const res = await get(`/assets/${file}`)
  check(
    res.status === 200 && header(res, "cache-control").includes("immutable"),
    `${app} asset ${file} is served immutable`
  )
}

// paths in the app's live-routes.map come from the new app, everything else from legacy
const liveJson = await get("/live-routes.json")
const live = (JSON.parse(liveJson.body) as string[]).map(
  (pattern) => new RegExp(pattern)
)
check(
  live.length > 0 && header(liveJson, "cache-control") === "no-cache",
  `live-routes.json lists ${live.length} route(s), uncached`
)

for (const path of ["/employer/release-check"]) {
  check(
    live.some((p) => p.test(path)),
    `${path} is live`
  )
  const res = await get(path)
  check(
    res.status === 200 &&
      header(res, "x-robots-tag") === "noindex, nofollow" &&
      /'sha256-/.test(header(res, "content-security-policy-report-only")) &&
      header(res, "permissions-policy").includes("camera=(self)"),
    `${path} -> new app, noindex, its CSP, camera for itself (got ${res.status})`
  )
}

for (const path of [
  "/get-started",
  "/employer",
  "/employer/dashboard",
  "/employer/post-job",
  "/employee/interviews/1",
]) {
  check(!live.some((p) => p.test(path)), `${path} is not live yet`)
  const res = await get(path)
  check(
    res.status === 200 &&
      header(res, "x-robots-tag") === "noindex, nofollow" &&
      header(res, "permissions-policy") === "" &&
      header(res, "content-security-policy-report-only") === "",
    `${path} -> legacy shell, noindex, camera allowed (got ${res.status})`
  )
}

const shared = await get("/shared-scorecard/a1b2c3d4e5f6")
check(
  shared.status === 200 && header(shared, "referrer-policy") === "no-referrer",
  "shared scorecards send no referrer"
)
check(
  header(home, "referrer-policy") === "strict-origin-when-cross-origin",
  "other pages keep the default referrer policy"
)

const legacyFile = await get("/ai-Interview-thumbnail.webp")
check(legacyFile.status === 200, "legacy public files still resolve")

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed against ${BASE.origin}`)
  process.exit(1)
}
console.log(`\nall checks passed against ${BASE.origin}`)
