import { useRouteLoaderData } from "react-router"

import type { PageId } from "@/lib/pages"

/** Whether a page is published in the current locale, for links to pages that aren't everywhere. */
export function usePublished() {
  const published =
    useRouteLoaderData<{ published?: PageId[] }>("routes/_site")?.published ??
    []
  return (id: PageId) => published.includes(id)
}
