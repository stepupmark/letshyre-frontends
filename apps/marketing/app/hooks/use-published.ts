import type { Locale } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { useRouteLoaderData } from "react-router"

import type { PageId } from "@/lib/pages"

/** Whether a page is published in the current locale, for links to pages that aren't everywhere. */
export function usePublished() {
  const lang = useLocale()
  const site = useRouteLoaderData<{ published?: PageId[] }>("routes/_site")
  const notFound = useRouteLoaderData<{
    publishedByLocale?: Partial<Record<Locale, PageId[]>>
  }>("routes/404")
  const published = site?.published ?? notFound?.publishedByLocale?.[lang] ?? []
  return (id: PageId) => published.includes(id)
}
