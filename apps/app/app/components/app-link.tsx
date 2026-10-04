import { Link, type LinkProps } from "react-router"

import { isLive } from "@/lib/live-routes"

/** Client navigation inside this app, a full page load for pages still on legacy. */
export function AppLink({ to, ...props }: LinkProps & { to: string }) {
  const live = isLive(to)
  return (
    <Link to={to} reloadDocument={!live} viewTransition={live} {...props} />
  )
}
