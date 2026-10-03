import type { Locale } from "@workspace/i18n"
import { useMatches } from "react-router"

/** Locales the current page is published in, plus its path relative to the locale. */
export function usePageLocales(): { locales: Locale[]; path: string } {
  const page = useMatches().at(-1)
  const data = page?.loaderData as { locales?: Locale[] } | undefined
  const [, , ...rest] = (page?.pathname ?? "/").split("/")
  const path = rest.length ? `/${rest.join("/")}` : ""
  return { locales: data?.locales ?? [], path }
}
