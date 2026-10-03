import api from "@/services/api";
import { getErrorMessage } from "@/lib/errorHandler";
import { ApiError, extractFieldErrors } from "@/lib/apiErrorMessages";

// Backend can return 200 with `{success: false, ...}` in the body instead of
// a non-2xx status — treat that the same as a thrown request error.
const getResponseData = (response) => {
  if (response?.data?.success === false) {
    throw new ApiError(response.data.message, {
      status: response.status,
      backendMessage: response.data.message,
      fieldErrors: extractFieldErrors(response.data.data),
    });
  }
  return response.data;
};

const toApiError = (error) =>
  error instanceof ApiError
    ? error
    : new ApiError(getErrorMessage(error), {
        status: error?.response?.status,
        backendMessage: error?.response?.data?.message,
        fieldErrors: extractFieldErrors(error?.response?.data?.data),
      });

export const profileService = {
  getIndustries: async () => {
    try {
      const response = await api.get("/user/v1/industries/list/");
      return getResponseData(response);
    } catch (error) {
      throw toApiError(error);
    }
  },

  uploadResume: async (formData) => {
    try {
      const response = await api.post(
        "/user/v1/candidate_resume_ai/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return getResponseData(response);
    } catch (error) {
      throw toApiError(error);
    }
  },

  checkResumeStatus: async (jobId) => {
    try {
      const response = await api.get(
        `/user/v1/candidate_resume_ai/status/${jobId}/`
      );
      return getResponseData(response);
    } catch (error) {
      throw toApiError(error);
    }
  },

  getParsedResumeData: async (jobId) => {
    try {
      const response = await api.get(
        `/user/v1/candidate_resume_ai/review_data/${jobId}/`
      );
      return getResponseData(response);
    } catch (error) {
      throw toApiError(error);
    }
  },

  getSkillsForRole: async (role) => {
    try {
      const response = await api.post(
        "/user/v1/candidate_resume_ai/skills_for_role/",
        { role }
      );
      return getResponseData(response);
    } catch (error) {
      throw toApiError(error);
    }
  },

  submitProfile: async (formData) => {
    try {
      const response = await api.post("/user/v1/candidate_profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return getResponseData(response);
    } catch (error) {
      throw toApiError(error);
    }
  },
};
