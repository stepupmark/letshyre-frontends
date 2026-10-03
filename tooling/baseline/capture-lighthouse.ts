// Lighthouse baseline (mobile preset) for representative production pages.
// Writes docs/baseline/lighthouse.json; the summary table in lighthouse.md is
// built from it. Usage: node tooling/baseline/capture-lighthouse.ts [origin]
// Needs Chrome installed; lighthouse is fetched with pnpm dlx.

import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ORIGIN = (process.argv[2] ?? "https://letshyre.ai").replace(/\/$/, "")
const LIGHTHOUSE = "lighthouse@13"
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../docs/baseline/lighthouse.json"
)

// Same set as the legacy lighthouserc.json. Measured at the URL users land on
// (with trailing slash), so the canonical's 301 doesn't skew the numbers.
const PATHS = [
  "/en/",
  "/en/about/",
  "/en/contact/",
  "/en/download/",
  "/en/how-it-works-interview/",
  "/en/pricing/",
  "/en/terms/",
  "/en/policy/",
  "/en/refund-policy/",
  "/ar/",
  "/ar/about/",
]

const AUDITS = [
  "largest-contentful-paint",
  "cumulative-layout-shift",
  "total-blocking-time",
  "first-contentful-paint",
  "speed-index",
  "total-byte-weight",
] as const

const dir = mkdtempSync(join(tmpdir(), "lh-baseline-"))
const results = []

for (const path of PATHS) {
  const url = `${ORIGIN}${path}`
  const file = join(dir, `${path.replace(/\W+/g, "_")}.json`)
  console.log(`lighthouse: ${url}`)
  execFileSync(
    "pnpm",
    [
      "dlx",
      LIGHTHOUSE,
      url,
      "--quiet",
      "--output=json",
      `--output-path=${file}`,
      "--chrome-flags=--headless=new",
      "--only-categories=performance,accessibility,best-practices,seo",
    ],
    { stdio: "inherit", shell: process.platform === "win32" }
  )
  const lhr = JSON.parse(readFileSync(file, "utf8"))
  results.push({
    url,
    scores: Object.fromEntries(
      Object.entries(lhr.categories).map(([k, v]) => [
        k,
        Math.round(((v as { score: number }).score ?? 0) * 100),
      ])
    ),
    metrics: Object.fromEntries(
      AUDITS.map((id) => [id, lhr.audits[id]?.numericValue ?? null])
    ),
    failedA11yAudits: Object.values(lhr.audits)
      .filter(
        (a: any) =>
          a.score === 0 &&
          lhr.categories.accessibility.auditRefs.some((r: any) => r.id === a.id)
      )
      .map((a: any) => a.id),
  })
}

writeFileSync(
  OUT,
  JSON.stringify(
    {
      origin: ORIGIN,
      capturedAt: new Date().toISOString(),
      tool: LIGHTHOUSE,
      preset: "mobile (default)",
      results,
    },
    null,
    2
  ) + "\n"
)
console.log(`lighthouse: wrote ${OUT}`)
