import type { Route } from "./+types/dashboard"
import { requireAdmin, UserMenu } from "@/features/auth"
import { candidateSearch } from "@/features/candidates"
import { jobSearch } from "@/features/jobs"
import { AppShell } from "@/features/shell"

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireAdmin]

export const handle = { breadcrumb: "Dashboard" }

const searches = [candidateSearch, jobSearch]

export default function Dashboard() {
  return <AppShell account={<UserMenu />} searches={searches} />
}
