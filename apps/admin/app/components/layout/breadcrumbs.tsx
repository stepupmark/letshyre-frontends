import { Fragment } from "react";
import { Link, useMatches } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export type RouteHandle = {
  breadcrumb?: string;
};

export function Breadcrumbs() {
  const crumbs = useMatches()
    .map((match) => ({
      label: (match.handle as RouteHandle | undefined)?.breadcrumb,
      path: match.pathname,
    }))
    .filter((crumb): crumb is { label: string; path: string } =>
      Boolean(crumb.label),
    );

  if (!crumbs.length) return null;

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
  );
}
