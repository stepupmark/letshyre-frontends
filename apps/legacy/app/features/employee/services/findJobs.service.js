import api from "@/services/api";

/**
 * Fetch candidate jobs with server-side filters.
 *
 * @param {Object} params
 * @param {string}  [params.job_search]          – Search keyword for job title
 * @param {string}  [params.location]            – Filter by job location
 * @param {string}  [params.employment_type]     – e.g. full_time, part_time, internship
 * @param {string}  [params.industry_type]       – Filter by industry type
 * @param {string}  [params.salary_range]        – Filter by salary range
 * @param {string}  [params.experience_required] – Filter by required experience
 * @param {number}  [params.page]                – Page number for pagination
 * @returns {Promise<Object>} – { results, count, totalPages, currentPage, next, previous }
 */
export const getCandidateFindJobs = async (params = {}) => {
  // Strip empty / undefined values so they don't pollute the query string
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );

  const res = await api.get("/user/v1/candidate_find_jobs/", {
    params: cleanParams,
  });

  const data = res.data?.data || res.data || {};
  const results = data.results || (Array.isArray(data) ? data : []);

  return {
    results,
    count: data.count || results.length,
    totalPages: data.total_pages || 1,
    currentPage: data.current_page || 1,
    next: data.next,
    previous: data.previous,
  };
};

/**
 * Fetch the list of all industries for the filter dropdown.
 *
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export const getIndustriesList = async () => {
  const res = await api.get("/user/v1/industries/list/");
  return res.data?.data || res.data || [];
};

/**
 * Apply for a job.
 *
 * @param {string} jobId – The UUID of the job to apply for
 * @returns {Promise<Object>}
 */
export const applyForJob = async (jobId) => {
  const res = await api.post("/user/v1/candidate_jobs/", { job: jobId });
  return res.data;
};
