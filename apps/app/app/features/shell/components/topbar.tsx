import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Kbd } from "@workspace/ui/components/kbd"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { Search } from "lucide-react"
import { useRef, type ReactNode } from "react"

import { Tip } from "@/components/tip"

import { isMac, modKey } from "../lib/keys"
import type { Area } from "../lib/nav"
import { dismissTip, useCurrentTip } from "../lib/tips"
import { Breadcrumbs } from "./breadcrumbs"
import { CreditsButton } from "./credits-button"

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
  const searchRef = useRef<HTMLButtonElement>(null)
  const creditsRef = useRef<HTMLAnchorElement>(null)
  const shortcut = isMac ? "⌘K" : t("search.shortcut")
  const tip = useCurrentTip(
    area === "employer" ? ["search", "credits"] : ["search"]
  )

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/80 md:px-6">
      <SidebarTrigger className="-ms-1" aria-label={t("toggleSidebar")} />
      <Separator
        orientation="vertical"
        className="me-1 max-md:hidden data-vertical:h-4 data-vertical:self-center"
      />
      <Breadcrumbs area={area} />
      <div className="ms-auto flex items-center gap-1.5">
        <Button
          ref={searchRef}
          variant="ghost"
          className="w-9 justify-center px-0 text-muted-foreground md:w-64 md:justify-start md:border-border md:px-3 lg:w-80"
          onClick={onSearch}
          aria-label={t("search.button")}
        >
          <Search />
          <span className="hidden truncate md:inline">
            {t("search.button")}
          </span>
          <Kbd className="ms-auto hidden text-foreground md:inline-flex">
            {shortcut}
          </Kbd>
        </Button>
        {actions}
        {area === "employer" && <CreditsButton ref={creditsRef} />}
      </div>
      <Tip
        anchor={searchRef}
        open={tip === "search"}
        title={t("tips.search.title")}
        body={t("tips.search.body")}
        keys={[modKey, "K"]}
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
