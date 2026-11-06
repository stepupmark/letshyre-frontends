import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { CircleAlert } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import {
  resetPassword,
  sendEmailCode,
  verifyEmailCode,
} from "../../services/auth.service"
import { usePasswordSubmit } from "../../mutations/use-password-submit"
import { CodeStep } from "../shared/code-step"
import { authErrorKey, type AuthErrorKey } from "../../lib/errors"
import { FORGOT_FLOW, FORGOT_STEPS, forgotReachable } from "../../lib/forgot"
import { type ForgotAnswers, type ForgotStep } from "../../types"
import { FormAlert } from "../shared/form-alert"
import { maskEmail } from "../../lib/mask"
import { NewPasswordFields } from "../shared/new-password-fields"
import { newPasswordShape, passwordsMatch } from "../../schemas/password.schema"
import { StepFrame } from "../shared/step-frame"
import { useFlow } from "../../hooks/use-flow"
import { useSendCode } from "../../mutations/use-send-code"

// an unknown email still gets a code step, so this page can't be used to
// check who has an account
const NO_ACCOUNT = "no-account"

async function sendResetCode(email: string) {
  try {
    return await sendEmailCode(email, "Forgot Password")
  } catch (error) {
    if (authErrorKey(error, "errors.sendFailed") === "errors.emailNotFound")
      return NO_ACCOUNT
    throw error
  }
}

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
          <CodeStep
            destination={maskEmail(email)}
            email={email}
            sentAt={data.sentAt}
            hint={t("code.spamHint")}
            onChangeDestination={() => {
              flow.go("email")
            }}
            verify={(code) =>
              data.key === NO_ACCOUNT
                ? Promise.reject(new Error(NO_ACCOUNT))
                : verifyEmailCode({
                    email,
                    key: data.key ?? "",
                    code,
                    purpose: "Forgot Password",
                  })
            }
            resend={async () => {
              flow.update({
                key: await sendResetCode(email),
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
      key: await sendResetCode(email),
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

  const save = usePasswordSubmit({
    submit: onSave,
    onDone: onSaved,
    onLost,
    fallback: "errors.resetFailed",
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
      {save.errorKey && <FormAlert message={t(save.errorKey)} />}
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
