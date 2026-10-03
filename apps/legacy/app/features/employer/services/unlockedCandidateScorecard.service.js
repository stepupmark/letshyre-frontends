import api from "@/services/api";

/**
 * Fetch the scorecard data for a specific unlocked candidate by ID.
 * GET /user/v1/employer_unlock_candidate/[id]/scorecard/
 */
export const fetchUnlockedCandidateScorecard = async (id) => {
  const response = await api.get(`/user/v1/employer_unlock_candidate/${id}/scorecard/`);
  return response.data;
};
