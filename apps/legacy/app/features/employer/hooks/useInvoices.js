import { STALE_TIME } from "@/lib/queryClient";
import { useQuery, keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getInvoices } from "@/features/employer/services/invoices.service";
import { queryKeys } from "@/lib/queryKeys";

export const FIRST_PAGE = 1;

// Shared with the route prefetch so the keys match.
export const invoicesQuery = (page = FIRST_PAGE) =>
  queryOptions({
    queryKey: queryKeys.payments.invoicesList(page),
    queryFn: () => getInvoices({ page }),
    staleTime: STALE_TIME.MEDIUM,
  });

export const useInvoices = (page) =>
  useQuery({
    ...invoicesQuery(page),
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
