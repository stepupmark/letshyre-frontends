import { queryClient } from "@/lib/queryClient";
import { unlockedCandidatesQuery } from "@/features/employer/hooks/useUnlockedCandidates";
import { authedPrefetch } from "@/loaders/prefetch";
import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export { UnlockedCandidatesList as default } from "@/features/employer/UnlockedCandidates";

export const meta = noindexMeta("employerUnlockedCandidates");

export const handle = { i18n: ["employerCandidates"] };

export const clientLoader = catalogLoader(
  handle.i18n,
  authedPrefetch(async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const parsed = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);

    queryClient.prefetchQuery(unlockedCandidatesQuery(page));
    return null;
  }),
);
