import axios from "axios";
import { localePath } from "@/i18n/config";
import { preferredLocale } from "@/i18n/hooks";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuth,
} from "@/lib/authStorage";

/* ===============================
   AXIOS INSTANCE
================================ */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // https://api.letshyre.com
  headers: {
    "Content-Type": "application/json",
  },
});

const publicEndpoints = [
  "/user/v1/login/",
  "/user/v1/login",
  "/user/v1/login_refresh/",
  "/user/v1/login_refresh",
  "/commonapp/v1/send_otp/",
  "/commonapp/v1/verify_otp/",
  "/user/v1/public/shared-candidate/",
  "/finances/v1/credit_plans/public/",
  "/payment/v1/public/calculate-token-cost/",
];

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    const isPublic = publicEndpoints.some((url) => config.url?.includes(url));

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

const REFRESH_TIMEOUT_MS = 15_000;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const skipRefreshUrls = [
      "/user/v1/login/",
      "/user/v1/login",
      "/user/v1/login_refresh/",
      "/user/v1/login_refresh",
      "/user/v1/logout/",
    ];

    const isAuthCall = skipRefreshUrls.some((url) =>
      originalRequest.url?.includes(url),
    );

    if (isAuthCall) {
      return Promise.reject(error);
    }

    // authOptional: a public page calling an endpoint that also works when
    // signed in. A guest has nothing to refresh, so let the page handle the 401.
    if (
      error.response?.status === 401 &&
      originalRequest.authOptional &&
      !getRefreshToken()
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest._retry = true;
              originalRequest.headers.Authorization = `Bearer ${token}`;

              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // Bounded so a refresh that never answers can't strand every request
        // parked in failedQueue behind an isRefreshing flag that stays true.
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}user/v1/login_refresh/`,
          { refresh_token: refreshToken },
          { timeout: REFRESH_TIMEOUT_MS },
        );

        const response = res.data;
        const data = response.data || response;

        const newAccessToken = data.access_token || data.access || data.token;

        if (!newAccessToken) {
          throw new Error("No new access token returned");
        }

        setAccessToken(newAccessToken);

        // ── Save the NEW refresh token if the server rotates it ──
        // Django Simple JWT (ROTATE_REFRESH_TOKENS=True) invalidates the old
        // refresh token and issues a new one. Failing to save it means the
        // next refresh will use a blacklisted token and always fail.
        const newRefreshToken = data.refresh_token || data.refresh;
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (import.meta.env.DEV) {
          console.error("TOKEN REFRESH FAILED:", refreshError);
        }

        clearAuth();

        // Full reload to drop every cached query and store, but back to the
        // visitor's own language — "/" would strand an ar/ur session in en.
        // A public page stays put and shows its signed-out state instead.
        if (!originalRequest.authOptional) {
          window.location.href = localePath(preferredLocale());
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
