import axios from "axios";
import { env } from "~/lib/env";
import { refreshAccessToken } from "~/lib/auth/refresh";
import { endSession } from "~/lib/auth/session";
import { tokenStore } from "~/lib/auth/token-store";
import { toApiError } from "./api-error";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Public endpoints (login, OTP): no bearer token and no refresh on 401. */
    skipAuth?: boolean;
    /** Sends the token but never tries to refresh it (logout). */
    skipRefresh?: boolean;
    _retry?: boolean;
  }
}

export const http = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token && !config.skipAuth)
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(undefined, async (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    const config = error.config;
    if (config && !config.skipAuth && !config.skipRefresh && !config._retry) {
      config._retry = true;
      const failedToken =
        String(config.headers.Authorization ?? "").replace(/^Bearer /, "") ||
        null;
      const token = await refreshAccessToken(failedToken);
      if (token) return http(config);
      endSession("expired");
    }
  }
  throw toApiError(error);
});
