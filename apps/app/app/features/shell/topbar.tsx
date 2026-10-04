import { useTranslation } from "@workspace/i18n/react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Kbd } from "@workspace/ui/components/kbd"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { useQuery } from "@tanstack/react-query"
import { Coins, Search } from "lucide-react"
import { useMatches } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { creditsQuery } from "@/lib/credits"
import { locale } from "@/lib/i18n"

import type { Area, NavItem } from "./nav"

/** Set on a route as `handle: { crumb: "jobs" }`, a key under shell `nav`. */
interface Crumb {
  crumb?: NavItem["key"]
}

export function Topbar({
  area,
  onSearch,
}: {
  area: Area
  onSearch: () => void
}) {
  const { t } = useTranslation("shell")
  const crumbs = useMatches()
    .map((match) => (match.handle as Crumb | undefined)?.crumb)
    .filter((crumb) => crumb !== undefined)

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <SidebarTrigger className="-ms-1" aria-label={t("toggleSidebar")} />
      <Separator
        orientation="vertical"
        className="me-1 data-vertical:h-4 data-vertical:self-center"
      />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.slice(-1).map((crumb) => (
            <BreadcrumbItem key={crumb} className="min-w-0">
              <BreadcrumbPage className="truncate">
                {t(`nav.${crumb}`)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ms-auto flex items-center gap-2">
        <Button
          variant="outline"
          className="w-9 justify-center px-0 text-muted-foreground md:w-64 md:justify-start md:px-3"
          onClick={onSearch}
          aria-label={t("search.button")}
        >
          <Search />
          <span className="hidden truncate md:inline">
            {t("search.button")}
          </span>
          <Kbd className="ms-auto hidden text-foreground md:inline-flex">
            {t("search.shortcut")}
          </Kbd>
        </Button>
        {area === "employer" && <Credits />}
      </div>
    </header>
  )
}

function Credits() {
  const { t } = useTranslation("shell")
  const { data } = useQuery(creditsQuery())
  const count = data?.available_credits

  return (
    <AppLink
      to="/employer/billing"
      className={buttonVariants({ variant: "ghost", className: "gap-1.5" })}
      aria-label={
        count === undefined ? t("credits.add") : t("credits.label", { count })
      }
    >
      <Coins />
      {count !== undefined && <AnimatedNumber value={count} locale={locale} />}
    </AppLink>
  )
}
