import type { Env } from "./env.schema"
import { indexable } from "./indexable"

const raw = import.meta.env as unknown as Record<string, string | undefined>

// validated in vite.config.ts, so zod stays out of the client bundle
export const env = {
  ...(raw as unknown as Env),
  VITE_COOKIE_DOMAIN:
    raw.VITE_COOKIE_DOMAIN === "" ? undefined : raw.VITE_COOKIE_DOMAIN,
  VITE_LANGUAGE_SWITCHER: raw.VITE_LANGUAGE_SWITCHER === "true",
  VITE_INDEXABLE: indexable(raw.VITE_ENV ?? "", raw.VITE_INDEXABLE),
} satisfies Env
