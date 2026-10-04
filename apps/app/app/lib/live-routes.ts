/**
 * Paths this app serves; everything else is still the legacy app. The build publishes
 * this list to nginx (build/live-routes.map) and to legacy (live-routes.json), so adding
 * or removing a path here moves it in one app release. `:param` matches one segment.
 */
// only finished pages go here; the dashboards are placeholders until their slices ship
export const LIVE_ROUTES = ["/employer/release-check"]

export const routePattern = (route: string) =>
  `^${route.replace(/:[^/]+/g, "[^/]+")}/?$`

const patterns = LIVE_ROUTES.map((route) => new RegExp(routePattern(route)))

export const isLive = (path: string) =>
  patterns.some((pattern) => pattern.test(path.split(/[?#]/)[0] ?? path))
