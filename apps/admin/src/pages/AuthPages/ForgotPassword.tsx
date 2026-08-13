import { useState } from "react";
import ForgotPasswordEmailField from "../../components/auth/ForgotPasswordEmailField";
import OtpVerificationForm from "../../components/auth/OtpVerificationForm";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export type AuthState = {
  email: string;
  otp_session_key: string;
};

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [authState, setAuthState] = useState<AuthState>({
    email: "",
    otp_session_key: "",
  });

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-gray-100">
      <div className="absolute inset-0 z-0 bg-gray-100">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle,_#9ca3af_1px,_transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-10 rounded-2xl">
        {step === "email" && (
          <ForgotPasswordEmailField
            onOtpSent={(data: AuthState) => {
              setAuthState((prev) => ({
                ...prev,
                email: data.email,
                otp_session_key: data.otp_session_key,
              }));
              setStep("otp");
            }}
          />
        )}

        {step === "otp" && (
          <OtpVerificationForm
            authState={authState}
            onOtpVerified={() => setStep("reset")}
          />
        )}

        {step === "reset" && <ResetPasswordForm email={authState.email} />}
      </div>
    </div>
  );
}
