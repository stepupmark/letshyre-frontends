export const queryKeys = {
  industries: () => ["industries"],
  sharedScorecard: (shareId) => ["sharedScorecard", shareId],

  jobs: {
    // Prefix key — invalidating this clears every `list(params)` page.
    all: () => ["jobs"],
    list: (params) => ["jobs", params],
    // NOTE: detail is NOT under the "jobs" prefix, so `all()` does not clear
    // it; invalidate `detail(id)` explicitly alongside `all()`.
    detail: (jobId) => ["jobDetail", jobId],
  },

  employer: {
    dashboardStats: () => ["employerDashboardStats"],
    profile: () => ["employerProfile"],
    credits: () => ["employerCredits"],
    // Dashboard's team-members summary (dashboardService.getTeamMembers).
    teamMembers: () => ["employerTeamMembers"],
    // The Team page's own member list (teamService.getMembers) — a distinct
    // endpoint and shape from teamMembers() above, kept as a separate key on
    // purpose. Invalidating one does NOT refetch the other.
    teamList: () => ["teamMembers"],
    // Applicants for a job, paginated.
    applicants: (jobId, page) => ["applicants", jobId, page],
    // Open jobs list; `params` is `{ page, status }`.
    openJobs: (params) => ["openJobs", params],
    // AI-matched candidates for a job; `options` is `{ appliedOnly }`.
    aiMatchedCandidates: (jobId, options) => [
      "aiMatchedCandidates",
      jobId,
      options,
    ],
    candidateInterviews: (candidateId) => ["candidateInterviews", candidateId],
    unlockedCandidates: {
      // Prefix key — invalidating this clears every `list(page)` page.
      all: () => ["unlockedCandidates"],
      list: (page) => ["unlockedCandidates", page],
    },
    unlockedCandidateProfile: (id) => ["unlockedCandidateProfile", id],
    unlockedCandidateScorecard: (id) => ["unlockedCandidateScorecard", id],
    sharedLinks: {
      // Prefix key — invalidating this clears every `list(page)` page.
      all: () => ["sharedLinks"],
      list: (page) => ["sharedLinks", page],
    },
  },

  pricing: {
    plans: () => ["pricing", "plans"],
    // Price of a single credit; top-up totals are derived from it.
    creditPrice: () => ["pricing", "creditPrice"],
    quote: ({ planId, tokens, couponCode }) => [
      "pricing",
      "quote",
      planId ?? null,
      tokens,
      couponCode ?? null,
    ],
  },

  payments: {
    // Prefix key — clears every invoices page.
    invoices: () => ["invoices"],
    invoicesList: (page) => ["invoices", page],
  },

  employee: {
    // Prefix key — clears every filtered find-jobs page.
    findJobs: () => ["candidateFindJobs"],
    findJobsList: (filters) => ["candidateFindJobs", filters],
    // Candidate profile — also read by the employee dashboard shell.
    profile: () => ["candidateProfile"],
    // Applications: prefix key clears every tab; applicationsList keys a tab.
    applications: () => ["candidateApplications"],
    applicationsList: (status) => ["candidateApplications", status],
    scoreCardsList: () => ["scoreCardsList"],
    scorecardDetail: (id) => ["scorecardDetail", id],
    skillsForRole: (role) => ["skillsForRole", role],
    desktopAppReleases: () => ["desktopAppReleases"],
  },
};

// Jobs-list params from URLSearchParams, shared by view-jobs' loader and the
// ViewJobs component so the prefetched and rendered keys match by construction.
export function buildJobsQueryParams(searchParams) {
  const urlStatus = searchParams.get("status") || "all";
  const approvalStatus = searchParams.get("approval_status");
  const parsedPage = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  const params = { page: currentPage };

  if (urlStatus && urlStatus !== "all") {
    if (urlStatus === "pending") {
      params.approval_status = "pending";
    } else {
      params.status = urlStatus;
    }
  }
  if (approvalStatus) params.approval_status = approvalStatus;

  return params;
}

// Candidate-pool selection from URLSearchParams, shared by the route's loader
// and the CandidatePool component so the prefetched and rendered keys match.
// jobId is validated (numeric-ish id) so a malformed/injected value never
// reaches a request URL — it's treated as absent instead.
const JOB_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export function buildCandidatePoolParams(searchParams) {
  const rawJobId = searchParams.get("jobId");
  const jobId = rawJobId && JOB_ID_PATTERN.test(rawJobId) ? rawJobId : null;
  const appliedOnly = searchParams.get("applied") === "1";

  return { jobId, appliedOnly };
}
