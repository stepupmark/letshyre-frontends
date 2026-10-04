// Runs after `react-router build`: CSP for the SPA shell and the JS budget.

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
// 161 kB at 5.1, 195 kB at 5.5 once the shell shared UI code with the root; a ratchet,
// raise it only on purpose
const JS_BUDGET = 200 * 1024

const env = parseEnv(loadEnv("production", ROOT, "VITE_"))
const api = new URL(env.VITE_API_BASE_URL).origin
const media = env.VITE_MEDIA_ORIGINS.map((url) => new URL(url).origin)

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`
const problems: string[] = []

let html = readFileSync(INDEX, "utf8")

const policy = pagePolicy(html, {
  script: ["https://checkout.razorpay.com"],
  frame: ["https://api.razorpay.com"],
  connect: [api, "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
  img: ["blob:", ...media],
  media: ["blob:", ...media],
})
if (process.env.CSP_ENFORCE === "true") {
  html = injectMetaPolicy(html, policy)
  writeFileSync(INDEX, html)
}
writeFileSync(join(ROOT, "build/csp.map"), nginxMap(new Map(), policy))

if (!html.includes('name="robots" content="noindex, nofollow"')) {
  problems.push("index.html: missing noindex")
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
