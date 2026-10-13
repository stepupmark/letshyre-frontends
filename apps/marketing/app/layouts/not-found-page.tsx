import { dirFor, isLocale, type Locale } from "@workspace/i18n"
import { I18nProvider } from "@workspace/i18n/react"
import { useEffect, useState } from "react"

import { NotFound } from "@/features/not-found"
import common from "@/locales/en/common.json"
import seo from "@/locales/en/seo.json"

import { SiteChrome } from "./site-chrome"

interface Catalog {
  common: typeof common
  seo: typeof seo
}

const CATALOGS = import.meta.glob<Catalog[keyof Catalog]>(
  "../locales/*/{common,seo}.json",
  { import: "default" }
)

async function loadCatalog(lang: Locale): Promise<Catalog | null> {
  const load = (ns: keyof Catalog) =>
    CATALOGS[`../locales/${lang}/${ns}.json`]?.()
  const [c, s] = await Promise.all([load("common"), load("seo")])
  return c && s ? ({ common: c, seo: s } as Catalog) : null
}

/**
 * The 404 for URLs no route matches. One prerendered file serves them all, so it
 * starts in English and switches to the language in the URL once it runs.
 */
export function NotFoundPage() {
  const [locale, setLocale] = useState<{ lang: Locale; catalog: Catalog }>({
    lang: "en",
    catalog: { common, seo },
  })

  useEffect(() => {
    const lang = location.pathname.split("/")[1]
    if (!isLocale(lang) || lang === "en") return
    let live = true
    void loadCatalog(lang).then((catalog) => {
      if (!live || !catalog) return
      setLocale({ lang, catalog })
      document.documentElement.lang = lang
      document.documentElement.dir = dirFor(lang)
      document.title = catalog.seo.notFound.title
    })
    return () => {
      live = false
    }
  }, [])

  return (
    <I18nProvider
      lang={locale.lang}
      messages={{ [locale.lang]: { common: locale.catalog.common } }}
    >
      <SiteChrome>
        <NotFound />
      </SiteChrome>
    </I18nProvider>
  )
}
