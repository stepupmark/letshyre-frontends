#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs"
import { extname, join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { parseArgs } from "node:util"

import { DEFAULT_LOCALE, LOCALES } from "./config.ts"
import type { Catalog } from "./create-i18n.ts"
import { flatten, findUnusedKeys } from "./node/checks.ts"
import { checkAll, readCatalogs, readinessFrom } from "./node/readiness.ts"

const USAGE = `usage: lh-i18n <command> --locales <dir> [options]

  check                        placeholder, plural and stale-key errors (missing keys are fine)
  report                       translated share per locale
  readiness --pages <module>   ready locales per page (module exports PAGES, LAYOUT_NAMESPACES)
  unused --src <dir>           English keys no source file mentions`

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    locales: { type: "string" },
    pages: { type: "string" },
    src: { type: "string" },
  },
})

const [command] = positionals
if (!command || !values.locales) {
  console.error(USAGE)
  process.exit(2)
}

const catalogs = readCatalogs(resolve(values.locales))
const english = catalogs.get(DEFAULT_LOCALE) ?? new Map<string, Catalog>()

switch (command) {
  case "check": {
    const errors = checkAll(catalogs).filter((i) => i.kind !== "missing")
    for (const i of errors)
      console.error(`${i.kind.padEnd(12)} ${i.locale}/${i.ns}  ${i.key}`)
    console.log(
      errors.length
        ? `\n${errors.length} problem(s)`
        : "i18n: catalogs are consistent"
    )
    process.exit(errors.length ? 1 : 0)
    break
  }

  case "report": {
    const total = [...english.values()].reduce((n, c) => n + flatten(c).size, 0)
    const missing = new Map<string, number>()
    for (const i of checkAll(catalogs)) {
      if (i.kind === "missing")
        missing.set(i.locale, (missing.get(i.locale) ?? 0) + 1)
    }
    for (const locale of LOCALES) {
      const pct = total
        ? Math.round(((total - (missing.get(locale) ?? 0)) / total) * 100)
        : 100
      console.log(`${locale.padEnd(3)} ${String(pct).padStart(3)}%`)
    }
    break
  }

  case "readiness": {
    if (!values.pages) {
      console.error(USAGE)
      process.exit(2)
    }
    const mod = (await import(pathToFileURL(resolve(values.pages)).href)) as {
      PAGES: Record<string, { namespaces: readonly string[] }>
      LAYOUT_NAMESPACES?: readonly string[]
    }
    const pages = Object.fromEntries(
      Object.entries(mod.PAGES).map(([id, page]) => [
        id,
        [...(mod.LAYOUT_NAMESPACES ?? []), ...page.namespaces],
      ])
    )
    for (const [page, locales] of readinessFrom(catalogs, pages)) {
      console.log(
        `${page.padEnd(16)} ${String(locales.length).padStart(2)}/${LOCALES.length}  ${locales.join(" ")}`
      )
    }
    break
  }

  case "unused": {
    if (!values.src) {
      console.error(USAGE)
      process.exit(2)
    }
    const sources = walk(resolve(values.src)).map((f) =>
      readFileSync(f, "utf8")
    )
    const unused = findUnusedKeys(english, sources)
    for (const key of unused) console.log(key)
    console.log(
      unused.length
        ? `\n${unused.length} unused key(s)`
        : "i18n: no unused keys"
    )
    process.exit(unused.length ? 1 : 0)
    break
  }

  default:
    console.error(USAGE)
    process.exit(2)
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      return entry.name === "node_modules" ? [] : walk(path)
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : []
  })
}
