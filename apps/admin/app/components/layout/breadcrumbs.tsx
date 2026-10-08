import { Fragment } from "react"
import { Link, useMatches } from "react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface RouteHandle {
  breadcrumb?: string
  /** For flat detail routes whose list page isn't a parent match. */
  parent?: { label: string; path: string }
}

interface Crumb {
  label: string
  path: string
}

export function Breadcrumbs() {
  const crumbs = useMatches().flatMap((match): Crumb[] => {
    const handle = match.handle as RouteHandle | undefined
    if (!handle?.breadcrumb) return []
    const own = { label: handle.breadcrumb, path: match.pathname }
    return handle.parent ? [handle.parent, own] : [own]
  })

  if (!crumbs.length) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem
              className={
                index < crumbs.length - 1 ? "hidden md:block" : undefined
              }
            >
              {index < crumbs.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
