import { z } from "zod"

import { indexable } from "./indexable.ts"

const schema = z
  .object({
    VITE_ENV: z.enum(["production", "staging", "development"]),
    VITE_SITE_URL: z.url(),
    VITE_APP_URL: z.url(),
    VITE_API_BASE_URL: z.url(),
    VITE_META_PIXEL_ID: z.string().optional(),
    // shared by letshyre.ai and app.letshyre.ai; empty on localhost
    VITE_COOKIE_DOMAIN: z
      .string()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    // a production build on a beta host is published content that search engines must not index
    VITE_INDEXABLE: z.enum(["true", "false", ""]).optional(),
  })
  .refine((env) => env.VITE_ENV !== "production" || env.VITE_META_PIXEL_ID, {
    message: "VITE_META_PIXEL_ID is required in production",
    path: ["VITE_META_PIXEL_ID"],
  })
  .refine(
    (env) => env.VITE_INDEXABLE !== "true" || env.VITE_ENV === "production",
    {
      message: "only a production build can be indexable",
      path: ["VITE_INDEXABLE"],
    }
  )
  .transform((env) => ({
    ...env,
    VITE_INDEXABLE: indexable(env.VITE_ENV, env.VITE_INDEXABLE),
  }))

export type Env = z.output<typeof schema>

export const parseEnv = (raw: Record<string, string | undefined>): Env =>
  schema.parse(raw)
