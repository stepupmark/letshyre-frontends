import { useTranslation } from "@workspace/i18n/react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { useLocation, useMatches } from "react-router"

import { AppLink } from "@/components/app-link"

import { findNav, type Area, type Crumb } from "../lib/nav"

/** Section, then page; the page is a link back when you're deeper than it. */
export function Breadcrumbs({ area }: { area: Area }) {
  const { t } = useTranslation("shell")
  const { pathname } = useLocation()
  const key = useMatches()
    .map((match) => (match.handle as Crumb | undefined)?.crumb)
    .findLast((crumb) => crumb !== undefined)
  if (!key) return null

  const found = findNav(area, key)
  const label = t(`nav.${key}`)
  const onPage = !found || found.item.to === pathname

  return (
    <Breadcrumb className="min-w-0 max-md:hidden">
      <BreadcrumbList
        key={key}
        className="animate-in flex-nowrap duration-200 fade-in motion-reduce:animate-none"
      >
        {found && (
          <>
            <BreadcrumbItem>{t(`groups.${found.group.key}`)}</BreadcrumbItem>
            <BreadcrumbSeparator className="rtl:-scale-x-100" />
          </>
        )}
        <BreadcrumbItem className="min-w-0">
          {onPage ? (
            <BreadcrumbPage className="truncate font-medium">
              {label}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              className="truncate"
              render={<AppLink to={found.item.to} />}
            >
              {label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
