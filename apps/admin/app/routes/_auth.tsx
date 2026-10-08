import { Outlet } from "react-router"
import type { Route } from "./+types/_auth"
import { AuthLayout, requireGuest } from "~/features/auth"

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [requireGuest]

export default function AuthRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}
