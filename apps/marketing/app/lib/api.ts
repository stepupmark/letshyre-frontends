import { createHttpClient } from "@workspace/api"

import { env } from "./env"

export const api = createHttpClient({ baseUrl: env.VITE_API_BASE_URL })
