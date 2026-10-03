import { queryClient } from "@/lib/queryClient";
import { sharedLinksQuery } from "@/features/employer/hooks/useSharedLinks";
import { authedPrefetch } from "@/loaders/prefetch";
import { noindexMeta } from "@/lib/routeMeta";
import { catalogLoader } from "@/loaders/catalogLoader";

export const handle = { i18n: ["sharedLinks"] };

export { SharedLinks as default } from "@/features/employer/SharedLinks";

export const meta = noindexMeta("employerSharedLinks");

export const clientLoader = catalogLoader(
  handle.i18n,
  authedPrefetch(async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const parsed = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);

    queryClient.prefetchQuery(sharedLinksQuery(page));
    return null;
  }),
);
