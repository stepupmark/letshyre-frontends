import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { OtpSession } from "../types";

export function useSendOtp() {
  return useMutation({
    mutationFn: (email: string) => authService.sendOtp(email),
    meta: { errorMessage: false },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ session, otp }: { session: OtpSession; otp: string }) =>
      authService.verifyOtp(session, otp),
    meta: { errorMessage: false },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      session,
      password,
    }: {
      session: OtpSession;
      password: string;
    }) => authService.resetPassword(session, password),
    meta: {
      successMessage: "Password reset. Sign in with your new password.",
      errorMessage: false,
    },
  });
}
