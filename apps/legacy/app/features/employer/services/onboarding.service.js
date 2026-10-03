import api from "@/services/api";

export const submitEmployerOnboarding = async (formData) => {
  const response = await api.patch("/user/v1/employer_kyc/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getIndustriesList = async () => {
  const response = await api.get("/user/v1/industries/list/");
  return response.data;
};
