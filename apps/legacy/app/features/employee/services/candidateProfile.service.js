import api from "@/services/api";

export const getCandidateProfile = () =>
  api.post("/user/v1/candidate_profile/").then((r) => r.data?.data ?? r.data);
