import { useMemo } from "react";
import { usePublicPlansQuery } from "@/features/pricing/queries/pricing.queries";
import { usePriceStatus } from "@/features/pricing/hooks/usePriceStatus";
import { PLANS, mergePlans } from "@/features/pricing/lib/plans";

export function usePlans() {
  const query = usePublicPlansQuery();
  const status = usePriceStatus(query);
  const plans = useMemo(() => (query.data ? mergePlans(query.data) : PLANS), [query.data]);

  return {
    status,
    plans,
    retry: () => query.refetch(),
    isRetrying: query.isFetching && !query.isPending,
  };
}
