import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { AuthWizard } from "@/components/auth/AuthWizard";
import { OtpStep } from "@/components/auth/OtpStep";
import { AuthSuccess } from "@/components/auth/AuthSuccess";
import { ForgotEmailStep } from "@/features/forgot/components/ForgotEmail";
import { ForgotPasswordStep } from "@/features/forgot/components/ResetPassword";
import {
  useForgotSendOtpMutation,
  useForgotVerifyOtpMutation,
} from "@/features/forgot/hooks/useForgotMutations";

// One illustration for the whole forgot-password flow.
import forgotImg from "@/assets/forgot.webp";

export function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("auth");
  const role = location.state?.role === "employer" ? "employer" : "candidate";
  const loginRoute =
    role === "employer" ? "/employer/sign-in" : "/employee/sign-in";

  const sendOtp = useForgotSendOtpMutation();
  const verifyOtp = useForgotVerifyOtpMutation();

  const steps = [
    {
      key: "email",
      image: forgotImg,
      imageFit: "cover",
      render: ({ goNext }) => (
        <ForgotEmailStep
          mutation={sendOtp}
          loginRoute={loginRoute}
          onNext={(patch) => goNext(patch)}
        />
      ),
    },
    {
      key: "otp",
      image: forgotImg,
      imageFit: "cover",
      render: ({ data, goNext, goBack }) => (
        <OtpStep
          title={t("forgot.emailVerifyTitle")}
          subtitle={t("forgot.otpSubtitle")}
          helpText={t("forgot.otpHelp")}
          destination={data.email}
          onEditContact={goBack}
          sessionKey={data.otpSessionKey}
          verifyMutation={verifyOtp}
          resendMutation={sendOtp}
          makeVerifyVars={({ otp, sessionKey }) => ({
            email: data.email,
            otpSessionKey: sessionKey,
            otp,
          })}
          makeResendVars={() => ({ email: data.email })}
          onVerified={() => goNext()}
        />
      ),
    },
    {
      key: "password",
      image: forgotImg,
      imageFit: "cover",
      render: ({ data, goNext, goTo }) => (
        <ForgotPasswordStep
          email={data.email}
          otpSessionKey={data.otpSessionKey}
          onNext={() => goNext()}
          onSessionExpired={() => goTo("email")}
        />
      ),
    },
    {
      key: "success",
      image: forgotImg,
      terminal: true,
      imageFit: "cover",
      render: () => (
        <AuthSuccess
          title={t("forgot.successTitle")}
          subtitle={t("forgot.successSubtitle")}
          actionLabel={t("forgot.backToLogin")}
          onAction={() => navigate(loginRoute, { replace: true })}
          autoRedirect={() => navigate(loginRoute, { replace: true })}
        />
      ),
    },
  ];

  return (
    <>
      
      <AuthWizard steps={steps} />
    </>
  );
}
