import { data } from "react-router";

export function clientLoader() {
  throw data(null, { status: 404 });
}

export { RouteErrorBoundary as ErrorBoundary } from "~/components/feedback/route-error-boundary";

export default function DashboardNotFound() {
  return null;
}
