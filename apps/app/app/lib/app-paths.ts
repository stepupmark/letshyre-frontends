import type { href } from "react-router"

// the app has app.letshyre.ai to itself, so every path on this origin is its own; marketing pages
// are absolute URLs from site.ts
const SELF = "https://self.invalid"

/** True for a path this app serves, so it can navigate there without a page load. */
export const isAppPath = (path: string) =>
  path.startsWith("/") && new URL(path, SELF).origin === SELF

/** A route pattern from routes.ts, e.g. "/employer/jobs/:jobId". */
export type RoutePattern = Parameters<typeof href>[0]
