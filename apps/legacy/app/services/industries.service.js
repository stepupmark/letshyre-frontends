import api from "./api";

/**
 * Canonical industries fetcher.
 *
 * Four separate services previously wrapped this same endpoint
 * (`/user/v1/industries/list/`) and each returned a different shape — some the
 * raw axios response, some `response.data`, some the unwrapped array. Three of
 * them also shared the TanStack key `["industries"]`, so whichever component
 * mounted first decided the shape every other consumer then read.
 *
 * This always resolves to an array so consumers never have to guess.
 */
export const getIndustries = async () => {
  const res = await api.get("/user/v1/industries/list/");
  const payload =
    res.data?.data?.results ??
    res.data?.results ??
    res.data?.data ??
    res.data?.industries ??
    res.data;
  return Array.isArray(payload) ? payload : [];
};
