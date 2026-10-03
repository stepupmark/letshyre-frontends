import api from "@/services/api";

export const dashboardService = {
  // Employer profile is served by employerProfile.service.getEmployerProfile
  // (same endpoint) — see useDashboard's `useEmployerProfile` re-export. Kept
  // out of here so there is exactly one fetcher on the profile cache key.

  // Get employer credits
  getEmployerCredits: async () => {
    const res = await api.get("/payment/v1/employer_credits/");
    return res.data?.data || res.data;
  },

  // Get team members (and count)
  getTeamMembers: async () => {
    const res = await api.get("/user/v1/employer_team_members/");
    return res.data?.data || res.data;
  },

  // Invite a new team member
  inviteTeamMember: async (payload) => {
    const res = await api.post("/user/v1/employer_team_members/", payload);
    return res.data;
  },

  // Fetch employer dashboard stats (top cards & credits)
  fetchDashboardStats: async () => {
    const res = await api.get("/user/v1/employer_dashboard_cards/");
    return res.data?.data || res.data;
  },
};
