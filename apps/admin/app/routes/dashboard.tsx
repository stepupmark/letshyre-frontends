import type { Route } from "./+types/dashboard"
import { AppShell } from "@/components/layout/app-shell"
import { requireAdmin } from "@/features/auth"

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireAdmin]

export const handle = { breadcrumb: "Dashboard" }

export default AppShell
