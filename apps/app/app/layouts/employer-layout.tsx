import { ROLES } from "@workspace/auth"
import { Outlet } from "react-router"

import { guard } from "@/lib/guard"

export const clientMiddleware = [guard([ROLES.employer])]

export default function EmployerLayout() {
  return <Outlet />
}
