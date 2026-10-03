import api from "@/services/api";

export const teamService = {
  getMembers: async () => {
    const res = await api.get("/user/v1/employer_team_members/");
    return res.data;
  },

  addMember: async (data) => {
    const res = await api.post("/user/v1/employer_team_members/", data);
    return res.data;
  },

  updateMember: async ({ id, data }) => {
    const res = await api.patch(`/user/v1/employer_team_members/${id}/`, data);
    return res.data;
  },

  deleteMember: async (id) => {
    const res = await api.delete(`/user/v1/employer_team_members/${id}/`);
    return res.data;
  },
};
