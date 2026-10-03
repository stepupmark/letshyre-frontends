import { useQuery, queryOptions } from "@tanstack/react-query";
import { fetchSharedScorecard } from "@/features/scorecard-sharing/services/sharedScorecard.service";
import { queryKeys } from "@/lib/queryKeys";
import { isValidShareId } from "@/lib/shareUrl";

const cacheKey = (shareId) => `sharedScorecard:${shareId}`;

// Disabling React Query's own refetches (below) only protects a single SPA
// session — a plain browser refresh creates a fresh QueryClient and would
// hit the API again, burning another one of the link's limited views. This
// session-scoped cache lets a refresh replay the already-spent view instead.
const readCachedBody = (shareId) => {
  try {
    const raw = sessionStorage.getItem(cacheKey(shareId));
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

const writeCachedBody = (shareId, body) => {
  try {
    sessionStorage.setItem(cacheKey(shareId), JSON.stringify(body));
  } catch {
    /* storage unavailable (private browsing, quota) — refresh will re-fetch
       and spend another view for this visitor, but nothing else breaks */
  }
};

export const sharedScorecardQuery = (shareId) =>
  queryOptions({
    queryKey: queryKeys.sharedScorecard(shareId),
    queryFn: async () => {
      const res = await fetchSharedScorecard(shareId);
      writeCachedBody(shareId, res.data);
      return res;
    },
    initialData: () => {
      const body = readCachedBody(shareId);
      return body ? { data: body } : undefined;
    },
    enabled: isValidShareId(shareId),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useSharedScorecard = (shareId) => useQuery(sharedScorecardQuery(shareId));

const ERROR_PATTERNS = [
  { key: "limit", match: /view limit|maximum view/i },
  { key: "expired", match: /expired/i },
  { key: "invalid", match: /not found|invalid/i },
];

// Both failure responses are plain HTTP 404s — the only signal is `message`.
// Falls back to a generic reason rather than guessing when the copy changes.
export const resolveShareError = (error) => {
  const message = error?.response?.data?.message || "";
  const found = ERROR_PATTERNS.find(({ match }) => match.test(message));
  return found?.key || "unavailable";
};
