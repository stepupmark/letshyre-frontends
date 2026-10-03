import { type Locale, localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { useLocation } from "react-router"

export const NAV_ITEMS = [
  { id: "howItWorks", label: "nav.howItWorks", path: "", hash: "how-it-works" },
  {
    id: "aiInterview",
    label: "nav.aiInterview",
    path: "/how-it-works-interview",
  },
  { id: "pricing", label: "nav.pricing", path: "/pricing" },
  { id: "about", label: "nav.about", path: "/about" },
  { id: "contact", label: "nav.contact", path: "/contact" },
] as const

export type NavItem = (typeof NAV_ITEMS)[number]

export const navHref = (lang: Locale, item: NavItem) =>
  "hash" in item
    ? `${localePath(lang, item.path)}#${item.hash}`
    : localePath(lang, item.path)

/**
 * Which nav item is the current page. Anchors into home never are. The prerender sees
 * `/en/pricing/`, so a trailing slash is ignored to keep the hydrated markup identical.
 */
export function useIsCurrent() {
  const lang = useLocale()
  const pathname = useLocation().pathname.replace(/(.)\/$/, "$1")
  return (item: NavItem) =>
    !("hash" in item) && localePath(lang, item.path) === pathname
}
