import type { Env } from "./env.schema"

// validated in vite.config.ts, so zod stays out of the client bundle
export const env = {
  ...(import.meta.env as unknown as Env),
  VITE_COOKIE_DOMAIN:
    (import.meta.env.VITE_COOKIE_DOMAIN as string) || undefined,
} satisfies Env
