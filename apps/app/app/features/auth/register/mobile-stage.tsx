import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { Spinner } from "@workspace/ui/components/spinner"
import { useEffect, useId, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { checkOnBlur } from "@/lib/forms"

import { sendMobileCode, verifyMobileCode } from "../api"
import { CodeTicket } from "../code-ticket"
import type { AuthErrorKey } from "../errors"
import { FormAlert } from "../form-alert"
import { maskPhone } from "../mask"
import { useSendCode } from "../use-send-code"

const COUNTRY_CODE = "+91"

/** Number and its code on one screen: the ticket appears once a code is sent. */
export function MobileStage({
  phone,
  mobileKey,
  sentAt,
  onSent,
  onChangeNumber,
  onVerified,
  onLost,
}: {
  phone: string
  mobileKey: string
  sentAt?: number
  onSent: (values: {
    phone: string
    mobileKey: string
    mobileSentAt: number
  }) => void
  onChangeNumber: () => void
  onVerified: () => void
  onLost: (key: AuthErrorKey) => void
}) {
  const { t } = useTranslation("auth")
  const id = useId()
  const sent = Boolean(mobileKey)
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
    defaultValues: { phone },
    mode: "onSubmit",
  })
  const error = form.formState.errors.phone?.message
  const phoneField = checkOnBlur(form, "phone")

  useEffect(() => {
    if (!sent) form.setFocus("phone")
  }, [sent, form])

  const sendCode = useSendCode({
    form,
    field: "phone",
    send: async (values) => ({
      phone: values.phone,
      mobileKey: await sendMobileCode(values.phone),
      mobileSentAt: Date.now(),
    }),
    onSent,
  })

  return (
    <div className="flex flex-col gap-6">
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            sendCode.send(values)
          })(event)
        }}
      >
        {sendCode.formError && <FormAlert message={sendCode.formError} />}
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={id}>{t("fields.mobile")}</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>{COUNTRY_CODE}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={id}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              readOnly={sent}
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
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
          </InputGroup>
          <FieldDescription id={`${id}-hint`}>
            {t("register.mobileHint")}
          </FieldDescription>
          <FieldError id={`${id}-error`}>{error}</FieldError>
        </Field>
        {!sent && (
          <Button type="submit" size="lg" disabled={sendCode.sending}>
            {sendCode.sending && <Spinner />}
            {sendCode.sending ? t("register.sending") : t("register.sendCode")}
          </Button>
        )}
      </form>

      {sent && (
        <CodeTicket
          destination={maskPhone(phone)}
          sentAt={sentAt}
          onChangeDestination={onChangeNumber}
          verify={(code) => verifyMobileCode({ phone, key: mobileKey, code })}
          resend={async () => {
            onSent({
              phone,
              mobileKey: await sendMobileCode(phone),
              mobileSentAt: Date.now(),
            })
          }}
          onVerified={onVerified}
          onLost={onLost}
        />
      )}
    </div>
  )
}
