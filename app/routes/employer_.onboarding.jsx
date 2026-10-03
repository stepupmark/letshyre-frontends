import { requireAuth } from "@/loaders/requireAuth";
import { EMPLOYER_ONLY } from "@/constants";
import { catalogLoader } from "@/loaders/catalogLoader";
import { noindexMeta } from "@/lib/routeMeta";

export const handle = { i18n: ["common", "seo", "onboarding"] };
export const clientLoader = catalogLoader(
  handle.i18n,
  requireAuth({ allowedRoles: EMPLOYER_ONLY }),
);

export { onBoarding as default } from "@/features/employer/OnBoarding";

// Sibling of employer.jsx, not nested under it (the leading underscore
// escapes layout nesting), so it doesn't inherit the dashboard's meta.
export const meta = noindexMeta("employerOnboarding");
export { EmployerErrorBoundary as ErrorBoundary } from "@/features/employer/not-found/EmployerErrorBoundary";
