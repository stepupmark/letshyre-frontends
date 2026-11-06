import { zodResolver } from "@hookform/resolvers/zod"
import { Trans, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { useId, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"

import { locale } from "@/lib/i18n"

import { type AuthErrorKey } from "../../lib/errors"
import { usePasswordSubmit } from "../../mutations/use-password-submit"
import { FormAlert } from "../shared/form-alert"
import { NewPasswordFields } from "../shared/new-password-fields"
import { newPasswordShape, passwordsMatch } from "../../schemas/password.schema"

export function PasswordStage({
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
              ...newPasswordShape(t),
              terms: z.boolean().refine(Boolean, t("validation.terms")),
            })
            .refine(...passwordsMatch(t)),
        [t]
      )
    ),
    defaultValues: { password: "", confirm: "", terms: false },
    mode: "onSubmit",
  })
  const { errors } = form.formState

  const create = usePasswordSubmit({
    submit: onCreate,
    onDone: onCreated,
    onLost,
    fallback: "errors.registerFailed",
  })
  const busy = create.isPending || create.isSuccess

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
      {create.errorKey && <FormAlert message={t(create.errorKey)} />}
      <FieldGroup>
        <NewPasswordFields form={form} label={t("fields.password")} />
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
                          to={`/${locale}/terms`}
                          reloadDocument
                          target="_blank"
                          className="underline underline-offset-4"
                        />
                      ),
                      privacy: (
                        <Link
                          to={`/${locale}/privacy-policy`}
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
      <Button type="submit" size="lg" disabled={busy}>
        {busy && <Spinner />}
        {busy ? t("register.creating") : t("register.create")}
      </Button>
    </form>
  )
}
