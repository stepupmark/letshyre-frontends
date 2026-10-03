import { DEFAULT_LOCALE, type Locale } from "./config.ts"
import type { Catalog, Messages } from "./create-i18n.ts"

type CatalogFiles = Record<string, () => Promise<Catalog>>

/**
 * Wraps `import.meta.glob("./locales/*\/*.json", { import: "default" })` so a route can
 * load just the namespaces it needs. English is loaded alongside as the fallback.
 */
export function createCatalogLoader(files: CatalogFiles) {
  const byId = new Map<string, () => Promise<Catalog>>()
  for (const [path, load] of Object.entries(files)) {
    const match = /([^/]+)\/([^/]+)\.json$/.exec(path)
    if (match) byId.set(`${match[1]}/${match[2]}`, load)
  }

  return async function loadMessages(
    lang: Locale,
    namespaces: readonly string[]
  ): Promise<Messages> {
    const langs = lang === DEFAULT_LOCALE ? [lang] : [lang, DEFAULT_LOCALE]
    const messages: Messages = {}

    await Promise.all(
      langs.flatMap((l) =>
        namespaces.map(async (ns) => {
          const load = byId.get(`${l}/${ns}`)
          if (!load) {
            if (l === DEFAULT_LOCALE)
              throw new Error(`i18n: no catalog for ${l}/${ns}`)
            return
          }
          ;(messages[l] ??= {})[ns] = await load()
        })
      )
    )
    return messages
  }
}
