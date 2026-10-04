/**
 * Paths this app serves; everything else is still the legacy app.
 * nginx reads the same list (build/live-routes.map), so adding a path here moves it.
 * `:param` matches one segment.
 */
export const LIVE_ROUTES = ["/employer", "/employer/dashboard", "/employee"]

const patterns = LIVE_ROUTES.map(
  (route) => new RegExp(`^${route.replace(/:[^/]+/g, "[^/]+")}/?$`)
)

export const isLive = (path: string) =>
  patterns.some((pattern) => pattern.test(path.split(/[?#]/)[0] ?? path))
