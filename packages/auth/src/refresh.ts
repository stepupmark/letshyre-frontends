import { clearSession, getRefreshToken, saveTokens } from "./session.ts"

export interface RefresherOptions {
  baseUrl: string
  timeoutMs?: number
  /** Called once when a signed-in session could not be refreshed. */
  onExpired?: () => void
  fetch?: typeof fetch
}

/** Concurrent 401s share one refresh call; the rotated refresh token is saved. */
export function createRefresher({
  baseUrl,
  timeoutMs = 15_000,
  onExpired,
  fetch: fetchImpl = (...args) => globalThis.fetch(...args),
}: RefresherOptions): () => Promise<boolean> {
  const root = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  const endpoint = new URL("user/v1/login_refresh/", root)
  let inflight: Promise<boolean> | null = null

  async function run() {
    const refresh = getRefreshToken()
    if (!refresh) return false
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh_token: refresh }),
        signal: AbortSignal.timeout(timeoutMs),
      })
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
    inflight ??= run().finally(() => {
      inflight = null
    })
    return inflight
  }
}
