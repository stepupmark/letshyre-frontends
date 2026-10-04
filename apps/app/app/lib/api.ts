import { createAuthedClient } from "@workspace/auth"

import { env } from "./env"

export const api = createAuthedClient({
  baseUrl: env.VITE_API_BASE_URL,
  // the session is cleared by now; SessionGate asks for a sign-in over the open page
  onSessionExpired: () => undefined,
})
