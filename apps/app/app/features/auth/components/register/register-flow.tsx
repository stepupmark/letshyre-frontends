import { homeFor, login, readSession } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { CircleAlert } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { useState } from "react"
import { Link } from "react-router"

import { api } from "@/lib/api"

import {
  register,
  sendEmailCode,
  verifyEmailCode,
} from "../../services/auth.service"
import { type Role } from "../../types"
import { signInPath } from "../../lib/audience"
import { CodeTicket } from "../shared/code-ticket"
import type { AuthErrorKey } from "../../lib/errors"
import { maskEmail } from "../../lib/mask"
import { StepFrame } from "../shared/step-frame"
import { useFlow } from "../../hooks/use-flow"
import { AboutStage } from "./about-stage"
import { reachable, registerFlowName, STAGES } from "../../lib/register"
import { type RegisterAnswers, type Stage } from "../../types"
import { MobileStage } from "./mobile-stage"
import { PasswordStage } from "./password-stage"

const WELCOME_FOR = 1200

export function RegisterFlow({
  role,
  onDone,
}: {
  role: Role
  /** signed in straight after: where to go */
  onDone: (to: string) => void
}) {
  const { t } = useTranslation("auth")
  const reduce = useReducedMotion()
  const flow = useFlow<Stage, RegisterAnswers>(
    registerFlowName(role),
    STAGES,
    reachable
  )
  const { step, data } = flow
  const [restartReason, setRestartReason] = useState<AuthErrorKey | null>(null)
  const employer = role === "Employer"
  const signIn = signInPath(employer ? "employer" : "candidate")
  const email = data.email ?? ""

  const restart = (key: AuthErrorKey) => {
    flow.update({
      emailKey: "",
      emailVerified: false,
      mobileKey: "",
      mobileVerified: false,
    })
    setRestartReason(key)
    flow.go("about", { replace: true })
  }

  const frame = {
    stepKey: step,
    direction: flow.direction,
    stages: STAGES.map((stage) => t(`stages.${stage}`)),
    current: flow.index,
    onBack: flow.index > 0 && !data.done ? flow.back : undefined,
  }

  switch (step) {
    case "about":
      return (
        <StepFrame
          {...frame}
          title={t(
            employer ? "register.employerTitle" : "register.candidateTitle"
          )}
          description={t(
            employer ? "register.employerLead" : "register.candidateLead"
          )}
        >
          {restartReason && (
            <Alert>
              <CircleAlert />
              <AlertDescription>{t(restartReason)}</AlertDescription>
            </Alert>
          )}
          <AboutStage
            employer={employer}
            signIn={signIn}
            defaults={{ name: data.name ?? "", email }}
            onDraft={flow.update}
            onSent={(values) => {
              setRestartReason(null)
              flow.update({ ...values, emailVerified: false })
              flow.go("email")
            }}
          />
          <p className="text-sm text-muted-foreground">
            {t("register.haveAccount")}{" "}
            <Link
              to={signIn}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t("register.signIn")}
            </Link>
          </p>
        </StepFrame>
      )

    case "email":
      return (
        <StepFrame {...frame} title={t("register.emailCodeTitle")}>
          <CodeTicket
            destination={maskEmail(email)}
            email={email}
            sentAt={data.emailSentAt}
            hint={t("code.spamHint")}
            onChangeDestination={() => {
              flow.go("about")
            }}
            verify={(code) =>
              verifyEmailCode({
                email,
                key: data.emailKey ?? "",
                code,
                purpose: "Registration",
              })
            }
            resend={async () => {
              flow.update({
                emailKey: await sendEmailCode(email, "Registration"),
                emailSentAt: Date.now(),
              })
            }}
            onVerified={() => {
              flow.update({ emailVerified: true })
              flow.go("mobile")
            }}
            onLost={restart}
          />
        </StepFrame>
      )

    case "mobile":
      return (
        <StepFrame
          {...frame}
          title={t("register.mobileTitle")}
          description={t("register.mobileLead")}
        >
          <MobileStage
            phone={data.phone ?? ""}
            mobileKey={data.mobileKey ?? ""}
            sentAt={data.mobileSentAt}
            onSent={(values) => {
              flow.update({ ...values, mobileVerified: false })
            }}
            onChangeNumber={() => {
              flow.update({ mobileKey: "", mobileSentAt: 0 })
            }}
            onVerified={() => {
              flow.update({ mobileVerified: true })
              flow.go("password")
            }}
            onLost={restart}
          />
        </StepFrame>
      )

    case "password":
      return (
        <StepFrame
          {...frame}
          title={
            data.done
              ? t("register.doneTitle", {
                  name: data.name?.split(" ")[0] ?? "",
                })
              : t("register.passwordTitle")
          }
          description={
            data.done ? t("register.doneLead") : t("register.passwordLead")
          }
        >
          <PasswordStage
            onCreate={async (password) => {
              await register({
                role,
                name: data.name ?? "",
                email,
                emailKey: data.emailKey ?? "",
                phone: data.phone ?? "",
                mobileKey: data.mobileKey ?? "",
                password,
              })
              // straight in; if that fails the account still exists, so sign-in will do
              try {
                await login(api, { email, password })
                const session = readSession()
                return session.status === "signed-in" ? homeFor(session) : null
              } catch {
                return null
              }
            }}
            onCreated={(to) => {
              flow.update({ done: true })
              setTimeout(
                () => {
                  flow.forget()
                  onDone(to ?? signIn)
                },
                reduce ? 0 : WELCOME_FOR
              )
            }}
            onLost={restart}
          />
        </StepFrame>
      )
  }
}
