import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";
import { queryClient } from "@/lib/queryClient";
import { creditPriceQuery, publicPlansQuery } from "@/features/pricing/queries/pricing.queries";

export { Billing as default } from "@/features/pricing/Billing";

export const handle = { i18n: ["pricing"] };
export const clientLoader = catalogLoader(handle.i18n, () => {
  void queryClient.prefetchQuery(publicPlansQuery());
  void queryClient.prefetchQuery(creditPriceQuery());
  return null;
});

export const meta = noindexMeta("employerBilling");
