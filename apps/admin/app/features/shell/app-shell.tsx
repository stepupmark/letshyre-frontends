import { useSession } from "@workspace/auth/react"
import { NavigationProgress } from "@workspace/blocks/navigation-progress"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useEffect, type ReactNode } from "react"
import { Outlet } from "react-router"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { useIdleTimeout } from "@/hooks/use-idle-timeout"
import { endSession } from "@/lib/session"
import type { SearchSource } from "@/lib/search"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

const IDLE_TIMEOUT_MS = 30 * 60_000

export function AppShell({
  account,
  searches,
}: {
  account: ReactNode
  searches: SearchSource[]
}) {
  useIdleTimeout(IDLE_TIMEOUT_MS, () => {
    endSession("idle")
  })
  // signed out in another tab
  const signedOut = useSession().status === "guest"
  useEffect(() => {
    if (signedOut) endSession()
  }, [signedOut])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <SkipLink>Skip to content</SkipLink>
        <NavigationProgress label="Loading page" />
        <AppSidebar />
        {/* SidebarInset is the <main> landmark */}
        <SidebarInset className="min-w-0">
          <AppHeader account={account} searches={searches} />
          <div
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-screen-2xl flex-1 p-4 outline-none md:p-6"
          >
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
