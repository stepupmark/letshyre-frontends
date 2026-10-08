import { clearSession, SIGN_IN } from "@workspace/auth"

import { queryClient } from "@/lib/query/query-client"

export type SessionEndReason = "expired" | "idle" | "forbidden"

// tokens saved before the admin moved to @workspace/auth's keys
try {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
} catch {
  // no storage, nothing to clean up
}

let ending = false

/** Clears the session and leaves for sign-in; later calls are ignored. */
export function endSession(reason?: SessionEndReason) {
  if (ending) return
  ending = true
  clearSession()
  queryClient.clear()
  window.location.replace(reason ? `${SIGN_IN}?reason=${reason}` : SIGN_IN)
}
