import { useSyncExternalStore } from "react"

import { readSession, subscribe, type Session } from "./session.ts"

const guest = (): Session => ({ status: "guest" })

/** The current session, updated on sign-in, sign-out and changes in other tabs. */
export function useSession(): Session {
  return useSyncExternalStore(subscribe, readSession, guest)
}
