import { zodResolver } from "@hookform/resolvers/zod"
import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from "react"
import { useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router"

import { PAGES } from "@/lib/pages"

import { describeSendError } from "../lib/send-error"
import { useSendContactMessage } from "../mutations/use-send-contact-message"
import {
  type ContactValues,
  makeContactSchema,
} from "../schemas/contact.schema"

const subscribe = () => () => undefined

const EMPTY: ContactValues = { name: "", email: "", subject: "", message: "" }

export function ContactForm() {
  const { t } = useTranslation("contact")
  const lang = useLocale()
  const id = useId()
  const [params] = useSearchParams()
  const topic = params.get("topic")
  const successRef = useRef<HTMLHeadingElement>(null)

  const schema = useMemo(() => makeContactSchema(t), [t])
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
    mode: "onTouched",
  })
  const { errors } = form.formState
  const send = useSendContactMessage()
  // a submit before hydration would put the message in the URL
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  // the page is prerendered without a query string, so prefill after hydration
  useEffect(() => {
    if (topic === "sales" && !form.getValues("subject")) {
      form.setValue("subject", t("form.topics.sales"))
    }
  }, [topic, form, t])

  useEffect(() => {
    if (send.isSuccess) successRef.current?.focus()
  }, [send.isSuccess])

  if (send.isSuccess) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-xl border bg-muted/40 p-6 sm:p-8"
      >
        <h2
          ref={successRef}
          tabIndex={-1}
          className="text-xl font-semibold tracking-tight outline-none"
        >
          {t("form.successTitle")}
        </h2>
        <p className="text-pretty text-muted-foreground">
          {t("form.successBody")}
        </p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => {
            form.reset(EMPTY)
            send.reset()
          }}
        >
          {t("form.sendAnother")}
        </Button>
      </div>
    )
  }

  const failure = send.isError ? describeSendError(send.error) : null
  const fieldId = (name: keyof ContactValues) => `${id}-${name}`
  const errorId = (name: keyof ContactValues) => `${id}-${name}-error`
  const invalid = (name: keyof ContactValues) => Boolean(errors[name])
  const describedBy = (name: keyof ContactValues) =>
    errors[name] ? errorId(name) : undefined

  return (
    <form
      noValidate
      method="post"
      aria-labelledby={`${id}-title`}
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          send.mutate(values)
        })(event)
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <h2
          id={`${id}-title`}
          className="text-2xl font-semibold tracking-tight"
        >
          {t("form.title")}
        </h2>
        <p className="text-muted-foreground">{t("form.subtitle")}</p>
      </div>

      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={invalid("name")}>
            <FieldLabel htmlFor={fieldId("name")}>
              {t("form.fields.name")}
            </FieldLabel>
            <Input
              id={fieldId("name")}
              autoComplete="name"
              aria-invalid={invalid("name")}
              aria-describedby={describedBy("name")}
              {...form.register("name")}
            />
            <FieldError id={errorId("name")}>{errors.name?.message}</FieldError>
          </Field>
          <Field data-invalid={invalid("email")}>
            <FieldLabel htmlFor={fieldId("email")}>
              {t("form.fields.email")}
            </FieldLabel>
            <Input
              id={fieldId("email")}
              type="email"
              autoComplete="email"
              aria-invalid={invalid("email")}
              aria-describedby={describedBy("email")}
              {...form.register("email")}
            />
            <FieldError id={errorId("email")}>
              {errors.email?.message}
            </FieldError>
          </Field>
        </div>
        <Field data-invalid={invalid("subject")}>
          <FieldLabel htmlFor={fieldId("subject")}>
            {t("form.fields.subject")}
          </FieldLabel>
          <Input
            id={fieldId("subject")}
            aria-invalid={invalid("subject")}
            aria-describedby={describedBy("subject")}
            {...form.register("subject")}
          />
          <FieldError id={errorId("subject")}>
            {errors.subject?.message}
          </FieldError>
        </Field>
        <Field data-invalid={invalid("message")}>
          <FieldLabel htmlFor={fieldId("message")}>
            {t("form.fields.message")}
          </FieldLabel>
          <Textarea
            id={fieldId("message")}
            rows={6}
            className="min-h-36"
            aria-invalid={invalid("message")}
            aria-describedby={describedBy("message")}
            {...form.register("message")}
          />
          <FieldError id={errorId("message")}>
            {errors.message?.message}
          </FieldError>
        </Field>
        <FieldDescription>
          <Trans
            t={t}
            i18nKey="form.privacy"
            components={{
              pp: <Link to={localePath(lang, PAGES.privacy.path)} />,
            }}
          />
        </FieldDescription>
      </FieldGroup>

      {failure && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <p>{t(`form.errors.${failure.kind}`)}</p>
          {failure.detail && <p className="mt-1">{failure.detail}</p>}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="self-start"
        disabled={!hydrated || send.isPending}
      >
        {send.isPending ? t("form.sending") : t("form.submit")}
      </Button>
    </form>
  )
}
