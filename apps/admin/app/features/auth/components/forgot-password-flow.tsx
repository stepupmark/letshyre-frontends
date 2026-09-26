import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { OtpSession } from "../types";
import { RequestOtpForm } from "./request-otp-form";
import { ResetPasswordForm } from "./reset-password-form";
import { VerifyOtpForm } from "./verify-otp-form";

type Step =
  | { name: "request" }
  | { name: "verify"; session: OtpSession }
  | { name: "reset"; session: OtpSession };

const COPY: Record<Step["name"], { title: string; description: string }> = {
  request: {
    title: "Forgot password",
    description: "We'll email you a verification code.",
  },
  verify: {
    title: "Check your email",
    description: "Enter the code to continue.",
  },
  reset: {
    title: "Set a new password",
    description: "Choose a strong password you don't use elsewhere.",
  },
};

export function ForgotPasswordFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>({ name: "request" });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{COPY[step.name].title}</CardTitle>
        <CardDescription>{COPY[step.name].description}</CardDescription>
      </CardHeader>
      <CardContent>
        {step.name === "request" && (
          <RequestOtpForm
            onSent={(session) => setStep({ name: "verify", session })}
          />
        )}
        {step.name === "verify" && (
          <VerifyOtpForm
            session={step.session}
            onResent={(session) => setStep({ name: "verify", session })}
            onVerified={() => setStep({ name: "reset", session: step.session })}
          />
        )}
        {step.name === "reset" && (
          <ResetPasswordForm
            email={step.session.email}
            onDone={() => navigate("/login", { replace: true })}
          />
        )}
      </CardContent>
    </Card>
  );
}
