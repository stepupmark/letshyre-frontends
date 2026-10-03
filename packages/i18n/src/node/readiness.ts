import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "../config.ts"
import type { Catalog } from "../create-i18n.ts"
import { BLOCKING, checkCatalog, type Issue } from "./checks.ts"

export type Catalogs = Map<Locale, Map<string, Catalog>>

/** Reads `<dir>/<locale>/<namespace>.json`. */
export function readCatalogs(localesDir: string): Catalogs {
  const catalogs: Catalogs = new Map()
  for (const locale of readdirSync(localesDir)) {
    if (!isLocale(locale)) continue
    const namespaces = new Map<string, Catalog>()
    for (const file of readdirSync(join(localesDir, locale))) {
      if (!file.endsWith(".json")) continue
      const path = join(localesDir, locale, file)
      try {
        namespaces.set(
          file.slice(0, -5),
          JSON.parse(readFileSync(path, "utf8")) as Catalog
        )
      } catch (error) {
        throw new Error(`i18n: can't parse ${path}`, { cause: error })
      }
    }
    catalogs.set(locale, namespaces)
  }
  return catalogs
}

export function checkAll(catalogs: Catalogs): Issue[] {
  const english = catalogs.get(DEFAULT_LOCALE) ?? new Map<string, Catalog>()
  return LOCALES.flatMap((locale) =>
    [...english].flatMap(([ns, catalog]) =>
      checkCatalog(
        locale,
        ns,
        catalog,
        locale === DEFAULT_LOCALE ? catalog : catalogs.get(locale)?.get(ns)
      )
    )
  )
}

/** A page is ready in a locale when all of its namespaces pass the blocking checks. */
export function readinessFrom(
  catalogs: Catalogs,
  pages: Readonly<Record<string, readonly string[]>>
): Map<string, Locale[]> {
  const blocked = new Set(
    checkAll(catalogs)
      .filter((i) => i.locale !== DEFAULT_LOCALE && BLOCKING.has(i.kind))
      .map((i) => `${i.locale}/${i.ns}`)
  )
  const english = catalogs.get(DEFAULT_LOCALE)

  return new Map(
    Object.entries(pages).map(([page, namespaces]) => {
      for (const ns of namespaces) {
        if (!english?.has(ns))
          throw new Error(`i18n: page "${page}" uses unknown namespace "${ns}"`)
      }
      const ready = LOCALES.filter(
        (locale) =>
          locale === DEFAULT_LOCALE ||
          namespaces.every((ns) => !blocked.has(`${locale}/${ns}`))
      )
      return [page, ready]
    })
  )
}

export function computeReadiness({
  localesDir,
  pages,
}: {
  localesDir: string
  pages: Readonly<Record<string, readonly string[]>>
}): Map<string, Locale[]> {
  return readinessFrom(readCatalogs(localesDir), pages)
}
