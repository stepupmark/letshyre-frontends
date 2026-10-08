import { z } from "zod"

const schema = z.object({
  VITE_API_BASE_URL: z.url(),
})

export type Env = z.output<typeof schema>

export const parseEnv = (
  raw: Record<string, string | undefined>,
  { production = false } = {}
): Env => {
  const env = schema.parse(raw)
  if (production && !env.VITE_API_BASE_URL.startsWith("https://")) {
    throw new Error("VITE_API_BASE_URL must use https in production builds")
  }
  return env
}
