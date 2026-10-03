import api from "@/services/api";

// Fixed until a second matching engine ships — never surfaced in the UI.
const DEFAULT_MATCH_ENGINE = "v1";

export const createCandidateShareLink = (candidateId, payload) => {
  return api.post(`/user/v1/employer_unlock_candidate/${candidateId}/share/`, {
    ...payload,
    match_engine: DEFAULT_MATCH_ENGINE,
  });
};

export const fetchSharedLinks = (params) => {
  return api.get("/user/v1/employer_shared_links/", { params });
};

export const updateSharedLink = (id, payload) => {
  return api.patch(`/user/v1/employer_shared_links/${id}/`, payload);
};

export const deleteSharedLink = (id) => {
  return api.delete(`/user/v1/employer_shared_links/${id}/`);
};
