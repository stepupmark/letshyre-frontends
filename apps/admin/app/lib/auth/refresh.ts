import axios from "axios";
import { env } from "~/lib/env";
import { tokenStore } from "./token-store";

type RefreshResponse = {
  access_token?: string;
  refresh_token?: string;
};

let pending: Promise<string | null> | null = null;

function withTabLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("letshyre:token-refresh", fn);
  }
  return fn();
}

async function rotate(failedToken: string | null): Promise<string | null> {
  // another tab may have refreshed while this one waited for the lock
  const current = tokenStore.getAccessToken();
  if (current && current !== failedToken) return current;

  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<RefreshResponse>(`${env.VITE_API_BASE_URL}user/v1/login_refresh/`, {
      refresh_token: refreshToken,
    });
    if (!data.access_token) return null;
    // the backend rotates refresh tokens on every use, so the new one must be stored
    tokenStore.setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
    return data.access_token;
  } catch {
    return null;
  }
}

/** Returns a fresh access token, or null when the session can't be renewed. */
export function refreshAccessToken(failedToken: string | null) {
  pending ??= withTabLock(() => rotate(failedToken)).finally(() => {
    pending = null;
  });
  return pending;
}
