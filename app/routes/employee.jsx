import { requireAuth } from "@/loaders/requireAuth";
import { catalogLoader } from "@/loaders/catalogLoader";
import { EMPLOYEE_ONLY } from "@/constants";
import { queryClient } from "@/lib/queryClient";
import { candidateProfileQuery } from "@/features/employee/hooks/useCandidateProfile";
import { noindexMeta } from "@/lib/routeMeta";

export const handle = { i18n: ["common", "seo", "dashboard", "employee"] };
const loadRouteCatalogs = catalogLoader(handle.i18n);

// Runs before every child loader — see the matching comment in employer.jsx.
export const clientMiddleware = [
  async (args, next) => {
    await requireAuth({ allowedRoles: EMPLOYEE_ONLY })(args);
    await loadRouteCatalogs(args);
    return next();
  },
];

export const clientLoader = async () => {
  // Fire-and-forget: warm the candidate profile the layout reads on every page.
  void Promise.allSettled([
    queryClient.ensureQueryData(candidateProfileQuery()),
  ]);
  return null;
};


export const shouldRevalidate = ({ currentUrl, nextUrl, defaultShouldRevalidate }) => {
  if (currentUrl.pathname === nextUrl.pathname) return false;
  return defaultShouldRevalidate;
};

// Default tab title for the tree. A child route without its own meta()
// inherits this one (see the Meta component in react-router's ssr/components),
// so only routes needing a distinct title (chatbot, profile, etc.) add one.
export const meta = noindexMeta("employeeFindJobs");

export { EmployeeDashboardLayout as default } from "@/features/employee/components/layout/EmployeeDashboardLayout";
export { EmployeeErrorBoundary as ErrorBoundary } from "@/features/employee/not-found/EmployeeErrorBoundary";