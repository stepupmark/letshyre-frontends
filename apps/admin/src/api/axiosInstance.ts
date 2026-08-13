import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const PUBLIC_ENDPOINTS = [
  "user/v1/login/",
  "user/v1/login_refresh/",
  "commonapp/v1/send_otp/",
  "commonapp/v1/verify_otp/",
];

const SKIP_REFRESH_ENDPOINTS = [...PUBLIC_ENDPOINTS, "user/v1/logout/"];

function isPublicEndpoint(url?: string): boolean {
  return !!url && PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function shouldSkipRefresh(url?: string): boolean {
  return (
    !!url && SKIP_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint))
  );
}

let isRefreshing = false;
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function subscribeTokenRefresh(
  resolve: (token: string) => void,
  reject: (err: unknown) => void,
) {
  refreshSubscribers.push({ resolve, reject });
}

function onRefreshSuccess(newToken: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(newToken));
  refreshSubscribers = [];
}

function onRefreshFailure(err: unknown) {
  refreshSubscribers.forEach(({ reject }) => reject(err));
  refreshSubscribers = [];
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("auth_user");
  // Hard redirect so the router loader re-evaluates the auth guard.
  window.location.href = "/";
}

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers && !isPublicEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Auth/OTP/logout calls: a 401 here is a real credential/OTP failure
    // or an already-dead session — never try to refresh out of it.
    if (shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (newToken: string) => {
            originalRequest._retry = true;
            if (originalRequest.headers) {
              (
                originalRequest.headers as Record<string, string>
              ).Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          },
          (err: unknown) => reject(err),
        );
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const { data } = await axios.post<RefreshResponse>(
        `${BASE_URL}user/v1/login_refresh/`,
        { refresh_token: refreshToken },
      );

      const newAccessToken = data.access_token;
      if (!newAccessToken) {
        throw new Error("No new access token returned");
      }
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

      // This backend rotates refresh tokens on every use and blacklists
      // the old one — persist the new one or the next refresh will fail.
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      }

      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      onRefreshSuccess(newAccessToken);

      if (originalRequest.headers) {
        (originalRequest.headers as Record<string, string>).Authorization =
          `Bearer ${newAccessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      onRefreshFailure(refreshError);
      if (import.meta.env.DEV) {
        console.error("Token refresh failed:", refreshError);
      }
      // Reset before navigating so nothing observes a stuck isRefreshing.
      isRefreshing = false;
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
