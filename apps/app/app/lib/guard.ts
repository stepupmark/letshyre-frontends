import { authRedirect, type Role } from "@workspace/auth"
import { redirectDocument, type MiddlewareFunction } from "react-router"

/** clientMiddleware for a protected branch. */
export const guard =
  (roles: Role[] = []): MiddlewareFunction<Response> =>
  async ({ request }, next) => {
    const to = authRedirect(new URL(request.url), { roles })
    if (to) throw redirectDocument(to)
    return next()
  }
