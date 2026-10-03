// Copies legacy translations into the marketing catalogs.
// A value carries over only when the legacy English text equals the new English text,
// so rewritten copy never inherits an outdated translation.
// usage: node tooling/i18n/migrate.ts [--dry-run]

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { LOCALES } from "../../packages/i18n/src/config.ts"
import type { Catalog } from "../../packages/i18n/src/create-i18n.ts"
import {
  readCatalogs,
  readinessFrom,
} from "../../packages/i18n/src/node/readiness.ts"
import {
  PAGES,
  type PageId,
  pageNamespaces,
} from "../../apps/marketing/app/lib/pages.ts"

type Node = Catalog[string]

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const LEGACY = join(ROOT, "apps/legacy/app/i18n/messages")
const TARGET = join(ROOT, "apps/marketing/app/locales")
const dryRun = process.argv.includes("--dry-run")

/** new "ns:path" → old "ns:path". A trailing ".*" maps a whole subtree. */
const keyMap = JSON.parse(
  readFileSync(join(ROOT, "tooling/i18n/key-map.json"), "utf8")
) as Record<string, string>

const PLURAL = /_(zero|one|two|few|many|other)$/

const readJson = (path: string): Catalog | undefined =>
  existsSync(path)
    ? (JSON.parse(readFileSync(path, "utf8")) as Catalog)
    : undefined

const legacyCache = new Map<string, Catalog | undefined>()
function legacy(lang: string, ns: string) {
  const id = `${lang}/${ns}`
  if (!legacyCache.has(id))
    legacyCache.set(id, readJson(join(LEGACY, lang, `${ns}.json`)))
  return legacyCache.get(id)
}

function get(node: Node | undefined, path: string[]): Node | undefined {
  let current = node
  for (const part of path) {
    if (current === undefined || typeof current === "string") return undefined
    current = Array.isArray(current) ? current[Number(part)] : current[part]
  }
  return current
}

function source(ns: string, path: string[]): { ns: string; path: string[] } {
  const key = `${ns}:${path.join(".")}`
  if (keyMap[key]) {
    const [oldNs = ns, oldPath = ""] = keyMap[key].split(":")
    return { ns: oldNs, path: oldPath.split(".") }
  }
  for (const [pattern, target] of Object.entries(keyMap)) {
    if (!pattern.endsWith(".*") || !key.startsWith(pattern.slice(0, -1)))
      continue
    const [oldNs = ns, oldPrefix = ""] = target.slice(0, -2).split(":")
    const rest = key.slice(pattern.length - 1).split(".")
    return { ns: oldNs, path: [...oldPrefix.split("."), ...rest] }
  }
  return { ns, path }
}

/** Translation for one English leaf, or undefined when it can't be reused. */
function lookup(lang: string, ns: string, path: string[], english: string) {
  const from = source(ns, path)
  const oldEnglish = get(legacy("en", from.ns), from.path)
  if (oldEnglish !== english) return undefined
  const value = get(legacy(lang, from.ns), from.path)
  return typeof value === "string" ? value : undefined
}

/** Mirrors the English shape; arrays only carry over when every item does. */
function translate(
  lang: string,
  ns: string,
  en: Node,
  existing: Node | undefined,
  path: string[]
): Node | undefined {
  if (typeof en === "string") {
    if (typeof existing === "string") return existing
    return lookup(lang, ns, path, en)
  }
  if (Array.isArray(en)) {
    const items = en.map((item, i) =>
      translate(
        lang,
        ns,
        item,
        Array.isArray(existing) ? existing[i] : undefined,
        [...path, String(i)]
      )
    )
    return items.every((i) => i !== undefined) ? (items as Node) : undefined
  }

  const out: Catalog = {}
  const prior =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? existing
      : {}
  const plurals = new Set<string>()
  for (const [key, value] of Object.entries(en)) {
    const base = key.replace(PLURAL, "")
    if (base !== key) {
      plurals.add(base)
      continue
    }
    const result = translate(lang, ns, value, prior[key], [...path, key])
    if (result !== undefined) out[key] = result
  }

  // plural forms differ per language, so copy the whole group when English matches
  for (const base of plurals) {
    const forms = Object.keys(en).filter((k) => k.replace(PLURAL, "") === base)
    const already = Object.keys(prior).filter(
      (k) => k.replace(PLURAL, "") === base
    )
    if (already.length) {
      for (const k of already) out[k] = prior[k] as Node
      continue
    }
    const from = source(ns, [...path, base])
    const sameEnglish = forms.every(
      (f) =>
        get(legacy("en", from.ns), [
          ...from.path.slice(0, -1),
          `${from.path.at(-1) ?? ""}${f.slice(base.length)}`,
        ]) === en[f]
    )
    if (!sameEnglish) continue
    const parent = get(legacy(lang, from.ns), from.path.slice(0, -1))
    if (!parent || typeof parent !== "object" || Array.isArray(parent)) continue
    for (const [k, v] of Object.entries(parent)) {
      if (k.replace(PLURAL, "") === from.path.at(-1) && typeof v === "string") {
        out[`${base}${k.slice(from.path.at(-1)?.length ?? 0)}`] = v
      }
    }
  }
  return Object.keys(out).length ? out : undefined
}

const namespaces = readdirSync(join(TARGET, "en"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5))

let written = 0
for (const lang of LOCALES) {
  if (lang === "en") continue
  for (const ns of namespaces) {
    const en = readJson(join(TARGET, "en", `${ns}.json`)) ?? {}
    const file = join(TARGET, lang, `${ns}.json`)
    const result = translate(lang, ns, en, readJson(file), [])
    if (!result || dryRun) continue
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `${JSON.stringify(result, null, 2)}\n`)
    written++
  }
}

const readiness = readinessFrom(
  readCatalogs(TARGET),
  Object.fromEntries(
    Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
  )
)
console.log(`${dryRun ? "would write" : "wrote"} ${written} catalog file(s)\n`)
for (const [page, locales] of readiness) {
  console.log(
    `${page.padEnd(10)} ${String(locales.length).padStart(2)}/${LOCALES.length}  ${locales.join(" ")}`
  )
}
