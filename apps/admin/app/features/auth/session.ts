import { HttpError } from "@workspace/api"
import {
  authRedirect,
  clearSession,
  guestRedirect,
  readSession,
  ROLES,
} from "@workspace/auth"
import {
  redirect,
  type DataStrategyResult,
  type MiddlewareFunction,
} from "react-router"

import { queryClient } from "@/lib/query/query-client"
import { endSession } from "@/lib/session"

import { authQueries } from "./queries/auth.queries"

type ClientMiddleware = MiddlewareFunction<Record<string, DataStrategyResult>>

// a candidate or employer session left by another app on the same origin
// (e.g. localhost:5173) counts as signed out here
function dropNonAdminSession() {
  const session = readSession()
  if (session.status === "signed-in" && session.role !== ROLES.admin)
    clearSession()
}

export const requireAdmin: ClientMiddleware = async ({ request }, next) => {
  dropNonAdminSession()
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
  dropNonAdminSession()
  const to = guestRedirect()
  if (to) throw redirect(to)
  return next()
}
