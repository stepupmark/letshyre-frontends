import { createAuthedClient } from "@workspace/auth"

import { env } from "@/lib/env"
import { endSession } from "@/lib/session"

export const api = createAuthedClient({
  baseUrl: env.VITE_API_BASE_URL,
  onSessionExpired: () => {
    endSession("expired")
  },
})
