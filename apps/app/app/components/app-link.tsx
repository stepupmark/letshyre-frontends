import type { Ref } from "react"
import { Link, type LinkProps } from "react-router"

import { isAppPath } from "@/lib/app-paths"

/** Client navigation inside this app, a full page load for marketing pages. */
export function AppLink({
  to,
  ...props
}: LinkProps & { to: string; ref?: Ref<HTMLAnchorElement> }) {
  const inApp = isAppPath(to)
  return (
    <Link to={to} reloadDocument={!inApp} viewTransition={inApp} {...props} />
  )
}
