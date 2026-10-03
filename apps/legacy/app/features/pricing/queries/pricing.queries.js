import { queryOptions, useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import { getCreditPrice, getPublicPlans } from "@/features/pricing/services/pricing.service";
import { priceErrorKind } from "@/features/pricing/lib/errorKind";

// Signing in or a fixed payload won't change on a retry, so only retry the rest.
export const retryPrice = (failureCount, error) => {
  const kind = priceErrorKind(error);
  return kind !== "auth" && kind !== "invalid" && failureCount < 2;
};

export const publicPlansQuery = () =>
  queryOptions({
    queryKey: queryKeys.pricing.plans(),
    queryFn: ({ signal }) => getPublicPlans({ signal }),
    staleTime: STALE_TIME.MEDIUM,
    retry: retryPrice,
  });

export const creditPriceQuery = () =>
  queryOptions({
    queryKey: queryKeys.pricing.creditPrice(),
    queryFn: ({ signal }) => getCreditPrice({ signal }),
    staleTime: STALE_TIME.MEDIUM,
    retry: retryPrice,
  });

export const usePublicPlansQuery = () => useQuery(publicPlansQuery());

export const useCreditPriceQuery = () => useQuery(creditPriceQuery());
