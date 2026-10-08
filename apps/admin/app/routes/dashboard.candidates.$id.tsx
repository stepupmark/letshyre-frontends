import type { Route } from "./+types/dashboard.candidates.$id";
import { CandidateProfilePage, candidatesQueries } from "~/features/candidates";
import { queryClient } from "~/lib/query/query-client";

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  void queryClient.prefetchQuery(candidatesQueries.profile(params.id));
  return null;
}

export const meta: Route.MetaFunction = () => [
  { title: "Candidate profile · LetsHyre Admin" },
];

export const handle = {
  breadcrumb: "Candidate profile",
  parent: { label: "Candidates", path: "/dashboard/candidates" },
};

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default CandidateProfilePage;
