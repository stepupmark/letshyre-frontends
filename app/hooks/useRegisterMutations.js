import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import authService from "@/services/auth.service";
import { resolveAuthErrorKey, FIELD_FOR_ERROR_KEY } from "@/lib/authErrorMessages";

export const useSendEmailOtpMutation = () => {
  const { t } = useTranslation("auth");
  return useMutation({
    mutationKey: ["otp", "send", "email"],
    mutationFn: (data) =>
      authService.sendRegisterEmailOtp({
        email: data.email,
        otp_type: "Registration",
      }),
    onError: (error) => {
      const key = resolveAuthErrorKey(error, { fallback: "toast.otpSendFailed" });
      if (FIELD_FOR_ERROR_KEY[key]) return;
      toast.error(t(key));
    },
  });
};

export const useVerifyEmailOtpMutation = () => {
  return useMutation({
    mutationKey: ["otp", "verify", "email"],
    mutationFn: (data) =>
      authService.verifyEmailOtp({
        email: data.email,
        otp_session_key: data.otpSessionKey,
        otp: data.otp,
        otp_type: data.otp_type,
      }),
    onError: () => {},
  });
};

export const useSendMobileOtpMutation = () => {
  const { t } = useTranslation("auth");
  return useMutation({
    mutationKey: ["otp", "send", "mobile"],
    mutationFn: (data) =>
      authService.sendMobileOtp({
        phone_number: data.phone_number,
        otp_type: "Registration",
      }),
    onError: (error) => {
      const key = resolveAuthErrorKey(error, { fallback: "toast.mobileOtpSendFailed" });
      if (FIELD_FOR_ERROR_KEY[key]) return;
      toast.error(t(key));
    },
  });
};

export const useVerifyMobileOtpMutation = () => {
  return useMutation({
    mutationKey: ["otp", "verify", "mobile"],
    mutationFn: (data) =>
      authService.verifyMobileOtp({
        phone_number: data.phone_number,
        otp_session_key: data.otpSessionKey,
        otp: data.otp,
      }),
    onError: () => {},
  });
};

export const useFinalRegisterMutation = () => {
  const { t } = useTranslation("auth");
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: (data) => authService.finalRegister(data),
    onError: (error) => {
      const key = resolveAuthErrorKey(error, { fallback: "toast.registerFailed" });
      toast.error(t(key));
    },
  });
};
