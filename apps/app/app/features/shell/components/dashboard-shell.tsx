import { NavigationProgress } from "@workspace/blocks/navigation-progress"
import { SkipLink } from "@workspace/blocks/skip-link"
import { dirFor } from "@workspace/i18n"
import { useTranslation } from "@workspace/i18n/react"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { useState, type ReactNode } from "react"
import { Outlet } from "react-router"

import { locale } from "@/lib/i18n"

import { useShellShortcuts } from "../hooks/use-shell-shortcuts"
import type { Area } from "../lib/nav"
import { AppSidebar } from "./app-sidebar"
import { CommandPalette } from "./command-palette"
import { ShortcutsDialog } from "./shortcuts-dialog"
import { Topbar } from "./topbar"

// shadcn writes this cookie on toggle but only reads it during SSR, which this app doesn't do
const sidebarWasOpen = () =>
  !document.cookie.split("; ").includes("sidebar_state=false")

export function DashboardShell({
  area,
  actions,
}: {
  area: Area
  actions?: ReactNode
}) {
  const { t } = useTranslation("shell")
  const [defaultOpen] = useState(sidebarWasOpen)
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  useShellShortcuts(setSearchOpen, setShortcutsOpen)
  const openShortcuts = () => {
    setShortcutsOpen(true)
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipLink>{t("skipToContent")}</SkipLink>
        <NavigationProgress label={t("loading")} />
        <AppSidebar
          area={area}
          side={dirFor(locale) === "rtl" ? "right" : "left"}
          onOpenShortcuts={openShortcuts}
        />
        {/* SidebarInset is the <main> landmark */}
        <SidebarInset className="min-w-0">
          <Topbar
            area={area}
            actions={actions}
            onSearch={() => {
              setSearchOpen(true)
            }}
          />
          <div
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none md:p-8 2xl:max-w-7xl"
          >
            <Outlet />
          </div>
        </SidebarInset>
        <CommandPalette
          area={area}
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onOpenShortcuts={openShortcuts}
        />
        <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      </SidebarProvider>
    </TooltipProvider>
  )
}
