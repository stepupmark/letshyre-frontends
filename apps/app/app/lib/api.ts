import { createAuthedClient, PUBLIC_HOME } from "@workspace/auth"

import { env } from "./env"

export const api = createAuthedClient({
  baseUrl: env.VITE_API_BASE_URL,
  onSessionExpired: () => {
    // a full load also drops every cached query
    window.location.assign(PUBLIC_HOME)
  },
})
