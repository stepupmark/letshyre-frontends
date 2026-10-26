import { SIGN_IN } from "@workspace/auth"
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowLeft } from "lucide-react"

import type { OtpSession } from "../types"
import { AuthHeading } from "./auth-layout"
import { RequestOtpForm } from "./request-otp-form"
import { ResetPasswordForm } from "./reset-password-form"
import { VerifyOtpForm } from "./verify-otp-form"

type Step =
  | { name: "request" }
  | { name: "verify"; session: OtpSession }
  | { name: "reset"; session: OtpSession }

const STEP_NUMBER: Record<Step["name"], number> = {
  request: 1,
  verify: 2,
  reset: 3,
}

function maskEmail(email: string) {
  const [name = "", domain = ""] = email.split("@")
  return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`
}

function heading(step: Step) {
  switch (step.name) {
    case "request":
      return {
        title: "Reset your password",
        description:
          "Enter the email on your admin account and we'll send you a verification code.",
      }
    case "verify":
      return {
        title: "Check your email",
        description: `We sent a 6-digit code to ${maskEmail(step.session.email)}.`,
      }
    case "reset":
      return {
        title: "Set a new password",
        description: "Choose a strong password you don't use anywhere else.",
      }
  }
}

export function ForgotPasswordFlow() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>({ name: "request" })

  return (
    <>
      <div className="mb-10 flex items-center justify-between text-sm">
        <Link
          to={SIGN_IN}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
        <span className="text-muted-foreground tabular-nums">
          Step {STEP_NUMBER[step.name]} of 3
        </span>
      </div>
      <AuthHeading {...heading(step)} />
      {step.name === "request" && (
        <RequestOtpForm
          onSent={(session) => {
            setStep({ name: "verify", session })
          }}
        />
      )}
      {step.name === "verify" && (
        <VerifyOtpForm
          session={step.session}
          onResent={(session) => {
            setStep({ name: "verify", session })
          }}
          onVerified={() => {
            setStep({ name: "reset", session: step.session })
          }}
        />
      )}
      {step.name === "reset" && (
        <ResetPasswordForm
          session={step.session}
          onDone={() => {
            void navigate(SIGN_IN, { replace: true })
          }}
        />
      )}
    </>
  )
}
