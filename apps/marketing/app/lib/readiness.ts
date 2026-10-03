import { computeReadiness } from "@workspace/i18n/node"

import { PAGES, type PageId, pageNamespaces } from "./pages.ts"

/** Build-time only: every `/<lang><path>` whose catalogs are complete. */
export function readyPaths(localesDir: string): string[] {
  const ready = computeReadiness({
    localesDir,
    pages: Object.fromEntries(
      Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
    ),
  })
  return [...ready].flatMap(([id, locales]) =>
    locales.map((lang) => `/${lang}${PAGES[id as PageId].path}`)
  )
}
