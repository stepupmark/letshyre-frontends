import { useCreditPriceQuery } from "@/features/pricing/queries/pricing.queries";
import { usePriceStatus } from "@/features/pricing/hooks/usePriceStatus";
import { priceForCredits } from "@/features/pricing/lib/plans";

export function useTopUpPrices() {
  const query = useCreditPriceQuery();
  const status = usePriceStatus(query);
  const costPerCredit = query.data?.costPerCredit ?? null;

  return {
    status,
    priceOf: (credits) => (costPerCredit === null ? null : priceForCredits(credits, costPerCredit)),
    retry: () => query.refetch(),
    isRetrying: query.isFetching && !query.isPending,
  };
}
