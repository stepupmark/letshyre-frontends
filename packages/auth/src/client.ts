import { createHttpClient, type HttpClientOptions } from "@workspace/api"

import { createRefresher } from "./refresh.ts"
import { clearSession, getAccessToken, getRefreshToken } from "./session.ts"

export interface AuthedClientOptions extends Omit<
  HttpClientOptions,
  "getAuthHeader" | "refreshAuth" | "onUnauthorized"
> {
  /** The session ended: send the user to sign in. Not called for guests. */
  onSessionExpired: () => void
}

export function createAuthedClient({
  onSessionExpired,
  ...options
}: AuthedClientOptions) {
  return createHttpClient({
    ...options,
    getAuthHeader: () => {
      const token = getAccessToken()
      return token ? `Bearer ${token}` : null
    },
    refreshAuth: createRefresher({
      baseUrl: options.baseUrl,
      fetch: options.fetch,
      onExpired: onSessionExpired,
    }),
    onUnauthorized: () => {
      // still 401 after a good refresh; a failed refresh has already cleaned up
      if (!getRefreshToken()) return
      clearSession()
      onSessionExpired()
    },
  })
}
