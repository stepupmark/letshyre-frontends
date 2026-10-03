import { createHttpClient } from "@workspace/api"

import { env } from "@/lib/env"

export const apiClient = createHttpClient({ baseUrl: env.VITE_API_BASE_URL })
