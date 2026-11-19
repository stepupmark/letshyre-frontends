import { href, redirect } from "react-router"

import type { Route } from "./+types/role-home"

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  return redirect(
    new URL(request.url).pathname.startsWith("/employer")
      ? href("/employer/dashboard")
      : href("/employee/jobs")
  )
}

export default function RoleHome() {
  return null
}
