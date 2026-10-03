import api from "@/services/api";

/**
 * Fetch employer's open jobs (paginated).
 * GET /user/v1/employer_jobs/?status=Open&page={page}
 */
export const fetchOpenJobs = (params) => {
  return api.get("/user/v1/employer_jobs/", {
    params: { status: "Open", ...params },
  });
};

/**
 * Fetch AI-matched candidates for a specific job.
 * GET /user/v1/employer_job_ai/matching/{jobId}/
 */
export const fetchAIMatchedCandidates = (
  jobId,
  { appliedOnly = false } = {},
) => {
  const params = { applied_only: appliedOnly, engine: "v2" };
  return api.get(`/user/v1/employer_job_ai/matching/${jobId}/`, { params });
};

/**
 * Fetch candidate's past interview scores.
 * GET /user/v1/employer_candidate_interviews/[candidate-id]/
 */
export const fetchCandidateInterviews = (candidateId) => {
  return api.get(`/user/v1/employer_candidate_interviews/${candidateId}/`);
};

/**
 * Unlock candidate profile with selected interviews.
 * POST /user/v1/employer_unlock_candidate/
 */
export const unlockCandidateProfile = (data) => {
  return api.post(`/user/v1/employer_unlock_candidate/`, data);
};
