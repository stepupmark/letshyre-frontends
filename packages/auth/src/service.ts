import { HttpError, ResponseShapeError, type HttpClient } from "@workspace/api"

import {
  clearSession,
  getRefreshToken,
  readSession,
  saveTokens,
  saveUser,
  ROLES,
  type Role,
  type User,
} from "./session.ts"

export class AccountInactiveError extends Error {
  override name = "AccountInactiveError"
}

/** A valid account whose role doesn't belong in this app. */
export class RoleNotAllowedError extends Error {
  override name = "RoleNotAllowedError"
}

const record = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {}

/** Signs in and stores the session. The returned role decides where to go. */
export async function login(
  client: HttpClient,
  credentials: { email: string; password: string },
  { roles = [ROLES.employer, ROLES.candidate] }: { roles?: Role[] } = {}
): Promise<User> {
  const json = record(
    await client.post("user/v1/login/", credentials, { auth: false })
  )
  if (json.success === false) throw new HttpError(200, json)
  const data = record(json.data ?? json)

  const access = data.access_token ?? data.access ?? data.token
  if (typeof access !== "string")
    throw new ResponseShapeError("Login returned no token")
  if (data.is_active === false)
    throw new AccountInactiveError("Account inactive")

  const refresh = data.refresh_token ?? data.refresh
  saveTokens(access, typeof refresh === "string" ? refresh : undefined)
  saveUser(data)

  const session = readSession()
  if (session.status !== "signed-in") {
    clearSession()
    throw new ResponseShapeError("Login returned an unknown role")
  }
  if (!roles.includes(session.role)) {
    clearSession()
    throw new RoleNotAllowedError(`${session.role} can't sign in here`)
  }
  return session.user
}

/** Revokes the refresh token on the server, then clears the session regardless. */
export async function logout(client: HttpClient) {
  const refresh = getRefreshToken()
  try {
    if (refresh)
      await client.post("user/v1/logout/", { refresh_token: refresh })
  } catch {
    /* the local session goes either way */
  } finally {
    clearSession()
  }
}
