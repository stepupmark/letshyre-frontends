import { useEffect } from "react"
import { Outlet } from "react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useIdleTimeout } from "@/hooks/use-idle-timeout"
import { endSession, listenForRemoteSessionEnd } from "@/lib/auth/session"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"
import { NavigationProgress } from "./navigation-progress"

const IDLE_TIMEOUT_MS = 30 * 60_000

export function AppShell() {
  useIdleTimeout(IDLE_TIMEOUT_MS, () => {
    endSession("idle")
  })
  useEffect(() => listenForRemoteSessionEnd(), [])

  return (
    <SidebarProvider>
      <NavigationProgress />
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main className="mx-auto w-full max-w-screen-2xl flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
