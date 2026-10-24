import { useTranslation } from "@workspace/i18n/react"
import { ChevronLeft } from "lucide-react"
import { useLocation, useMatches } from "react-router"

import { AppLink } from "@/components/app-link"

import { findNav, type Area, type Crumb } from "../lib/nav"

/** Phones get the section name; deeper pages link back to it. */
export function SectionTitle({ area }: { area: Area }) {
  const { t } = useTranslation("shell")
  const { pathname } = useLocation()
  const key = useMatches()
    .map((match) => (match.handle as Crumb | undefined)?.crumb)
    .findLast((crumb) => crumb !== undefined)
  if (!key) return null

  const found = findNav(area, key)
  const label = t(`nav.${key}`)

  if (!found || found.item.to === pathname)
    return (
      <p
        key={key}
        className="min-w-0 animate-in truncate text-sm font-medium duration-200 fade-in motion-reduce:animate-none md:hidden"
      >
        {label}
      </p>
    )

  return (
    <AppLink
      key={key}
      to={found.item.to}
      aria-label={t("backTo", { page: label })}
      className="group flex min-w-0 animate-in items-center gap-1 rounded-md py-1 pe-1.5 text-sm font-medium text-muted-foreground duration-200 outline-none fade-in hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:animate-none"
    >
      <ChevronLeft
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:translate-x-0.5"
      />
      <span className="truncate">{label}</span>
    </AppLink>
  )
}
