import { zodResolver } from "@hookform/resolvers/zod"
import { homeFor, login, readSession, SIGN_IN } from "@workspace/auth"
import { Trans, useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { useMutation } from "@tanstack/react-query"
import { Check, Circle, CircleAlert } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"

import { PasswordField, TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { api } from "@/lib/api"

import {
  register,
  sendEmailCode,
  sendMobileCode,
  verifyEmailCode,
  verifyMobileCode,
  type Role,
} from "./api"
import { CodeStep } from "./code-step"
import {
  authErrorKey,
  FIELD_OF,
  isVerificationLost,
  type AuthErrorKey,
} from "./errors"
import { maskEmail, maskPhone } from "./mask"
import { StepFrame } from "./step-frame"
import { useFlow } from "./use-flow"

const STEPS = [
  "details",
  "email-code",
  "mobile",
  "mobile-code",
  "password",
] as const
type Step = (typeof STEPS)[number]

interface Answers {
  name: string
  email: string
  emailKey: string
  emailVerified: boolean
  phone: string
  mobileKey: string
  mobileVerified: boolean
}

const reachable = (step: Step, d: Partial<Answers>) =>
  ({
    details: true,
    "email-code": Boolean(d.emailKey),
    mobile: Boolean(d.emailVerified),
    "mobile-code": Boolean(d.emailVerified && d.mobileKey),
    password: Boolean(d.emailVerified && d.mobileVerified),
  })[step]

export function RegisterFlow({
  role,
  onDone,
}: {
  role: Role
  /** signed in straight after: where to go */
  onDone: (to: string) => void
}) {
  const { t } = useTranslation("auth")
  const flow = useFlow<Step, Answers>(`register:${role}`, STEPS, reachable)
  const { step, data } = flow
  const [restartReason, setRestartReason] = useState<AuthErrorKey | null>(null)
  const employer = role === "Employer"

  const restart = (key: AuthErrorKey) => {
    flow.update({
      emailKey: "",
      emailVerified: false,
      mobileKey: "",
      mobileVerified: false,
    })
    setRestartReason(key)
    flow.go("details", { replace: true })
  }

  const frame = {
    stepKey: step,
    direction: flow.direction,
    progress: { current: flow.index + 1, total: STEPS.length },
    onBack: flow.index > 0 ? flow.back : undefined,
  }

  switch (step) {
    case "details":
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
          <DetailsForm
            employer={employer}
            defaults={{ name: data.name ?? "", email: data.email ?? "" }}
            onSent={(values) => {
              setRestartReason(null)
              flow.update({ ...values, emailVerified: false })
              flow.go("email-code")
            }}
          />
          <p className="text-sm text-muted-foreground">
            {t("register.haveAccount")}{" "}
            <Link
              to="/sign-in"
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t("register.signIn")}
            </Link>
          </p>
        </StepFrame>
      )

    case "email-code":
      return (
        <StepFrame {...frame} title={t("register.emailCodeTitle")}>
          <CodeStep
            destination={maskEmail(data.email ?? "")}
            hint={t("code.spamHint")}
            onChangeDestination={() => {
              flow.go("details")
            }}
            verify={(code) =>
              verifyEmailCode({
                email: data.email ?? "",
                key: data.emailKey ?? "",
                code,
                purpose: "Registration",
              })
            }
            resend={async () => {
              flow.update({
                emailKey: await sendEmailCode(data.email ?? "", "Registration"),
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
          <MobileForm
            defaultPhone={data.phone ?? ""}
            onSent={(values) => {
              flow.update({ ...values, mobileVerified: false })
              flow.go("mobile-code")
            }}
          />
        </StepFrame>
      )

    case "mobile-code":
      return (
        <StepFrame {...frame} title={t("register.mobileCodeTitle")}>
          <CodeStep
            destination={maskPhone(data.phone ?? "")}
            onChangeDestination={() => {
              flow.go("mobile")
            }}
            verify={(code) =>
              verifyMobileCode({
                phone: data.phone ?? "",
                key: data.mobileKey ?? "",
                code,
              })
            }
            resend={async () => {
              flow.update({ mobileKey: await sendMobileCode(data.phone ?? "") })
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
          title={t("register.passwordTitle")}
          description={t("register.passwordLead")}
        >
          <PasswordForm
            onCreate={async (password) => {
              await register({
                role,
                name: data.name ?? "",
                email: data.email ?? "",
                emailKey: data.emailKey ?? "",
                phone: data.phone ?? "",
                mobileKey: data.mobileKey ?? "",
                password,
              })
              flow.forget()
              // straight in; if that fails the account still exists, so sign-in will do
              try {
                await login(api, { email: data.email ?? "", password })
                const session = readSession()
                return session.status === "signed-in" ? homeFor(session) : null
              } catch {
                return null
              }
            }}
            onCreated={(to) => {
              onDone(to ?? SIGN_IN)
            }}
            onLost={restart}
          />
        </StepFrame>
      )
  }
}

function DetailsForm({
  employer,
  defaults,
  onSent,
}: {
  employer: boolean
  defaults: { name: string; email: string }
  onSent: (values: { name: string; email: string; emailKey: string }) => void
}) {
  const { t } = useTranslation("auth")
  const form = useForm({
    resolver: zodResolver(
      useMemo(
        () =>
          z.object({
            name: z.string().trim().min(2, t("validation.nameRequired")),
            email: z.email(t("validation.emailInvalid")),
          }),
        [t]
      )
    ),
    defaultValues: defaults,
    mode: "onSubmit",
  })
  const { errors } = form.formState

  const send = useMutation({
    mutationFn: async (values: { name: string; email: string }) => ({
      ...values,
      name: values.name.trim(),
      emailKey: await sendEmailCode(values.email, "Registration"),
    }),
    onSuccess: onSent,
    onError: (error) => {
      const key = authErrorKey(error, "errors.sendFailed")
      if (FIELD_OF[key] === "email") {
        form.setError("email", { message: t(key) }, { shouldFocus: true })
      }
    },
  })
  const formError =
    send.isError &&
    FIELD_OF[authErrorKey(send.error, "errors.sendFailed")] !== "email"
      ? t(authErrorKey(send.error, "errors.sendFailed"))
      : null
  const emailTaken = errors.email?.message === t("errors.emailExists")

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
      {formError && <FormAlert message={formError} />}
      <FieldGroup>
        <TextField
          label={t("fields.name")}
          autoComplete="name"
          autoFocus
          error={errors.name?.message}
          {...checkOnBlur(form, "name")}
        />
        <TextField
          label={t(employer ? "fields.workEmail" : "fields.email")}
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          hint={
            emailTaken ? (
              <Link to="/sign-in" className="underline underline-offset-4">
                {t("register.signInInstead")}
              </Link>
            ) : (
              t("register.emailHint")
            )
          }
          {...checkOnBlur(form, "email")}
        />
      </FieldGroup>
      <Button type="submit" size="lg" disabled={send.isPending}>
        {send.isPending && <Spinner />}
        {send.isPending ? t("register.sending") : t("register.continue")}
      </Button>
    </form>
  )
}

function MobileForm({
  defaultPhone,
  onSent,
}: {
  defaultPhone: string
  onSent: (values: { phone: string; mobileKey: string }) => void
}) {
  const { t } = useTranslation("auth")
  const form = useForm({
    resolver: zodResolver(
      useMemo(
        () =>
          z.object({
            phone: z.string().regex(/^\d{10}$/, t("validation.mobileInvalid")),
          }),
        [t]
      )
    ),
    defaultValues: { phone: defaultPhone },
    mode: "onSubmit",
  })
  const { errors } = form.formState
  const phoneField = checkOnBlur(form, "phone")

  const send = useMutation({
    mutationFn: async ({ phone }: { phone: string }) => ({
      phone,
      mobileKey: await sendMobileCode(phone),
    }),
    onSuccess: onSent,
    onError: (error) => {
      const key = authErrorKey(error, "errors.sendFailed")
      if (FIELD_OF[key] === "phone") {
        form.setError("phone", { message: t(key) }, { shouldFocus: true })
      }
    },
  })
  const formError =
    send.isError &&
    FIELD_OF[authErrorKey(send.error, "errors.sendFailed")] !== "phone"
      ? t(authErrorKey(send.error, "errors.sendFailed"))
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
      {formError && <FormAlert message={formError} />}
      <TextField
        label={t("fields.mobile")}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        autoFocus
        hint={t("register.mobileHint")}
        error={errors.phone?.message}
        {...phoneField}
        onChange={(event) => {
          // pasted numbers often carry spaces or a +91
          event.target.value = event.target.value
            .replace(/\D/g, "")
            .replace(/^91(?=\d{10}$)/, "")
            .slice(0, 10)
          void phoneField.onChange(event)
        }}
      />
      <Button type="submit" size="lg" disabled={send.isPending}>
        {send.isPending && <Spinner />}
        {send.isPending ? t("register.sending") : t("register.sendCode")}
      </Button>
    </form>
  )
}

function PasswordForm({
  onCreate,
  onCreated,
  onLost,
}: {
  onCreate: (password: string) => Promise<string | null>
  onCreated: (to: string | null) => void
  onLost: (key: AuthErrorKey) => void
}) {
  const { t } = useTranslation("auth")
  const termsId = useId()
  const form = useForm({
    resolver: zodResolver(
      useMemo(
        () =>
          z
            .object({
              password: z.string().min(8, t("validation.passwordMin")),
              confirm: z.string(),
              terms: z.boolean().refine(Boolean, t("validation.terms")),
            })
            .refine((v) => v.password === v.confirm, {
              message: t("validation.passwordsDiffer"),
              path: ["confirm"],
            }),
        [t]
      )
    ),
    defaultValues: { password: "", confirm: "", terms: false },
    mode: "onSubmit",
  })
  const { errors } = form.formState
  const [password, confirm] = useWatch({
    control: form.control,
    name: ["password", "confirm"],
  })

  const create = useMutation({
    mutationFn: onCreate,
    onSuccess: onCreated,
    onError: (error) => {
      const key = authErrorKey(error, "errors.registerFailed")
      if (isVerificationLost(key)) onLost(key)
    },
  })

  const rules = [
    { ok: password.length >= 8, label: t("register.ruleLength") },
    {
      ok: password.length > 0 && password === confirm,
      label: t("register.ruleMatch"),
    },
  ]

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          create.mutate(values.password)
        })(event)
      }}
    >
      {create.isError && (
        <FormAlert
          message={t(authErrorKey(create.error, "errors.registerFailed"))}
        />
      )}
      <FieldGroup>
        <PasswordField
          label={t("fields.password")}
          autoComplete="new-password"
          autoFocus
          error={errors.password?.message}
          {...checkOnBlur(form, "password")}
        />
        <PasswordField
          label={t("fields.confirmPassword")}
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...checkOnBlur(form, "confirm")}
        />
        <ul
          className="flex flex-col gap-1 text-sm"
          aria-label={t("register.rules")}
        >
          {rules.map((rule) => (
            <li
              key={rule.label}
              className={
                rule.ok
                  ? "flex items-center gap-2 text-success"
                  : "flex items-center gap-2 text-muted-foreground"
              }
            >
              {rule.ok ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Circle className="size-4" aria-hidden="true" />
              )}
              {rule.label}
              <span className="sr-only">
                {rule.ok ? t("register.ruleMet") : t("register.ruleUnmet")}
              </span>
            </li>
          ))}
        </ul>
        <Controller
          control={form.control}
          name="terms"
          render={({ field }) => (
            <Field
              orientation="horizontal"
              data-invalid={Boolean(errors.terms)}
            >
              <Checkbox
                id={termsId}
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked)
                }}
                onBlur={field.onBlur}
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={errors.terms ? `${termsId}-error` : undefined}
              />
              <FieldLabel htmlFor={termsId} className="font-normal">
                <span>
                  <Trans
                    t={t}
                    i18nKey="register.terms"
                    components={{
                      terms: (
                        <Link
                          to="/en/terms"
                          reloadDocument
                          target="_blank"
                          className="underline underline-offset-4"
                        />
                      ),
                      privacy: (
                        <Link
                          to="/en/policy"
                          reloadDocument
                          target="_blank"
                          className="underline underline-offset-4"
                        />
                      ),
                    }}
                  />
                </span>
              </FieldLabel>
            </Field>
          )}
        />
        <FieldError id={`${termsId}-error`} className="-mt-4">
          {errors.terms?.message}
        </FieldError>
      </FieldGroup>
      <Button
        type="submit"
        size="lg"
        disabled={create.isPending || create.isSuccess}
      >
        {(create.isPending || create.isSuccess) && <Spinner />}
        {create.isPending || create.isSuccess
          ? t("register.creating")
          : t("register.create")}
      </Button>
    </form>
  )
}

function FormAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
