// validated in vite.config.ts, so zod stays out of the client bundle
const raw = import.meta.env as unknown as Record<string, string | undefined>

export const env = {
  VITE_API_BASE_URL: raw.VITE_API_BASE_URL ?? "",
  VITE_SITE_URL: raw.VITE_SITE_URL ?? "",
  VITE_COOKIE_DOMAIN:
    raw.VITE_COOKIE_DOMAIN === "" ? undefined : raw.VITE_COOKIE_DOMAIN,
}
