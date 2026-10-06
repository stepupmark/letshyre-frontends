import type { href } from "react-router"

// the prefixes the server sends to this app; everything else is the marketing site
const APP_PATH =
  /^\/(employer|employee|get-started|forgot-password|shared-scorecard|sign-in)(\/|$|[?#])/

/** True for a path this app serves, so it can navigate there without a page load. */
export const isAppPath = (path: string) => APP_PATH.test(path)

/** A route pattern from routes.ts, e.g. "/employer/jobs/:jobId". */
export type RoutePattern = Parameters<typeof href>[0]
