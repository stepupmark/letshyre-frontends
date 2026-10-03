import { QueryClient } from "@tanstack/react-query";

// Named staleTime tiers so a query's freshness reads as intent, not a magic
// number, and is identical whether the loader prefetch or the component's
// useQuery sets it. Import in both.
export const STALE_TIME = {
  SHORT: 2 * 60 * 1000, // 2m  — dashboards, credits, invoices: changes often
  MEDIUM: 5 * 60 * 1000, // 5m  — profile, jobs, team: changes occasionally
  LONG: 30 * 60 * 1000, // 30m — reference lists that rarely move
  STATIC: 60 * 60 * 1000, // 1h — effectively-constant lookups (industries)
};

// For endpoints where 404 means "empty" (scorecard list/detail): don't retry a
// 404 — the UI renders its empty state from it — but do retry transient failures.
export const retryExcept404 = (failureCount, error) =>
  error?.response?.status === 404 ? false : failureCount < 3;

const defaultOptions = {
  queries: {
    staleTime: STALE_TIME.SHORT,
    // Keep unused entries cached so a route revisit within the window is a hit
    // and the prefetch isn't paid twice.
    gcTime: 5 * 60 * 1000, // 5m
    retry: 1,
    // Dashboard app: don't refetch on window focus (freshness comes from
    // staleTime + invalidation), but do on reconnect.
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
};

function createQueryClient() {
  return new QueryClient({ defaultOptions });
}

let browserQueryClient;

// Browser: a shared singleton, so loader prefetches and component reads hit the
// same cache. Server: a fresh client per call — a module singleton would leak
// one user's cached data into another's response across concurrent requests.
// Only the prerender uses the server path today, but this is correct if ssr is
// ever enabled.
export function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient();

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

// Named export because clientLoaders (browser-only) import it directly.
export const queryClient = getQueryClient();
