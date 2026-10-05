import { authRedirect, guestRedirect, type Role } from "@workspace/auth"
import {
  redirect,
  redirectDocument,
  type MiddlewareFunction,
} from "react-router"

import { isAppPath } from "./app-paths"

/** Redirect within the app, or a full load when the target is a marketing page. */
const go = (to: string) => (isAppPath(to) ? redirect(to) : redirectDocument(to))

/** clientMiddleware for a protected branch. */
export const guard =
  (roles: Role[] = []): MiddlewareFunction<Response> =>
  async ({ request }, next) => {
    const to = authRedirect(new URL(request.url), { roles })
    if (to) throw go(to)
    return next()
  }

/** clientMiddleware for sign-in and registration: signed-in users go home. */
export const guestOnly: MiddlewareFunction<Response> = async (_args, next) => {
  const to = guestRedirect()
  if (to) throw go(to)
  return next()
}
