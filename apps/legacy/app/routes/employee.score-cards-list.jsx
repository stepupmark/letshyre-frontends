import { queryClient } from "@/lib/queryClient";
import { scoreCardsListQuery } from "@/features/employee/hooks/useScoreCardsList";
import { authedPrefetch } from "@/loaders/prefetch";
import { noindexMeta } from "@/lib/routeMeta";

export { ScoreCardsList as default } from "@/features/employee/ScoreCardsList";

export const clientLoader = authedPrefetch(async () => {
  queryClient.prefetchQuery(scoreCardsListQuery());
  return null;
});

export const meta = noindexMeta("employeeScoreCardsList");
