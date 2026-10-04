import { NavigationProgress } from "@workspace/blocks/navigation-progress"
import { SkipLink } from "@workspace/blocks/skip-link"
import { dirFor } from "@workspace/i18n"
import { useTranslation } from "@workspace/i18n/react"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { useEffect, useRef, useState } from "react"
import { Outlet, useLocation } from "react-router"

import { locale } from "@/lib/i18n"

import { AppSidebar } from "./app-sidebar"
import { CommandPalette } from "./command-palette"
import type { Area } from "./nav"
import { ShortcutsDialog } from "./shortcuts-dialog"
import { Topbar } from "./topbar"

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

export function DashboardShell({ area }: { area: Area }) {
  const { t } = useTranslation("shell")
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const { pathname } = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((open) => !open)
      } else if (event.key === "?" && !typing(event.target)) {
        setShortcutsOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  // after a client navigation, screen readers and keyboard users start at the new page's title
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    document
      .querySelector<HTMLElement>("#main h1")
      ?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <SidebarProvider>
      <SkipLink>{t("skipToContent")}</SkipLink>
      <NavigationProgress label={t("loading")} />
      <AppSidebar
        area={area}
        side={dirFor(locale) === "rtl" ? "right" : "left"}
        onOpenShortcuts={() => {
          setShortcutsOpen(true)
        }}
      />
      {/* SidebarInset is the <main> landmark */}
      <SidebarInset>
        <Topbar
          area={area}
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
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </SidebarProvider>
  )
}
