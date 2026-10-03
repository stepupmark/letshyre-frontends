import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getQuote } from "@/features/pricing/services/checkout.service";

const QUOTE_STALE_MS = 30_000;

// A 4xx (bad coupon, unknown plan, signed out) comes back the same on a retry.
export const retryQuote = (failureCount, error) => {
  const status = error?.response?.status;
  if (error?.name === "InvalidQuoteError" || (status >= 400 && status < 500)) return false;
  return failureCount < 2;
};

export const quoteQuery = (params) =>
  queryOptions({
    queryKey: queryKeys.pricing.quote(params),
    queryFn: ({ signal }) => getQuote(params, { signal }),
    staleTime: QUOTE_STALE_MS,
    retry: retryQuote,
  });
