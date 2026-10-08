// validated in vite.config.ts
const raw = import.meta.env as unknown as Record<string, string | undefined>
const api = raw.VITE_API_BASE_URL ?? ""

export const env = {
  VITE_API_BASE_URL: api.endsWith("/") ? api : `${api}/`,
}
