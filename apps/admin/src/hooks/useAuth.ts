import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  loginUser,
  logoutUser,
  resetPassword,
  sendOtp,
  verifyOtp,
  type LoginPayload,
  type LoginUser,
} from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearSession,
} from "../api/axiosInstance";

import { changePassword } from "../api/admin.api";


export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation<LoginUser, Error, LoginPayload>({
    mutationFn: loginUser,

    onSuccess(user) {
      // 1. Persist tokens.
      localStorage.setItem(ACCESS_TOKEN_KEY, user.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, user.refresh_token);

      // 2. Update AuthContext so guards/loaders re-evaluate.
      login(user.access_token, user);

      // 3. Navigate to the protected dashboard.
      navigate("/dashboard", { replace: true });
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      try {
        if (refreshToken) {
          await logoutUser({ refresh_token: refreshToken });
        }
      } finally {
        // Always clear locally, even if server-side revocation fails —
        // an unreachable logout endpoint shouldn't trap the user in an
        // authenticated-looking state.
        clearSession();
      }
    },
  });
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

export function useSendOtp() {
  return useMutation({
    mutationFn: sendOtp,
    mutationKey: ["send-otp"],
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtp,
    mutationKey: ["verify-otp"],
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
    mutationKey: ["reset-password"],
  });
}
