import { HttpError } from "@workspace/api"
import { authRedirect, guestRedirect, ROLES } from "@workspace/auth"
import {
  redirect,
  type DataStrategyResult,
  type MiddlewareFunction,
} from "react-router"

import { queryClient } from "@/lib/query/query-client"
import { endSession } from "@/lib/session"

import { authQueries } from "./queries/auth.queries"

type ClientMiddleware = MiddlewareFunction<Record<string, DataStrategyResult>>

export const requireAdmin: ClientMiddleware = async ({ request }, next) => {
  const to = authRedirect(new URL(request.url), { roles: [ROLES.admin] })
  if (to) throw redirect(to)
  try {
    await queryClient.query({ ...authQueries.me(), staleTime: "static" })
  } catch (error) {
    // the token is fine but admin access was taken away
    if (error instanceof HttpError && error.status === 403)
      endSession("forbidden")
    throw error
  }
  return next()
}

export const requireGuest: ClientMiddleware = async (_, next) => {
  const to = guestRedirect()
  if (to) throw redirect(to)
  return next()
}
