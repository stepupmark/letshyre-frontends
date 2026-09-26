export { default } from "~/pages/admin/JobDetail";
export const handle = {
  breadcrumb: "Job details",
  parent: { label: "Jobs", path: "/dashboard/jobs" },
};
export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";
