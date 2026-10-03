import api from "@/services/api";

/**
 * Fetch applicants for a specific job.
 * @param {string} jobId - The UUID of the job.
 * @param {number} page - The current page number for pagination.
 */
export const getApplicants = async (jobId, page = 1) => {
  const response = await api.get(`/user/v1/employer_candidate_job_management/${jobId}/`, {
    params: {
      page: page,
    },
  });
  return response.data;
};
