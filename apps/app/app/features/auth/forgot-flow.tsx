import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { useMutation } from "@tanstack/react-query"
import { CircleAlert } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import { resetPassword, sendEmailCode, verifyEmailCode } from "./api"
import { CodeTicket } from "./code-ticket"
import { authErrorKey, isVerificationLost, type AuthErrorKey } from "./errors"
import {
  FORGOT_FLOW,
  FORGOT_STEPS,
  forgotReachable,
  type ForgotAnswers,
  type ForgotStep,
} from "./forgot-answers"
import { FormAlert } from "./form-alert"
import { maskEmail } from "./mask"
import { NewPasswordFields } from "./new-password-fields"
import { newPasswordShape, passwordsMatch } from "./password-schema"
import { StepFrame } from "./step-frame"
import { useFlow } from "./use-flow"
import { useSendCode } from "./use-send-code"

export function ForgotFlow({
  signIn,
  onDone,
}: {
  /** the sign-in page they came from */
  signIn: string
  onDone: (email: string) => void
}) {
  const { t } = useTranslation("auth")
  const flow = useFlow<ForgotStep, ForgotAnswers>(
    FORGOT_FLOW,
    FORGOT_STEPS,
    forgotReachable
  )
  const { step, data } = flow
  const [restartReason, setRestartReason] = useState<AuthErrorKey | null>(null)
  const email = data.email ?? ""

  const restart = (key: AuthErrorKey) => {
    flow.update({ key: "", verified: false })
    setRestartReason(key)
    flow.go("email", { replace: true })
  }

  const frame = {
    stepKey: step,
    direction: flow.direction,
    stages: [t("fields.email"), t("forgot.codeStage"), t("fields.newPassword")],
    current: flow.index,
    onBack: flow.index > 0 ? flow.back : undefined,
  }

  switch (step) {
    case "email":
      return (
        <StepFrame
          {...frame}
          title={t("forgot.title")}
          description={t("forgot.lead")}
        >
          {restartReason && (
            <Alert>
              <CircleAlert />
              <AlertDescription>{t(restartReason)}</AlertDescription>
            </Alert>
          )}
          <EmailForm
            defaultEmail={email}
            onSent={(values) => {
              setRestartReason(null)
              flow.update({ ...values, verified: false })
              flow.go("code")
            }}
          />
          <Link
            to={signIn}
            className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("forgot.backToSignIn")}
          </Link>
        </StepFrame>
      )

    case "code":
      return (
        <StepFrame {...frame} title={t("forgot.codeTitle")}>
          <CodeTicket
            destination={maskEmail(email)}
            email={email}
            sentAt={data.sentAt}
            hint={t("code.spamHint")}
            onChangeDestination={() => {
              flow.go("email")
            }}
            verify={(code) =>
              verifyEmailCode({
                email,
                key: data.key ?? "",
                code,
                purpose: "Forgot Password",
              })
            }
            resend={async () => {
              flow.update({
                key: await sendEmailCode(email, "Forgot Password"),
                sentAt: Date.now(),
              })
            }}
            onVerified={() => {
              flow.update({ verified: true })
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
          title={t("forgot.passwordTitle")}
          description={t("forgot.passwordLead")}
        >
          <NewPasswordForm
            onSave={async (password) => {
              await resetPassword({ email, key: data.key ?? "", password })
            }}
            onSaved={() => {
              flow.forget()
              onDone(email)
            }}
            onLost={restart}
          />
        </StepFrame>
      )
  }
}

function EmailForm({
  defaultEmail,
  onSent,
}: {
  defaultEmail: string
  onSent: (values: { email: string; key: string; sentAt: number }) => void
}) {
  const { t } = useTranslation("auth")
  const form = useForm({
    resolver: zodResolver(
      useMemo(
        () => z.object({ email: z.email(t("validation.emailInvalid")) }),
        [t]
      )
    ),
    defaultValues: { email: defaultEmail },
    mode: "onSubmit",
  })
  const { send, sending, formError } = useSendCode({
    form,
    field: "email",
    send: async ({ email }) => ({
      email,
      key: await sendEmailCode(email, "Forgot Password"),
      sentAt: Date.now(),
    }),
    onSent,
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          send(values)
        })(event)
      }}
    >
      {formError && <FormAlert message={formError} />}
      <TextField
        label={t("fields.email")}
        type="email"
        autoComplete="email"
        inputMode="email"
        autoFocus
        error={form.formState.errors.email?.message}
        {...checkOnBlur(form, "email")}
      />
      <Button type="submit" size="lg" disabled={sending}>
        {sending && <Spinner />}
        {sending ? t("register.sending") : t("forgot.sendCode")}
      </Button>
    </form>
  )
}

function NewPasswordForm({
  onSave,
  onSaved,
  onLost,
}: {
  onSave: (password: string) => Promise<void>
  onSaved: () => void
  onLost: (key: AuthErrorKey) => void
}) {
  const { t } = useTranslation("auth")
  const form = useForm({
    resolver: zodResolver(
      useMemo(
        () => z.object(newPasswordShape(t)).refine(...passwordsMatch(t)),
        [t]
      )
    ),
    defaultValues: { password: "", confirm: "" },
    mode: "onSubmit",
  })

  const save = useMutation({
    mutationFn: onSave,
    onSuccess: onSaved,
    onError: (error) => {
      const key = authErrorKey(error, "errors.resetFailed")
      if (isVerificationLost(key)) onLost(key)
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          save.mutate(values.password)
        })(event)
      }}
    >
      {save.isError && (
        <FormAlert
          message={t(authErrorKey(save.error, "errors.resetFailed"))}
        />
      )}
      <FieldGroup>
        <NewPasswordFields form={form} label={t("fields.newPassword")} />
      </FieldGroup>
      <Button type="submit" size="lg" disabled={save.isPending}>
        {save.isPending && <Spinner />}
        {save.isPending ? t("forgot.saving") : t("forgot.save")}
      </Button>
    </form>
  )
}
