import api from "./api";

export const subscribeToNewsletter = async (email) => {
  const response = await api.post("/commonapp/v1/stay_updated/", { email });
  return response.data;
};
