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

import { PasswordField, TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import { resetPassword, sendEmailCode, verifyEmailCode } from "./api"
import { CodeStep } from "./code-step"
import {
  authErrorKey,
  FIELD_OF,
  isVerificationLost,
  type AuthErrorKey,
} from "./errors"
import { maskEmail } from "./mask"
import { StepFrame } from "./step-frame"
import { useFlow } from "./use-flow"

const STEPS = ["email", "code", "password"] as const
type Step = (typeof STEPS)[number]

interface Answers {
  email: string
  key: string
  verified: boolean
}

const reachable = (step: Step, d: Partial<Answers>) =>
  ({
    email: true,
    code: Boolean(d.key),
    password: Boolean(d.key && d.verified),
  })[step]

export function ForgotFlow({ onDone }: { onDone: (email: string) => void }) {
  const { t } = useTranslation("auth")
  const flow = useFlow<Step, Answers>("forgot", STEPS, reachable)
  const { step, data } = flow
  const [restartReason, setRestartReason] = useState<AuthErrorKey | null>(null)

  const restart = (key: AuthErrorKey) => {
    flow.update({ key: "", verified: false })
    setRestartReason(key)
    flow.go("email", { replace: true })
  }

  const frame = {
    stepKey: step,
    direction: flow.direction,
    progress: { current: flow.index + 1, total: STEPS.length },
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
            defaultEmail={data.email ?? ""}
            onSent={(values) => {
              setRestartReason(null)
              flow.update({ ...values, verified: false })
              flow.go("code")
            }}
          />
          <Link
            to="/sign-in"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("forgot.backToSignIn")}
          </Link>
        </StepFrame>
      )

    case "code":
      return (
        <StepFrame {...frame} title={t("forgot.codeTitle")}>
          <CodeStep
            destination={maskEmail(data.email ?? "")}
            hint={t("code.spamHint")}
            onChangeDestination={() => {
              flow.go("email")
            }}
            verify={(code) =>
              verifyEmailCode({
                email: data.email ?? "",
                key: data.key ?? "",
                code,
                purpose: "Forgot Password",
              })
            }
            resend={async () => {
              flow.update({
                key: await sendEmailCode(data.email ?? "", "Forgot Password"),
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
              await resetPassword({
                email: data.email ?? "",
                key: data.key ?? "",
                password,
              })
              flow.forget()
            }}
            onSaved={() => {
              onDone(data.email ?? "")
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
  onSent: (values: { email: string; key: string }) => void
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
  const { errors } = form.formState

  const send = useMutation({
    mutationFn: async ({ email }: { email: string }) => ({
      email,
      key: await sendEmailCode(email, "Forgot Password"),
    }),
    onSuccess: onSent,
    onError: (error) => {
      const key = authErrorKey(error, "errors.sendFailed")
      if (FIELD_OF[key] === "email")
        form.setError("email", { message: t(key) }, { shouldFocus: true })
    },
  })
  const key = send.isError
    ? authErrorKey(send.error, "errors.sendFailed")
    : null

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          send.mutate(values)
        })(event)
      }}
    >
      {key && !FIELD_OF[key] && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{t(key)}</AlertDescription>
        </Alert>
      )}
      <TextField
        label={t("fields.email")}
        type="email"
        autoComplete="email"
        inputMode="email"
        autoFocus
        error={errors.email?.message}
        {...checkOnBlur(form, "email")}
      />
      <Button type="submit" size="lg" disabled={send.isPending}>
        {send.isPending && <Spinner />}
        {send.isPending ? t("register.sending") : t("forgot.sendCode")}
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
        () =>
          z
            .object({
              password: z.string().min(8, t("validation.passwordMin")),
              confirm: z.string(),
            })
            .refine((v) => v.password === v.confirm, {
              message: t("validation.passwordsDiffer"),
              path: ["confirm"],
            }),
        [t]
      )
    ),
    defaultValues: { password: "", confirm: "" },
    mode: "onSubmit",
  })
  const { errors } = form.formState

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
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>
            {t(authErrorKey(save.error, "errors.resetFailed"))}
          </AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <PasswordField
          label={t("fields.newPassword")}
          autoComplete="new-password"
          autoFocus
          hint={t("register.ruleLength")}
          error={errors.password?.message}
          {...checkOnBlur(form, "password")}
        />
        <PasswordField
          label={t("fields.confirmPassword")}
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...checkOnBlur(form, "confirm")}
        />
      </FieldGroup>
      <Button type="submit" size="lg" disabled={save.isPending}>
        {save.isPending && <Spinner />}
        {save.isPending ? t("forgot.saving") : t("forgot.save")}
      </Button>
    </form>
  )
}
