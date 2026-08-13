import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  phone_number: string;
}

export interface AdminInfoApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: AdminInfo;
}

export const fetchAdminInfo = async (): Promise<AdminInfo> => {
  try {
    const response = await apiClient.get<AdminInfoApiResponse>(
      `user/v1/admin/profile/`,
    );
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const changePassword = async (payload: {
  old_password: string;
  new_password: string;
}) => {
  try {
    const response = await apiClient.post(
      `user/v1/admin/change/password/`,
      payload,
    );
    return response.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

// export const changePassword = async (payload: {
//   currentPassword: string;
//   newPassword: string;
// }) => {
//   const res = await axios.post("/user/v1/change-password/", payload);
//   return res.data;
// };
