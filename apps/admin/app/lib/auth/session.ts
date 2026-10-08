import { queryClient } from "@/lib/query/query-client"
import { tokenStore } from "./token-store"

export type SessionEndReason = "logout" | "expired" | "idle"

const CHANNEL_NAME = "letshyre:auth"
let channel: BroadcastChannel | null = null

function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined")
    return null
  channel ??= new BroadcastChannel(CHANNEL_NAME)
  return channel
}

function leave(reason: SessionEndReason) {
  tokenStore.clear()
  queryClient.clear()
  window.location.replace(
    reason === "logout" ? "/login" : `/login?reason=${reason}`
  )
}

export function endSession(reason: SessionEndReason) {
  getChannel()?.postMessage(reason)
  leave(reason)
}

/** Signs this tab out when another tab ends the session. */
export function listenForRemoteSessionEnd() {
  const ch = getChannel()
  if (!ch) return () => undefined
  const onMessage = (event: MessageEvent<SessionEndReason>) => {
    leave(event.data)
  }
  ch.addEventListener("message", onMessage)
  return () => {
    ch.removeEventListener("message", onMessage)
  }
}
