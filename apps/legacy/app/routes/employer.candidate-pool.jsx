import { queryClient } from "@/lib/queryClient";
import {
  openJobsQuery,
  aiMatchedCandidatesQuery,
} from "@/features/employer/hooks/useCandidatePool";
import { jobDetailQuery } from "@/features/employer/hooks/useEmployerJobs";
import { buildCandidatePoolParams } from "@/lib/queryKeys";
import { authedPrefetch } from "@/loaders/prefetch";
import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export { CandidatePool as default } from "@/features/employer/CandidatePool";

export const meta = noindexMeta("employerCandidatePool");

export const handle = { i18n: ["employerCandidates"] };

export const clientLoader = catalogLoader(
  handle.i18n,
  authedPrefetch(async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const { jobId, appliedOnly } = buildCandidatePoolParams(searchParams);

    queryClient.prefetchQuery(openJobsQuery(1));
    if (jobId) {
      queryClient.prefetchQuery(aiMatchedCandidatesQuery(jobId, appliedOnly));
      queryClient.prefetchQuery(jobDetailQuery(jobId));
    }
    return null;
  }),
);
