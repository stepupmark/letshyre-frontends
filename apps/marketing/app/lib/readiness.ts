import type { Locale } from "@workspace/i18n"
import { computeReadiness } from "@workspace/i18n/node"

import { PAGES, type PageId, pageNamespaces } from "./pages.ts"

/** Build-time only: the locales each page ships in. */
export function readyLocales(localesDir: string): Map<PageId, Locale[]> {
  return computeReadiness({
    localesDir,
    pages: Object.fromEntries(
      Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
    ),
  }) as Map<PageId, Locale[]>
}

/** Every `/<lang><path>` whose catalogs are complete. */
export function readyPaths(localesDir: string): string[] {
  return [...readyLocales(localesDir)].flatMap(([id, locales]) =>
    locales.map((lang) => `/${lang}${PAGES[id].path}`)
  )
}
