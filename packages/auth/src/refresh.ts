import { HttpError, NetworkError } from "@workspace/api"

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./session.ts"

export interface RefresherOptions {
  baseUrl: string
  timeoutMs?: number
  /** Called once when a signed-in session could not be refreshed. */
  onExpired?: () => void
  fetch?: typeof fetch
}

const isTransient = (status: number) =>
  status === 408 || status === 429 || status >= 500

// the backend rotates refresh tokens and rejects the old one, so tabs take turns
function withTabLock<T>(run: () => Promise<T>): Promise<T> {
  return typeof navigator !== "undefined" && "locks" in navigator
    ? navigator.locks.request("letshyre:token-refresh", run)
    : run()
}

/**
 * Concurrent 401s share one refresh call; the rotated refresh token is saved.
 * Resolves false when the session is over; rejects, keeping the session, when the network or
 * server failed.
 */
export function createRefresher({
  baseUrl,
  timeoutMs = 15_000,
  onExpired,
  fetch: fetchImpl = (...args) => globalThis.fetch(...args),
}: RefresherOptions): () => Promise<boolean> {
  const root = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  const endpoint = new URL("user/v1/login_refresh/", root)
  let inflight: Promise<boolean> | null = null

  async function run(failedAccess: string | null) {
    // another tab refreshed while this one waited for the lock
    const current = getAccessToken()
    if (current && current !== failedAccess) return true
    const refresh = getRefreshToken()
    if (!refresh) return false

    let response: Response
    try {
      response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh_token: refresh }),
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (error) {
      // offline or timed out: the refresh token may still be good, so keep the session
      throw new NetworkError("Token refresh failed", { cause: error })
    }
    if (isTransient(response.status)) throw new HttpError(response.status)

    try {
      if (!response.ok) throw new Error(`refresh returned ${response.status}`)
      const json = (await response.json()) as Record<string, unknown>
      const data = (json.data ?? json) as Record<string, unknown>
      const access = data.access_token ?? data.access ?? data.token
      const rotated = data.refresh_token ?? data.refresh
      if (typeof access !== "string")
        throw new Error("refresh returned no token")
      saveTokens(access, typeof rotated === "string" ? rotated : undefined)
      return true
    } catch {
      clearSession()
      onExpired?.()
      return false
    }
  }

  return () => {
    const failedAccess = getAccessToken()
    inflight ??= withTabLock(() => run(failedAccess)).finally(() => {
      inflight = null
    })
    return inflight
  }
}
