import api from "@/services/api";

export const getCandidateScorecard = async () => {
  try {
    const response = await api.get("/user/v1/candidate_scorecard/");
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Return gracefully so React Query caches the "Empty" state
      // and honors the 2 minute staleTime instead of aggressively retrying
      return error.response.data;
    }
    throw error;
  }
};
