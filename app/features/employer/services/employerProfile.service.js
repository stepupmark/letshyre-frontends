import api from "@/services/api";

export const getEmployerProfile = async () => {
  const response = await api.get("/user/v1/employer_profile/");
  return response.data?.data || response.data || {};
};

export const updateEmployerKyc = async (formData) => {
  const response = await api.patch("/user/v1/employer_kyc/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
