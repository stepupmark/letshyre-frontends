// Checks a live deploy answers the way docs/deployment.md §4.6 says, through CloudFront.
// usage: node tooling/deploy/smoke.ts --app marketing
//   env: SITE_HOST (beta.letshyre.ai, app.letshyre.ai, adm.letshyre.ai), CSP_MODE,
//        CLOUDFRONT_DOMAIN (optional, dXXXX.cloudfront.net, to check the host redirect)

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { type AppName, isAppName } from "./files.ts"

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)))

const { values } = parseArgs({ options: { app: { type: "string" } } })
const app = values.app
if (!isAppName(app)) throw new Error("--app must be marketing, app or admin")
const host = process.env.SITE_HOST
if (!host) throw new Error("SITE_HOST is not set")
const cspHeader =
  process.env.CSP_MODE === "enforce"
    ? "content-security-policy"
    : "content-security-policy-report-only"
const client = join(ROOT, "apps", app, "build", "client")

interface Expect {
  status: number
  location?: string
  type?: RegExp
  notType?: RegExp
  headers?: Record<string, RegExp>
  absent?: string[]
}

const failures: string[] = []

async function check(path: string, expect: Expect, base = `https://${host}`) {
  const url = base + path
  let response: Response
  try {
    response = await fetch(url, { redirect: "manual" })
  } catch {
    response = await fetch(url, { redirect: "manual" })
  }
  const problems: string[] = []
  const header = (name: string) => response.headers.get(name) ?? ""
  if (response.status !== expect.status)
    problems.push(`status ${response.status}, expected ${expect.status}`)
  if (expect.location && header("location") !== expect.location)
    problems.push(
      `location "${header("location")}", expected "${expect.location}"`
    )
  if (expect.type && !expect.type.test(header("content-type")))
    problems.push(`content-type "${header("content-type")}"`)
  if (expect.notType?.test(header("content-type")))
    problems.push(
      `content-type "${header("content-type")}" shouldn't be served here`
    )
  for (const [name, pattern] of Object.entries(expect.headers ?? {}))
    if (!pattern.test(header(name))) problems.push(`${name} "${header(name)}"`)
  for (const name of expect.absent ?? [])
    if (response.headers.has(name)) problems.push(`${name} should be absent`)
  for (const [name] of response.headers)
    if (name.startsWith("x-amz-meta-")) problems.push(`${name} leaked`)
  await response.body?.cancel()
  console.log(`${problems.length ? "✖" : "✔"} ${url}`)
  failures.push(...problems.map((p) => `${url}: ${p}`))
}

const HTML = /^text\/html/
const SECURE = {
  "strict-transport-security": /max-age=\d+/,
  "x-content-type-options": /^nosniff$/,
  "x-frame-options": /^DENY$/,
}
const page = {
  status: 200,
  type: HTML,
  headers: { ...SECURE, [cspHeader]: /frame-ancestors 'none'/ },
}

const someAsset = readdirSync(join(client, "assets")).find((name) =>
  name.endsWith(".js")
)
const asset = {
  status: 200,
  headers: { "cache-control": /immutable/ },
}
const missingAsset = {
  status: 404,
  notType: app === "marketing" ? undefined : HTML,
}

if (app === "marketing") {
  const noindex = /^Disallow: \/\s*$/m.test(
    readFileSync(join(client, "robots.txt"), "utf8")
  )
  // a page in English that a reviewed locale doesn't have yet: it must 404 there, not redirect
  const englishOnly = readdirSync(join(client, "en"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .find((name) => !existsSync(join(client, "hi", name)))

  await check("/", { status: 301, location: "/en" })
  await check("/?utm_source=smoke", {
    status: 301,
    location: "/en?utm_source=smoke",
  })
  await check("/en/", { status: 301, location: "/en" })
  await check("/en/pricing/index.html", {
    status: 301,
    location: "/en/pricing",
  })
  await check("/en", {
    ...page,
    ...(noindex
      ? { headers: { ...page.headers, "x-robots-tag": /noindex/ } }
      : { absent: ["x-robots-tag"] }),
  })
  await check("/en/pricing", page)
  await check("/en.data", { status: 200, type: /^text\/x-script/ })
  await check("/sitemap.xml", { status: 200, type: /xml/ })
  await check("/robots.txt", { status: 200, type: /^text\/plain/ })
  await check("/en/does-not-exist", { ...page, status: 404 })
  await check("/en/policy", { status: 404 })
  if (englishOnly) await check(`/hi/${englishOnly}`, { status: 404 })
  await check("/index.html", { status: 301, location: "/en" })
  await check("/_deploy/manifest.json", { status: 404, type: HTML })
} else {
  const route = app === "app" ? "/employer/dashboard" : "/candidates"
  const robots = { ...page.headers, "x-robots-tag": /noindex/ }
  await check("/", { ...page, headers: robots })
  await check(route, { ...page, headers: robots })
  await check("/shared-scorecard/abc.def", { status: 200, type: HTML })
  // the router gives this path the shell, so the manifest never leaves the bucket
  await check("/_deploy/manifest.json", { status: 200, type: HTML })
}

if (someAsset) await check(`/assets/${someAsset}`, asset)
await check("/assets/does-not-exist-0000.js", missingAsset)
if (process.env.CLOUDFRONT_DOMAIN)
  await check(
    "/en",
    { status: 301, location: `https://${host}/en` },
    `https://${process.env.CLOUDFRONT_DOMAIN}`
  )

if (failures.length) {
  console.error(failures.map((f) => `✖ ${f}`).join("\n"))
  process.exit(1)
}
console.log(`smoke: ${app} on ${host} answers as planned`)
