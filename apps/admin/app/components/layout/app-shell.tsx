import { useSession } from "@workspace/auth/react"
import { NavigationProgress } from "@workspace/blocks/navigation-progress"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useEffect } from "react"
import { Outlet } from "react-router"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { useIdleTimeout } from "@/hooks/use-idle-timeout"
import { endSession } from "@/lib/session"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

const IDLE_TIMEOUT_MS = 30 * 60_000

export function AppShell() {
  useIdleTimeout(IDLE_TIMEOUT_MS, () => {
    endSession("idle")
  })
  // signed out in another tab
  const signedOut = useSession().status === "guest"
  useEffect(() => {
    if (signedOut) endSession()
  }, [signedOut])

  return (
    <SidebarProvider>
      <SkipLink>Skip to content</SkipLink>
      <NavigationProgress label="Loading page" />
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-screen-2xl flex-1 p-4 md:p-6"
        >
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
