import { type Catalog, type Locale, type Messages } from "@workspace/i18n"
import { type Catalogs, readinessFrom } from "@workspace/i18n/node"

import { PAGES, type PageId, pageNamespaces } from "./pages"

const files = import.meta.glob<Catalog>("../locales/*/*.json", {
  eager: true,
  import: "default",
})

const catalogs: Catalogs = new Map()
for (const [path, catalog] of Object.entries(files)) {
  const [, lang = "", ns = ""] = /([^/]+)\/([^/]+)\.json$/.exec(path) ?? []
  const byNs = catalogs.get(lang as Locale) ?? new Map<string, Catalog>()
  byNs.set(ns, catalog)
  catalogs.set(lang as Locale, byNs)
}

const readiness = readinessFrom(
  catalogs,
  Object.fromEntries(
    Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
  )
)

export function loadMessages(
  lang: Locale,
  namespaces: readonly string[]
): Messages {
  const byNs = catalogs.get(lang)
  return {
    [lang]: Object.fromEntries(
      namespaces.flatMap((ns) => {
        const catalog = byNs?.get(ns)
        return catalog ? [[ns, catalog]] : []
      })
    ),
  }
}

/** Locales the page is published in, for hreflang and the language switcher. */
export const readyLocales = (id: PageId): Locale[] => readiness.get(id) ?? []
