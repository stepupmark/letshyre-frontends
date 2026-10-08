import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { Breadcrumbs } from "./breadcrumbs"
import type { ReactNode } from "react"
import type { SearchSource } from "@/lib/search"
import { CommandPalette } from "./command-palette"

export function AppHeader({
  account,
  searches,
}: {
  account: ReactNode
  searches: SearchSource[]
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <SidebarTrigger className="-ms-1" />
      <Separator
        orientation="vertical"
        className="me-2 data-vertical:h-4 data-vertical:self-center"
      />
      <Breadcrumbs />
      <div className="ms-auto flex items-center gap-1">
        <CommandPalette sources={searches} />
        <ThemeToggle />
        {account}
      </div>
    </header>
  )
}
