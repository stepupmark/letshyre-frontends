import { z } from "zod"

const origins = z
  .string()
  .optional()
  .transform((v) => v?.split(/\s+/).filter(Boolean) ?? [])
  .pipe(z.array(z.url()))

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
  // where uploaded photos, resumes and recordings are served from
  VITE_MEDIA_ORIGINS: origins,
})

export type Env = z.output<typeof schema>

export const parseEnv = (raw: Record<string, string | undefined>): Env =>
  schema.parse(raw)
