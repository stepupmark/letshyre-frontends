import { zodResolver } from "@hookform/resolvers/zod"
import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react"
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useForm, useWatch } from "react-hook-form"
import { Link, useSearchParams } from "react-router"

import { PAGES } from "@/lib/pages"

import { describeSendError } from "../lib/send-error"
import { useSendContactMessage } from "../mutations/use-send-contact-message"
import {
  type ContactValues,
  LIMITS,
  makeContactSchema,
} from "../schemas/contact.schema"

const subscribe = () => () => undefined

const EMPTY: ContactValues = { name: "", email: "", subject: "", message: "" }
const DRAFT_KEY = "contact-draft"

const REASONS = ["sales", "support", "candidate", "other"] as const
type Reason = (typeof REASONS)[number]

// the backend has no topic field, so support sees it in the subject
const SUBJECT_TAGS: Partial<Record<Reason, string>> = {
  sales: "Sales",
  support: "Support",
  candidate: "Candidate",
}

const readDraft = (): Partial<ContactValues> | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Partial<ContactValues>) : null
  } catch {
    return null
  }
}

const writeDraft = (values: Partial<ContactValues> | null) => {
  try {
    if (values) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values))
    else sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // storage blocked: the draft just isn't kept
  }
}

export function ContactForm() {
  const { t } = useTranslation("contact")
  const lang = useLocale()
  const id = useId()
  const [params] = useSearchParams()
  const topic = params.get("topic")
  const successRef = useRef<HTMLHeadingElement>(null)
  const trapRef = useRef<HTMLInputElement>(null)
  const [picked, setPicked] = useState<Reason | null>()
  const [trapped, setTrapped] = useState(false)

  const schema = useMemo(() => makeContactSchema(t), [t])
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
    mode: "onTouched",
  })
  const { errors } = form.formState
  const message = useWatch({ control: form.control, name: "message" })
  const send = useSendContactMessage()
  // a submit before hydration would put the message in the URL
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  // the page is prerendered without a query string, so read it after hydration
  const fromSales = hydrated && topic === "sales"
  const reason = picked === undefined ? (fromSales ? "sales" : null) : picked
  const sent = send.isSuccess || trapped

  useEffect(() => {
    const draft = readDraft()
    if (draft) form.reset({ ...EMPTY, ...draft })
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        writeDraft(values)
      },
    })
  }, [form])

  useEffect(() => {
    if (fromSales && !form.getValues("subject")) {
      form.setValue("subject", t("form.topics.sales"))
    }
  }, [fromSales, form, t])

  useEffect(() => {
    if (sent) successRef.current?.focus()
  }, [sent])

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-xl border bg-muted/40 p-6 sm:p-8"
      >
        <CircleCheckIcon aria-hidden className="size-8 text-brand" />
        <h2
          ref={successRef}
          tabIndex={-1}
          className="text-xl font-semibold tracking-tight outline-none"
        >
          {t("form.successTitle")}
        </h2>
        <p className="text-pretty text-muted-foreground">
          {t("form.successBody")}{" "}
          {t("form.successNext", {
            email: send.variables?.email ?? form.getValues("email"),
          })}
        </p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => {
            form.reset(EMPTY)
            send.reset()
            setTrapped(false)
            setPicked(null)
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
  const describedBy = (name: keyof ContactValues, ...extra: string[]) =>
    [errors[name] && errorId(name), ...extra].filter(Boolean).join(" ") ||
    undefined
  const counterId = `${id}-message-count`
  const showCounter = message.length >= LIMITS.message * 0.8

  return (
    <form
      noValidate
      method="post"
      aria-labelledby={`${id}-title`}
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          if (trapRef.current?.value) {
            setTrapped(true)
            return
          }
          const tag = reason && SUBJECT_TAGS[reason]
          send.mutate(
            {
              ...values,
              subject: tag ? `[${tag}] ${values.subject}` : values.subject,
            },
            {
              onSuccess: () => {
                writeDraft(null)
              },
            }
          )
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
        <div className="flex flex-col gap-2">
          <p id={`${id}-reason`} className="text-sm font-medium">
            {t("form.reason.label")}
          </p>
          <ToggleGroup
            aria-labelledby={`${id}-reason`}
            variant="outline"
            className="flex-wrap"
            value={reason ? [reason] : []}
            onValueChange={(value) => {
              setPicked((value[0] as Reason | undefined) ?? null)
            }}
          >
            {REASONS.map((value) => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="aria-pressed:border-brand aria-pressed:bg-brand/10"
              >
                {t(`form.reason.${value}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={invalid("name")}>
            <FieldLabel htmlFor={fieldId("name")}>
              {t("form.fields.name")}
            </FieldLabel>
            <Input
              id={fieldId("name")}
              required
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
              required
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
            required
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
            required
            rows={6}
            className="min-h-36"
            aria-invalid={invalid("message")}
            aria-describedby={describedBy(
              "message",
              showCounter ? counterId : ""
            )}
            {...form.register("message")}
          />
          {showCounter && (
            <p
              id={counterId}
              data-over={message.length > LIMITS.message || undefined}
              className="text-end text-xs text-muted-foreground tabular-nums data-over:text-destructive"
            >
              {t("form.charCount", {
                used: message.length,
                max: LIMITS.message,
              })}
            </p>
          )}
          <FieldError id={errorId("message")}>
            {errors.message?.message}
          </FieldError>
        </Field>
        <div aria-hidden className="sr-only">
          <input
            ref={trapRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
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
        <Alert variant="destructive">
          <CircleAlertIcon aria-hidden />
          <AlertTitle>{t(`form.errors.${failure.kind}`)}</AlertTitle>
          {failure.detail && (
            <AlertDescription>{failure.detail}</AlertDescription>
          )}
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        className="self-start"
        disabled={!hydrated || send.isPending}
      >
        {send.isPending && <Spinner aria-hidden data-icon="inline-start" />}
        {send.isPending ? t("form.sending") : t("form.submit")}
      </Button>
    </form>
  )
}
