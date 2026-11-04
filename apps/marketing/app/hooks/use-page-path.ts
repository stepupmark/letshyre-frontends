import { DEFAULT_LOCALE, localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"

import { PAGES, type PageId, REPLACED_BY } from "@/lib/pages"

import { usePublished } from "./use-published"

/**
 * The URL to link a page at, so links never go through a redirect: its successor once that
 * ships in this locale, and the English page where this locale doesn't have it yet.
 */
export function usePagePath() {
  const lang = useLocale()
  const published = usePublished()

  return (id: PageId) => {
    const next = REPLACED_BY[id]
    const page = next && published(next) ? next : id
    return localePath(published(page) ? lang : DEFAULT_LOCALE, PAGES[page].path)
  }
}
