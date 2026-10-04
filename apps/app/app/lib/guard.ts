import { authRedirect, type Role } from "@workspace/auth"
import {
  redirect,
  redirectDocument,
  type MiddlewareFunction,
} from "react-router"

import { isLive } from "./live-routes"

/** Redirect within the app, or a full load when the target is on legacy or marketing. */
const go = (to: string) => (isLive(to) ? redirect(to) : redirectDocument(to))

/** clientMiddleware for a protected branch. */
export const guard =
  (roles: Role[] = []): MiddlewareFunction<Response> =>
  async ({ request }, next) => {
    const to = authRedirect(new URL(request.url), { roles })
    if (to) throw go(to)
    return next()
  }
