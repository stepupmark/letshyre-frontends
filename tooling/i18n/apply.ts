// Writes a translation batch into the marketing catalogs, or the app's with --app.
// A batch is one JSON file per locale, named <locale>.json: { "<ns>": { "<dotted.key>": "text" } }.
// Plural keys use the locale's own categories ("plans.credits_few"). Existing translations win,
// and every catalog is rewritten in English key order.
// usage: node tooling/i18n/apply.ts <batch-dir> [--app] [--dry-run]

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { isLocale, type Locale } from "../../packages/i18n/src/config.ts"
import type { Catalog } from "../../packages/i18n/src/create-i18n.ts"
import {
  checkCatalog,
  pluralCategories,
} from "../../packages/i18n/src/node/checks.ts"

type Node = Catalog[string]

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const TARGET = join(
  ROOT,
  process.argv.includes("--app")
    ? "apps/app/app/locales"
    : "apps/marketing/app/locales"
)
const PLURAL = /_(zero|one|two|few|many|other)$/

const [batchDir] = process.argv.slice(2).filter((a) => !a.startsWith("--"))
const dryRun = process.argv.includes("--dry-run")
if (!batchDir) {
  console.error(
    "usage: node tooling/i18n/apply.ts <batch-dir> [--app] [--dry-run]"
  )
  process.exit(1)
}

const read = (file: string) =>
  existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Catalog) : {}

const lookup = (node: Node | undefined, path: string[]): Node | undefined =>
  path.reduce<Node | undefined>(
    (n, key) =>
      n && typeof n === "object" ? (n as Record<string, Node>)[key] : undefined,
    node
  )

/** Rebuilds `english`'s shape with values from `current`, then `batch`. Gaps stay gaps. */
function merge(
  english: Node,
  current: Node | undefined,
  batch: Record<string, string>,
  locale: Locale,
  path: string[] = []
): Node | undefined {
  if (typeof english === "string") {
    const existing = lookup(current, path)
    return typeof existing === "string" ? existing : batch[path.join(".")]
  }
  if (Array.isArray(english)) {
    const items = english.map((item, i) =>
      merge(item, current, batch, locale, [...path, String(i)])
    )
    return items.includes(undefined) ? undefined : (items as Node[])
  }

  const out: Record<string, Node> = {}
  const done = new Set<string>()
  for (const [key, value] of Object.entries(english)) {
    const base = key.replace(PLURAL, "")
    if (base === key) {
      const merged = merge(value, current, batch, locale, [...path, key])
      if (merged !== undefined) out[key] = merged
      continue
    }
    if (done.has(base)) continue
    done.add(base)
    for (const category of pluralCategories(locale)) {
      const form = `${base}_${category}`
      const existing = lookup(current, [...path, form])
      const value =
        typeof existing === "string"
          ? existing
          : batch[[...path, form].join(".")]
      if (value !== undefined) out[form] = value
    }
  }
  return out
}

let problems = 0
for (const file of readdirSync(batchDir).filter((f) => f.endsWith(".json"))) {
  const locale = basename(file, ".json")
  if (!isLocale(locale) || locale === "en") {
    console.error(`skip ${file}: not a target locale`)
    continue
  }
  const batch = JSON.parse(
    readFileSync(join(batchDir, file), "utf8")
  ) as Record<string, Record<string, string>>

  for (const [ns, entries] of Object.entries(batch)) {
    const english = read(join(TARGET, "en", `${ns}.json`))
    const target = join(TARGET, locale, `${ns}.json`)
    const merged = (merge(english, read(target), entries, locale) ??
      {}) as Catalog

    const issues = checkCatalog(locale, ns, english, merged)
    for (const { key, kind } of issues) {
      console.error(`${locale}/${ns}: ${kind} ${key}`)
    }
    problems += issues.length
    if (!dryRun) writeFileSync(target, JSON.stringify(merged, null, 2) + "\n")
  }
  console.log(`${locale}: ${Object.keys(batch).join(", ")}`)
}

if (problems) {
  console.error(`\n${problems} problem(s) left; fix the batch and run it again`)
  process.exit(1)
}
