import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { AuthWizard } from "../AuthWizard";
import { OtpStep } from "../OtpStep";
import { AuthSuccess } from "../AuthSuccess";
import { RegisterEmailStep } from "./SharedRegisterEmail";
import { RegisterMobileStep } from "./SharedMobileVerify";
import { RegisterPasswordStep } from "./SharedSetPassword";
import {
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
} from "@/hooks/useRegisterMutations";

// One hero per role, used for every step of the flow. Both are full-bleed
// photos, so they cover the pane.
import imgEmployerHero from "@/assets/employer-reg.webp";
import imgEmployeeHero from "@/assets/employee-reg.webp";

export function SharedRegisterFlow({ role }) {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const isEmployer = role === "Employer";
  const roleLabel = t(isEmployer ? "roles.employer" : "roles.employee");
  const loginRoute = isEmployer ? "/employer/sign-in" : "/employee/sign-in";

  // Single hero image + fit for the whole flow, chosen by role.
  const heroImage = isEmployer ? imgEmployerHero : imgEmployeeHero;
  const heroFit = "cover";

  // Mutations are declared once here and shared with the step configs.
  const sendEmailOtp = useSendEmailOtpMutation();
  const verifyEmailOtp = useVerifyEmailOtpMutation();
  const sendMobileOtp = useSendMobileOtpMutation();
  const verifyMobileOtp = useVerifyMobileOtpMutation();

  const steps = [
    {
      key: "email",
      image: heroImage,
      imageFit: heroFit,
      render: ({ data, goNext }) => (
        <RegisterEmailStep
          role={role}
          mutation={sendEmailOtp}
          loginRoute={loginRoute}
          registerData={data}
          onNext={(patch) => goNext(patch)}
        />
      ),
    },
    {
      key: "otp",
      image: heroImage,
      imageFit: heroFit,
      render: ({ data, goNext, goBack }) => (
        <OtpStep
          title={t("otp.verificationTitle", { role: roleLabel })}
          subtitle={t("otp.emailSubtitle")}
          helpText={t("otp.emailHelp")}
          destination={data.email}
          onEditContact={goBack}
          sessionKey={data.emailOtpSessionKey}
          verifyMutation={verifyEmailOtp}
          resendMutation={sendEmailOtp}
          makeVerifyVars={({ otp, sessionKey }) => ({
            email: data.email,
            otpSessionKey: sessionKey,
            otp,
            otp_type: "Registration",
          })}
          makeResendVars={() => ({ email: data.email })}
          onVerified={() => goNext()}
        />
      ),
    },
    {
      key: "mobile",
      image: heroImage,
      imageFit: heroFit,
      render: ({ data, goNext }) => (
        <RegisterMobileStep
          role={role}
          mutation={sendMobileOtp}
          registerData={data}
          onNext={(patch) => goNext(patch)}
        />
      ),
    },
    {
      key: "mobileOtp",
      image: heroImage,
      imageFit: heroFit,
      render: ({ data, goNext, goBack }) => (
        <OtpStep
          title={t("otp.verificationTitle", { role: roleLabel })}
          subtitle={t("otp.mobileSubtitle")}
          destination={
            data.phone_number ? `+91 ${data.phone_number}` : undefined
          }
          onEditContact={goBack}
          sessionKey={data.mobileOtpSessionKey}
          verifyMutation={verifyMobileOtp}
          resendMutation={sendMobileOtp}
          makeVerifyVars={({ otp, sessionKey }) => ({
            phone_number: data.phone_number,
            otpSessionKey: sessionKey,
            otp,
          })}
          makeResendVars={() => ({ phone_number: data.phone_number })}
          onVerified={() => goNext()}
        />
      ),
    },
    {
      key: "password",
      image: heroImage,
      imageFit: heroFit,
      render: ({ data, goNext, goTo }) => (
        <RegisterPasswordStep
          role={role}
          registerData={data}
          onNext={() => goNext()}
          onSessionExpired={() => goTo("email")}
        />
      ),
    },
    {
      key: "success",
      image: heroImage,
      terminal: true,
      imageFit: heroFit,
      render: () => (
        <AuthSuccess
          title={t("register.successTitle", { role: roleLabel })}
          subtitle={t("register.successSubtitle")}
          actionLabel={t("register.continueLogin")}
          onAction={() => navigate(loginRoute, { replace: true })}
        />
      ),
    },
  ];

  return <AuthWizard steps={steps} />;
}
