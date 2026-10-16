import { type Locale, localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import {
  BookOpenCheckIcon,
  BotMessageSquareIcon,
  WorkflowIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation } from "react-router"

import { usePublished } from "@/hooks/use-published"
import { PAGES } from "@/lib/pages"

const PRODUCT_ITEMS = [
  {
    id: "howItWorks",
    label: "nav.howItWorks",
    description: "nav.howItWorksDesc",
    icon: WorkflowIcon,
    path: "",
    hash: "how-it-works",
  },
  {
    id: "interviewGuide",
    label: "nav.interviewGuide",
    description: "nav.interviewGuideDesc",
    icon: BotMessageSquareIcon,
    path: PAGES.interview.path,
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

export const NAV_ITEMS = [
  { id: "pricing", label: "nav.pricing", path: "/pricing" },
  { id: "about", label: "nav.about", path: "/about" },
  { id: "contact", label: "nav.contact", path: "/contact" },
] as const

export type NavItem =
  (typeof PRODUCT_ITEMS)[number] | (typeof NAV_ITEMS)[number]

export const navHref = (lang: Locale, item: NavItem) =>
  "hash" in item
    ? `${localePath(lang, item.path)}#${item.hash}`
    : localePath(lang, item.path)

function useSectionInView(id: string, enabled: boolean) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const section = enabled ? document.getElementById(id) : null
    if (!section) return
    // counts while the section fills the top of the screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting))
      },
      { rootMargin: "0px 0px -60% 0px" }
    )
    observer.observe(section)
    return () => {
      observer.disconnect()
    }
  }, [id, enabled])

  return enabled && inView
}

/**
 * aria-current for a nav item: `page` for the current page, `location` while its home
 * section is on screen. The prerender sees `/en/pricing/`, so a trailing slash is ignored
 * to keep the hydrated markup identical.
 */
export function useCurrent() {
  const lang = useLocale()
  const pathname = useLocation().pathname.replace(/(.)\/$/, "$1")
  const sectionInView = useSectionInView(
    "how-it-works",
    pathname === localePath(lang)
  )

  return (item: NavItem): "page" | "location" | undefined => {
    if ("hash" in item) return sectionInView ? "location" : undefined
    return localePath(lang, item.path) === pathname ? "page" : undefined
  }
}
