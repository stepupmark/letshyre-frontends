import { STALE_TIME } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { getIndustries } from "@/services/industries.service";
import { queryKeys } from "@/lib/queryKeys";

// Single source of truth for the industries list. Always resolves to an array,
// so consumers can map over `data` directly.
export const useIndustries = () =>
  useQuery({
    queryKey: queryKeys.industries(),
    queryFn: getIndustries,
    placeholderData: [],
    staleTime: STALE_TIME.STATIC,
  });
