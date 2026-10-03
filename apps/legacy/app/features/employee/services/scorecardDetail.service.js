import api from "@/services/api";

export const getScorecardDetail = async (id) => {
  if (!id) throw new Error("Scorecard ID is required");
  try {
    const response = await api.get(`/user/v1/candidate_scorecard/${id}/`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Return gracefully so React Query caches the "Empty" state
      // and honors the staleTime instead of aggressively retrying
      return error.response.data;
    }
    throw error;
  }
};
