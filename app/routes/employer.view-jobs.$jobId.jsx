import { queryClient } from "@/lib/queryClient";
import { jobDetailQuery } from "@/features/employer/hooks/useEmployerJobs";
import { authedPrefetch } from "@/loaders/prefetch";
import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexDataMeta } from "@/lib/routeMeta";

export { JobDetail as default } from "@/features/employer/JobDetail";

export const handle = { i18n: ["employerJobs"] };

export const clientLoader = catalogLoader(
  handle.i18n,
  authedPrefetch(async ({ params }) => {
    const { jobId } = params;
    return queryClient.ensureQueryData(jobDetailQuery(jobId));
  }),
);

export const meta = noindexDataMeta("employerJobDetail", (loaderData, t) => ({
  jobTitle: loaderData?.job_title || t("employerJobDetail.fallbackTitle"),
}));
