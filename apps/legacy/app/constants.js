export const ROLES = {
  EMPLOYEE: "Candidate",
  EMPLOYER: "Employer",
};

/**
 * Landing route per role. Keys are the exact role strings the API returns and
 * that get persisted to localStorage — they are case-sensitive, so derive them
 * from ROLES rather than hand-writing string literals.
 */
export const ROLE_HOME = {
  [ROLES.EMPLOYEE]: "/employee",
  [ROLES.EMPLOYER]: "/employer",
};

/** Where to send anyone with no session, or an unrecognised role. */
export const FALLBACK_HOME = "/";

/**
 * Role allow-lists for route protection, passed to `requireAuth` in each
 * branch's parent layout (employer.jsx / employee.jsx). Every child route
 * loader — including `authedPrefetch`-wrapped prefetches — runs after that
 * layout's `clientMiddleware`, so only the parent needs to check the role.
 */
export const EMPLOYER_ONLY = [ROLES.EMPLOYER];
export const EMPLOYEE_ONLY = [ROLES.EMPLOYEE];
