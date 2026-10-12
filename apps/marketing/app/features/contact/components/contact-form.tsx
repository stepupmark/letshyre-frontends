import { zodResolver } from "@hookform/resolvers/zod"
import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { CircleAlertIcon, SendIcon } from "lucide-react"
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { useForm, useWatch } from "react-hook-form"
import { Link } from "react-router"

import { useHydrated } from "@/hooks/use-hydrated"
import { PAGES } from "@/lib/pages"

import { clearDraft, useContactDraft } from "../hooks/use-contact-draft"
import { describeSendError } from "../lib/send-error"
import { type Reason, tagSubject } from "../lib/topics"
import { useSendContactMessage } from "../mutations/use-send-contact-message"
import {
  type ContactValues,
  LIMITS,
  makeContactSchema,
} from "../schemas/contact.schema"
import { ContactSuccess } from "./contact-success"

const MOD_KEY = { mac: "⌘", other: "Ctrl" } as const
const EMPTY: ContactValues = { name: "", email: "", subject: "", message: "" }

/** A field cell of the compose window: label on top, then the field and its error. */
function ComposeField({
  htmlFor,
  label,
  error,
  errorId,
  className,
  children,
}: {
  htmlFor: string
  label: string
  error?: string
  errorId: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      data-invalid={error ? true : undefined}
      className={cn(
        "flex min-w-0 flex-col gap-1 px-5 py-3.5 transition-colors duration-200 ring-inset data-invalid:ring-1 data-invalid:ring-destructive/40 sm:px-6",
        className
      )}
    >
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground in-data-invalid:text-destructive"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function ContactForm({
  reason,
  presetSubject,
  onSentChange,
}: {
  reason: Reason | null
  /** Filled into an empty subject, e.g. when arriving from a pricing link. */
  presetSubject?: string
  onSentChange?: (sent: boolean) => void
}) {
  const { t } = useTranslation("contact")
  const lang = useLocale()
  const id = useId()
  const trapRef = useRef<HTMLInputElement>(null)
  const [trapped, setTrapped] = useState(false)
  // a submit before hydration would put the message in the URL
  const hydrated = useHydrated()
  const mac = hydrated && /Mac|iPhone|iPad/.test(navigator.userAgent)

  const schema = useMemo(() => makeContactSchema(t), [t])
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
    mode: "onTouched",
  })
  const { errors } = form.formState
  const message = useWatch({ control: form.control, name: "message" })
  const send = useSendContactMessage()
  useContactDraft(form, EMPTY)

  useEffect(() => {
    if (presetSubject && !form.getValues("subject")) {
      form.setValue("subject", presetSubject)
    }
  }, [presetSubject, form])

  if (send.isSuccess || trapped) {
    return (
      <ContactSuccess
        email={send.variables?.email ?? form.getValues("email")}
        onReset={() => {
          form.reset(EMPTY)
          send.reset()
          setTrapped(false)
          onSentChange?.(false)
        }}
      />
    )
  }

  const failure = send.isError ? describeSendError(send.error) : null
  const fieldId = (name: keyof ContactValues) => `${id}-${name}`
  const errorId = (name: keyof ContactValues) => `${id}-${name}-error`
  const describedBy = (name: keyof ContactValues, ...extra: string[]) =>
    [errors[name] && errorId(name), ...extra].filter(Boolean).join(" ") ||
    undefined
  const field = (name: keyof ContactValues) => ({
    id: fieldId(name),
    required: true,
    placeholder: t(`form.placeholders.${name}`),
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": describedBy(name),
    ...form.register(name),
  })
  const counterId = `${id}-message-count`
  const showCounter = message.length >= LIMITS.message * 0.8

  return (
    <form
      noValidate
      method="post"
      aria-label={t("form.title")}
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          // bots get a success they can't tell apart from the real thing
          if (trapRef.current?.value) {
            setTrapped(true)
            onSentChange?.(true)
            return
          }
          const subject = tagSubject(values.subject, reason)
          send.mutate(
            { ...values, subject },
            {
              onSuccess: () => {
                clearDraft()
                onSentChange?.(true)
              },
            }
          )
        })(event)
      }}
      className="group/form flex flex-col"
    >
      <div className="grid border-b sm:grid-cols-2 sm:divide-x rtl:sm:divide-x-reverse">
        <ComposeField
          htmlFor={fieldId("name")}
          label={t("form.fields.name")}
          error={errors.name?.message}
          errorId={errorId("name")}
          className="max-sm:border-b"
        >
          <input
            autoComplete="name"
            className="bare-input h-8"
            {...field("name")}
          />
        </ComposeField>
        <ComposeField
          htmlFor={fieldId("email")}
          label={t("form.fields.email")}
          error={errors.email?.message}
          errorId={errorId("email")}
        >
          <input
            type="email"
            autoComplete="email"
            className="bare-input h-8"
            {...field("email")}
          />
        </ComposeField>
      </div>
      <ComposeField
        htmlFor={fieldId("subject")}
        label={t("form.fields.subject")}
        error={errors.subject?.message}
        errorId={errorId("subject")}
        className="border-b"
      >
        <input className="bare-input h-8" {...field("subject")} />
      </ComposeField>

      <div
        data-invalid={errors.message ? true : undefined}
        className="flex flex-col gap-1 px-5 pt-4 pb-3 transition-colors duration-200 ring-inset data-invalid:ring-1 data-invalid:ring-destructive/40 sm:px-6"
      >
        <label
          htmlFor={fieldId("message")}
          className="text-xs font-medium text-muted-foreground in-data-invalid:text-destructive"
        >
          {t("form.fields.message")}
        </label>
        {errors.message && (
          <p id={errorId("message")} className="text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
        <textarea
          rows={7}
          className="bare-input field-sizing-content max-h-96 min-h-40 resize-none"
          {...field("message")}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.currentTarget.form?.requestSubmit()
            }
          }}
          aria-describedby={describedBy(
            "message",
            showCounter ? counterId : ""
          )}
        />
        {showCounter && (
          <p
            id={counterId}
            data-over={message.length > LIMITS.message || undefined}
            className="self-end text-xs text-muted-foreground tabular-nums data-over:text-destructive"
          >
            {t("form.charCount", {
              used: message.length,
              max: LIMITS.message,
            })}
          </p>
        )}
      </div>

      <div aria-hidden className="sr-only">
        <input
          ref={trapRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {failure && (
        <div className="px-5 pb-4 sm:px-6">
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden />
            <AlertTitle>{t(`form.errors.${failure.kind}`)}</AlertTitle>
            {failure.detail && (
              <AlertDescription>{failure.detail}</AlertDescription>
            )}
          </Alert>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-xs text-xs text-pretty text-muted-foreground">
          <Trans
            t={t}
            i18nKey="form.privacy"
            components={{
              pp: (
                <Link
                  to={localePath(lang, PAGES.privacy.path)}
                  className="text-link font-normal text-muted-foreground hover:text-foreground"
                />
              ),
            }}
          />
        </p>
        <div className="flex items-center gap-3">
          {hydrated && (
            <kbd
              aria-hidden
              className="rise hidden rounded-md border bg-background px-2 py-1 font-sans text-xs text-muted-foreground sm:group-has-[textarea:focus]/form:inline-block"
            >
              {mac ? MOD_KEY.mac : MOD_KEY.other} ↵
            </kbd>
          )}
          <Button
            type="submit"
            size="lg"
            className="group/submit h-10 shrink-0 px-5 max-sm:flex-1"
            disabled={!hydrated || send.isPending}
          >
            {send.isPending ? t("form.sending") : t("form.submit")}
            {send.isPending ? (
              <Spinner aria-hidden data-icon="inline-end" />
            ) : (
              <SendIcon
                aria-hidden
                data-icon="inline-end"
                className="transition-transform duration-200 group-hover/submit:translate-x-0.5 group-hover/submit:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100"
              />
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
