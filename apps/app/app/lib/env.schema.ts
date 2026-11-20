import { z } from "zod"

const schema = z.object({
  VITE_ENV: z.enum(["production", "staging", "development"]),
  VITE_SITE_URL: z.url(),
  VITE_APP_URL: z.url(),
  VITE_API_BASE_URL: z.url(),
  // shared by letshyre.ai and app.letshyre.ai; empty on localhost
  VITE_COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  // "true" shows the language menus; anything else hides them
  VITE_LANGUAGE_SWITCHER: z
    .enum(["true", "false", ""])
    .optional()
    .transform((v) => v === "true"),
})

export type Env = z.output<typeof schema>

export const parseEnv = (raw: Record<string, string | undefined>): Env =>
  schema.parse(raw)
