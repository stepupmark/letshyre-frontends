import api from "@/services/api";

export const getCandidateApplications = async ({ pageParam = 1, status }) => {
  const limit = 10;
  
  // The API expects 'application_status' to be Title Case (e.g., 'Applied', 'Shortlisted')
  // We'll capitalize the status here to be safe.
  const formattedStatus = status 
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() 
    : "Applied";

  const res = await api.get("/user/v1/candidate_jobs/", {
    params: {
      page: pageParam,
      limit: limit,
      application_status: formattedStatus,
    },
  });

  const data = res.data?.data || res.data || {};
  const results = data.results || (Array.isArray(data) ? data : []);

  return {
    results,
    nextPage: data.next ? pageParam + 1 : undefined,
    count: data.count || results.length,
  };
};
