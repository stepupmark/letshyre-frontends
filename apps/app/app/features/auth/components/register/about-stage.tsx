import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { useEffect, useEffectEvent, useMemo } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"

import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"

import { sendEmailCode } from "../../services/auth.service"
import { FormAlert } from "../shared/form-alert"
import { useSendCode } from "../../mutations/use-send-code"

export function AboutStage({
  employer,
  signIn,
  defaults,
  onDraft,
  onSent,
}: {
  employer: boolean
  signIn: string
  defaults: { name: string; email: string }
  onDraft: (draft: { name: string; draftEmail: string }) => void
  onSent: (values: {
    name: string
    email: string
    emailKey: string
    emailSentAt: number
  }) => void
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

  const draft = useEffectEvent(onDraft)
  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values }) => {
          draft({ name: values.name, draftEmail: values.email })
        },
      }),
    [form]
  )

  const { send, sending, formError } = useSendCode({
    form,
    field: "email",
    send: async (values) => ({
      name: values.name.trim(),
      email: values.email,
      emailKey: await sendEmailCode(values.email, "Registration"),
      emailSentAt: Date.now(),
    }),
    onSent,
  })
  const emailTaken = errors.email?.message === t("errors.emailExists")

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
              <Link to={signIn} className="underline underline-offset-4">
                {t("register.signInInstead")}
              </Link>
            ) : (
              t("register.emailHint")
            )
          }
          {...checkOnBlur(form, "email")}
        />
      </FieldGroup>
      <Button type="submit" size="lg" disabled={sending}>
        {sending && <Spinner />}
        {sending ? t("register.sending") : t("register.continue")}
      </Button>
    </form>
  )
}
