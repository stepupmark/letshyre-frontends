import { type Catalog, type Locale, type Messages } from "@workspace/i18n"
import { type Catalogs, readinessFrom } from "@workspace/i18n/node"

import { PAGES, type PageId, pageNamespaces, withoutReplaced } from "./pages"

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

/** The locales each page's copy is complete in; the blog's narrows further to where posts ship. */
export const catalogReadiness = withoutReplaced(
  readinessFrom(
    catalogs,
    Object.fromEntries(
      Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
    )
  ) as Map<PageId, Locale[]>
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
