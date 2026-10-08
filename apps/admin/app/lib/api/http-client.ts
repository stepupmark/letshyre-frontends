import { createRefresher } from "@workspace/auth"
import axios from "axios"

import { api } from "@/lib/api"
import { env } from "@/lib/env"
import { endSession } from "@/lib/session"

import { toApiError } from "./api-error"

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean
  }
}

// TODO(admin): goes when every service calls `api`; borrows its session until then
const refresh = createRefresher({
  baseUrl: env.VITE_API_BASE_URL,
  onExpired: () => {
    endSession("expired")
  },
})
const authHeader = () => api.prepare("").headers.Authorization

export const http = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
})

http.interceptors.request.use((config) => {
  const auth = authHeader()
  if (auth) config.headers.Authorization = auth
  return config
})

http.interceptors.response.use(undefined, async (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    const config = error.config
    if (config && !config._retry) {
      config._retry = true
      const now = authHeader()
      const rotated = now && now !== config.headers.Authorization
      if (rotated || (await refresh())) return http(config)
    }
  }
  throw toApiError(error)
})
