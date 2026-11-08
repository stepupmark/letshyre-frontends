import { localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { BookOpenCheckIcon, BotMessageSquareIcon } from "lucide-react"
import { useLocation } from "react-router"

import { usePublished } from "@/hooks/use-published"
import { PAGES } from "@/lib/pages"

const PRODUCT_ITEMS = [
  {
    id: "interviewGuide",
    label: "nav.interviewGuide",
    description: "nav.interviewGuideDesc",
    icon: BotMessageSquareIcon,
    path: PAGES.interview.path,
    page: "interview",
  },
  {
    id: "candidateGuide",
    label: "nav.candidateGuide",
    description: "nav.candidateGuideDesc",
    icon: BotMessageSquareIcon,
    path: PAGES.candidateGuide.path,
    page: "candidateGuide",
  },
  {
    id: "employerGuide",
    label: "nav.employerGuide",
    description: "nav.employerGuideDesc",
    icon: BookOpenCheckIcon,
    path: PAGES.employerGuide.path,
    page: "employerGuide",
  },
] as const

/** Product links, minus pages not published in this locale. */
export function useProductItems() {
  const published = usePublished()
  return PRODUCT_ITEMS.filter(
    (item) => !("page" in item) || published(item.page)
  )
}

const NAV_ITEMS = [
  { id: "pricing", label: "nav.pricing", path: "/pricing" },
  { id: "blog", label: "nav.blog", path: PAGES.blog.path, page: "blog" },
  { id: "about", label: "nav.about", path: "/about" },
  { id: "contact", label: "nav.contact", path: "/contact" },
] as const

export function useNavItems() {
  const published = usePublished()
  return NAV_ITEMS.filter((item) => !("page" in item) || published(item.page))
}

export type NavItem =
  (typeof PRODUCT_ITEMS)[number] | (typeof NAV_ITEMS)[number]

/**
 * aria-current for a nav item. The prerender sees `/en/pricing/`, so a trailing slash is
 * ignored to keep the hydrated markup identical.
 */
export function useCurrent() {
  const lang = useLocale()
  const pathname = useLocation().pathname.replace(/(.)\/$/, "$1")

  return (item: NavItem): "page" | undefined =>
    localePath(lang, item.path) === pathname ? "page" : undefined
}
