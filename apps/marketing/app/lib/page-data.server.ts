import { isLocale } from "@workspace/i18n"
import { data } from "react-router"

import { loadMessages, readyLocales } from "./messages.server"
import { LAYOUT_NAMESPACES, PAGES, type PageId } from "./pages"

const notFound = () => data(null, { status: 404 })

/** Loader for the site layout. Runs at build time only. */
export function layoutData(lang: string | undefined) {
  if (!isLocale(lang)) throw notFound()
  return { lang, messages: loadMessages(lang, LAYOUT_NAMESPACES) }
}

/** Loader for a page route: its copy and the locales it's published in. */
export function pageData(lang: string | undefined, id: PageId) {
  const locales = readyLocales(id)
  if (!isLocale(lang) || !locales.includes(lang)) throw notFound()
  return { messages: loadMessages(lang, PAGES[id].namespaces), locales }
}
