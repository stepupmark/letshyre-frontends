// Runs after `react-router build`: CSP for the SPA shell, noindex and the JS budget.

import { readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

import { loadEnv } from "vite"

import {
  initialScriptsOf,
  injectMetaPolicy,
  nginxMap,
  pagePolicy,
} from "../../../tooling/csp.ts"
import { parseEnv } from "../app/lib/env.schema.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const CLIENT = join(ROOT, "build/client")
const INDEX = join(CLIENT, "index.html")
// 167 kB when it was set; a ratchet, raise it only on purpose
const JS_BUDGET = 175 * 1024

const env = parseEnv(loadEnv("production", ROOT, "VITE_"))
const api = new URL(env.VITE_API_BASE_URL).origin
// photos, logos and KYC documents
const media = [api, "https://cdn.letshyre.ai"]

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`
const problems: string[] = []

let html = readFileSync(INDEX, "utf8")

// KYC documents preview in an iframe
const policy = pagePolicy(html, {
  connect: [api],
  img: ["blob:", ...media],
  frame: media,
})
if (process.env.CSP_ENFORCE === "true") {
  html = injectMetaPolicy(html, policy)
  writeFileSync(INDEX, html)
}
writeFileSync(join(ROOT, "build/csp.map"), nginxMap(new Map(), policy))

if (!html.includes('name="robots" content="noindex, nofollow"')) {
  problems.push("index.html: missing noindex")
}
if (
  !/Disallow: \/\s*$/m.test(readFileSync(join(CLIENT, "robots.txt"), "utf8"))
) {
  problems.push("robots.txt: must disallow everything")
}

const js = initialScriptsOf(html)
  .map((src) => gzipSync(readFileSync(join(CLIENT, src))).length)
  .reduce((a, b) => a + b, 0)
if (js > JS_BUDGET) {
  problems.push(`initial JS is ${kb(js)} gzip, budget ${kb(JS_BUDGET)}`)
}

if (problems.length) {
  console.error(problems.map((p) => `✖ ${p}`).join("\n"))
  process.exit(1)
}
console.log(
  `postbuild: initial JS ${kb(js)} of ${kb(JS_BUDGET)}, CSP ${process.env.CSP_ENFORCE === "true" ? "enforced" : "report-only"}`
)
