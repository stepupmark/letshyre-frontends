import { redirect } from "react-router";
import { getUser, clearStoredUser } from "@/lib/getUser";
import { ROLES, ROLE_HOME, FALLBACK_HOME } from "@/constants";

// Landing route for a role. An unknown role means a stale/foreign auth record:
// clear it and send to the public entry, rather than redirect(undefined) which
// throws inside the loader.
function homeFor(role) {
  const home = ROLE_HOME[role];
  if (home) return home;

  clearStoredUser();
  return FALLBACK_HOME;
}

export const requireAuth =
  ({ allowedRoles = [] } = {}) =>
  async ({ request }) => {
    const authData = getUser();

    if (!authData?.isAuthenticated) {
      throw redirect(FALLBACK_HOME);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(authData.role)) {
      throw redirect(homeFor(authData.role));
    }

    // Employer onboarding gate: force incomplete profiles onto /onboarding,
    // and keep completed ones off it.
    if (request?.url) {
      const url = new URL(request.url);
      const isOnboardingPath = url.pathname.includes("/onboarding");
      const isProfileCompleted = authData.user?.is_profile_completed;

      if (authData.role === ROLES.EMPLOYER) {
        if (isProfileCompleted === false && !isOnboardingPath) {
          throw redirect("/employer/onboarding");
        }
        if (isProfileCompleted === true && isOnboardingPath) {
          throw redirect("/employer");
        }
      }
    }

    return authData;
  };

export const requireGuest = async () => {
  const authData = getUser();

  if (!authData?.isAuthenticated) return null;

  if (
    authData.role === ROLES.EMPLOYER &&
    authData.user?.is_profile_completed === false
  ) {
    throw redirect("/employer/onboarding");
  }

  throw redirect(homeFor(authData.role));
};
