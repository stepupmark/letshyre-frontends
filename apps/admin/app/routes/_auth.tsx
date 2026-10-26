import { Outlet } from "react-router"

import { AuthLayout, requireGuest } from "@/features/auth"

import type { Route } from "./+types/_auth"

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireGuest]

export default function AuthRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}
