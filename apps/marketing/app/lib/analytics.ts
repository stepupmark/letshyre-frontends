import { configureAnalytics } from "@workspace/analytics"

import { env } from "./env"

export const analyticsEnabled = env.VITE_ENV === "production"

configureAnalytics({
  enabled: analyticsEnabled,
  metaPixelId: env.VITE_META_PIXEL_ID,
  cookieDomain: env.VITE_COOKIE_DOMAIN,
})
