import { requireAuth } from "@/loaders/requireAuth";
import { catalogLoader } from "@/loaders/catalogLoader";
import { EMPLOYER_ONLY } from "@/constants";
import { queryClient } from "@/lib/queryClient";
import { employerProfileQuery } from "@/features/employer/hooks/useEmployerProfile";
import {
  employerCreditsQuery,
  teamMembersQuery,
} from "@/features/employer/hooks/useDashboard";
import { noindexMeta } from "@/lib/routeMeta";

export const handle = { i18n: ["common", "seo", "dashboard", "employer"] };
const loadRouteCatalogs = catalogLoader(handle.i18n);

// Runs before every child loader (including the parallel child loaders that
// used to race authedPrefetch's own allowedRoles check — see constants.js and
// loaders/prefetch.js). A redirect() thrown here short-circuits the whole
// branch before any child loader starts.
export const clientMiddleware = [
  async (args, next) => {
    await requireAuth({ allowedRoles: EMPLOYER_ONLY })(args);
    await loadRouteCatalogs(args);
    return next();
  },
];

export const clientLoader = async () => {
  void Promise.allSettled([
    queryClient.ensureQueryData(employerProfileQuery()),
    queryClient.ensureQueryData(employerCreditsQuery()),
    queryClient.ensureQueryData(teamMembersQuery()),
  ]);
  return null;
};

export const shouldRevalidate = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  if (currentUrl.pathname === nextUrl.pathname) return false;
  return defaultShouldRevalidate;
};

// Default tab title for the tree. A child route without its own meta()
// inherits this one (see the Meta component in react-router's ssr/components),
// so only routes needing a distinct title add one.
export const meta = noindexMeta("employerDashboard");

export { EmployerDashboardLayout as default } from "@/features/employer/components/layout/EmployerDashboardLayout";
export { EmployerErrorBoundary as ErrorBoundary } from "@/features/employer/not-found/EmployerErrorBoundary";
