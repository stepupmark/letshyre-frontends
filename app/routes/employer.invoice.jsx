import { queryClient } from "@/lib/queryClient";
import { invoicesQuery } from "@/features/employer/hooks/useInvoices";
import { authedPrefetch } from "@/loaders/prefetch";
import { noindexMeta } from "@/lib/routeMeta";

export { Invoice as default } from "@/features/employer/Invoice";

export const clientLoader = authedPrefetch(async () => {
  queryClient.prefetchQuery(invoicesQuery());
  return null;
});

export const meta = noindexMeta("employerInvoices");
