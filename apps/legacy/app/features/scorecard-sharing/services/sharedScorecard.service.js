import api from "@/services/api";
export const fetchSharedScorecard = (shareId) =>
  api.get(`/user/v1/public/shared-candidate/${shareId}`);
