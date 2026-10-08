import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumbs } from "./breadcrumbs"
import { CommandPalette } from "./command-palette"
import { UserMenu } from "./user-menu"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <SidebarTrigger className="-ms-1" />
      <Separator
        orientation="vertical"
        className="me-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumbs />
      <div className="ms-auto flex items-center gap-1">
        <CommandPalette />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
