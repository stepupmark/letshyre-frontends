import { queryClient } from "@/lib/queryClient";
import { jobsListQuery } from "@/features/employer/hooks/useEmployerJobs";
import { buildJobsQueryParams } from "@/lib/queryKeys";
import { authedPrefetch } from "@/loaders/prefetch";
import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export { ViewJobs as default } from "@/features/employer/ViewJobs";

export const meta = noindexMeta("employerViewJobs");

export const handle = { i18n: ["employerJobs"] };

export const clientLoader = catalogLoader(
  handle.i18n,
  authedPrefetch(async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const queryParams = buildJobsQueryParams(searchParams);

    queryClient.prefetchQuery(jobsListQuery(queryParams));
    return null;
  }),
);
