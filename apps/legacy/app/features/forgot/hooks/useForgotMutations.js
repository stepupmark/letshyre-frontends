import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import authService from "@/services/auth.service";
import { resolveAuthErrorKey, FIELD_FOR_ERROR_KEY } from "@/lib/authErrorMessages";

export const useForgotSendOtpMutation = () => {
  const { t } = useTranslation("auth");
  return useMutation({
    mutationKey: ["otp", "send", "forgot"],
    mutationFn: (data) => authService.sendRegisterEmailOtp({
      email: data.email,
      otp_type: "Forgot Password",
    }),
    onError: (error) => {
      const key = resolveAuthErrorKey(error, { fallback: "toast.otpSendFailed" });
      if (FIELD_FOR_ERROR_KEY[key]) return;
      toast.error(t(key));
    },
  });
};

export const useForgotVerifyOtpMutation = () => {
  return useMutation({
    mutationKey: ["otp", "verify", "forgot"],
    mutationFn: (data) => authService.verifyEmailOtp({
      email: data.email,
      otp_session_key: data.otpSessionKey,
      otp: data.otp,
      otp_type: "Forgot Password",
    }),
    onError: () => {},
  });
};

export const useForgotPasswordMutation = () => {
  const { t } = useTranslation("auth");
  return useMutation({
    mutationKey: ["auth", "forgot", "reset"],
    mutationFn: (data) => authService.forgotPassword({
      email: data.email,
      otp_session_key: data.otpSessionKey,
      new_password: data.newPassword,
      confirm_password: data.confirmPassword,
    }),
    onError: (error) => {
      const key = resolveAuthErrorKey(error, { fallback: "toast.passwordResetFailed" });
      toast.error(t(key));
    },
  });
};
