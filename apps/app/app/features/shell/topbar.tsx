import { useTranslation } from "@workspace/i18n/react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { Kbd } from "@workspace/ui/components/kbd"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { useQuery } from "@tanstack/react-query"
import { Coins, Search } from "lucide-react"
import { useRef, type ReactNode, type Ref } from "react"
import { href, useMatches } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { Tip } from "@/components/tip"
import { creditsQuery } from "@/lib/credits"
import { locale } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

import type { Area, NavItem } from "./nav"
import { dismissTip, useCurrentTip } from "./tips"

/** Set on a route as `handle: { crumb: "jobs" }`, a key under shell `nav`. */
interface Crumb {
  crumb?: NavItem["key"]
}

export function Topbar({
  area,
  actions,
  onSearch,
}: {
  area: Area
  actions?: ReactNode
  onSearch: () => void
}) {
  const { t } = useTranslation("shell")
  const crumbs = useMatches()
    .map((match) => (match.handle as Crumb | undefined)?.crumb)
    .filter((crumb) => crumb !== undefined)
  const searchRef = useRef<HTMLButtonElement>(null)
  const creditsRef = useRef<HTMLAnchorElement>(null)
  const tip = useCurrentTip(
    area === "employer" ? ["search", "credits"] : ["search"]
  )

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
          ref={searchRef}
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
        {actions}
        {area === "employer" && <Credits ref={creditsRef} />}
      </div>
      <Tip
        anchor={searchRef}
        open={tip === "search"}
        title={t("tips.search.title")}
        body={t("tips.search.body")}
        onDismiss={() => {
          dismissTip("search")
        }}
      />
      <Tip
        anchor={creditsRef}
        open={tip === "credits"}
        title={t("tips.credits.title")}
        body={t("tips.credits.body")}
        onDismiss={() => {
          dismissTip("credits")
        }}
      />
    </header>
  )
}

function Credits({ ref }: { ref: Ref<HTMLAnchorElement> }) {
  const { t } = useTranslation("shell")
  const { data } = useQuery(creditsQuery())
  const count = data?.available_credits

  return (
    <AppLink
      ref={ref}
      to={href("/employer/billing")}
      className={buttonLink({ variant: "ghost", className: "gap-1.5" })}
      aria-label={
        count === undefined ? t("credits.add") : t("credits.label", { count })
      }
    >
      <Coins />
      {count !== undefined && <AnimatedNumber value={count} locale={locale} />}
    </AppLink>
  )
}
