import { queryClient } from "@/lib/queryClient";
import { scorecardDetailQuery } from "@/features/employee/hooks/useScorecardDetail";
import { authedPrefetch } from "@/loaders/prefetch";
import { noindexMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["scorecard"] };

export { EmployeeScoreCard as default } from "@/features/employee/EmployeeScoreCard";

export const clientLoader = catalogLoader(
  handle.i18n,
  authedPrefetch(async ({ request }) => {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return null;
    queryClient.prefetchQuery(scorecardDetailQuery(id));
    return null;
  }),
);

export const meta = noindexMeta("employeeScorecard");
