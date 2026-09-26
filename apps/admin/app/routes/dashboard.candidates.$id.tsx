export { default } from "~/pages/admin/CandidateProfile";
export const handle = {
  breadcrumb: "Candidate profile",
  parent: { label: "Candidates", path: "/dashboard/candidates" },
};
export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";
