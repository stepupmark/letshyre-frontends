import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { updateUser } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Progress } from "@workspace/ui/components/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CircleAlert } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useSearchParams } from "react-router"

import { FileDropzone } from "@/components/file-dropzone"
import { TextField } from "@/components/text-field"
import { Wizard, type WizardStep } from "@/components/wizard"
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"
import { industriesQuery } from "@/lib/industries"
import { checkOnBlur } from "@/lib/forms"

import { submitKyc } from "../services/employer-onboarding.service"
import {
  DOCUMENTS,
  makeSchema,
  STEPS,
  type Draft,
  type StepId,
  type Values,
} from "../schemas/onboarding-form.schema"

const DRAFT = "employer-onboarding"
// the legacy form's draft, picked up once so nobody types it all again
const LEGACY_DRAFT = "employer_onboarding_draft"

const EMPTY: Draft = {
  company_name: "",
  company_website: "",
  official_email: "",
  company_industry: "",
  linkedin_url: "",
  company_description: "",
  company_registration_number: "",
  pan_number: "",
  gst_number: "",
  company_address: "",
}

function startingDraft(email: string): Draft {
  let legacy: Partial<Draft> | null = null
  try {
    const raw = localStorage.getItem(LEGACY_DRAFT)
    legacy = raw ? (JSON.parse(raw) as Partial<Draft>) : null
  } catch {
    /* empty */
  }
  const saved = loadDraft<Draft>(DRAFT) ?? legacy ?? {}
  return { ...EMPTY, official_email: email, ...saved }
}

const withScheme = (value: string) =>
  value && !/^https?:\/\//i.test(value) ? `https://${value}` : value

export function OnboardingForm({
  email,
  onSubmitted,
}: {
  email: string
  onSubmitted: () => void
}) {
  const { t } = useTranslation("onboarding")
  const [, setParams] = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [saved, setSaved] = useState(false)
  const descriptionId = useId()
  const industryId = useId()
  const industries = useQuery(industriesQuery())

  const schema = useMemo(
    () =>
      makeSchema({
        nameMin: t("validation.nameMin"),
        website: t("validation.website"),
        email: t("validation.email"),
        industry: t("validation.industry"),
        linkedin: t("validation.linkedin"),
        linkedinDomain: t("validation.linkedinDomain"),
        description: t("validation.description"),
        registration: t("validation.registration"),
        pan: t("validation.pan"),
        gst: t("validation.gst"),
        address: t("validation.address"),
        fileRequired: t("validation.fileRequired"),
        fileInvalid: t("validation.fileInvalid"),
      }),
    [t]
  )
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: startingDraft(email),
    mode: "onSubmit",
  })
  const { errors } = form.formState
  const text = useWatch({ control: form.control, name: STEPS.company })
  const legal = useWatch({ control: form.control, name: STEPS.legal })
  const description = text[5]

  // drafts the text fields as they change; files can't be stored
  const draftJson = JSON.stringify([text, legal])
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const timer = setTimeout(() => {
      const values = form.getValues()
      const draft = Object.fromEntries(
        [...STEPS.company, ...STEPS.legal].map((key) => [key, values[key]])
      )
      saveDraft(DRAFT, draft)
      setSaved(true)
    }, 600)
    return () => {
      clearTimeout(timer)
    }
  }, [draftJson, form])

  const submit = useMutation({
    mutationFn: (values: Values) => submitKyc(values, setProgress),
    onSuccess: () => {
      clearDraft(DRAFT)
      try {
        localStorage.removeItem(LEGACY_DRAFT)
      } catch {
        /* empty */
      }
      updateUser({ is_profile_completed: true })
      onSubmitted()
    },
    onError: (error) => {
      setProgress(0)
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      const known = Object.entries(fields ?? {}).filter(([name]) =>
        Object.values(STEPS).some((names) =>
          (names as readonly string[]).includes(name)
        )
      )
      for (const [name, message] of known)
        form.setError(name as keyof Values, { message })
      if (known[0]) goToField(known[0][0])
    },
  })

  const goToField = (name: string) => {
    const step = (Object.keys(STEPS) as StepId[]).find((id) =>
      (STEPS[id] as readonly string[]).includes(name)
    )
    if (!step) return
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set("step", step)
        return next
      },
      { preventScrollReset: true }
    )
  }

  const validate = (step: StepId) => async () => {
    const ok = await form.trigger([...STEPS[step]], { shouldFocus: true })
    return ok
  }

  const steps: WizardStep[] = [
    {
      id: "company",
      title: t("steps.company"),
      validate: validate("company"),
      content: (
        <FieldGroup>
          <TextField
            label={t("fields.companyName")}
            autoComplete="organization"
            error={errors.company_name?.message}
            {...checkOnBlur(form, "company_name")}
          />
          <TextField
            label={t("fields.website")}
            type="url"
            autoComplete="url"
            inputMode="url"
            error={errors.company_website?.message}
            {...checkOnBlur(form, "company_website")}
            onBlur={(event) => {
              form.setValue("company_website", withScheme(event.target.value))
              if (event.target.value) void form.trigger("company_website")
            }}
          />
          <TextField
            label={t("fields.officialEmail")}
            type="email"
            autoComplete="email"
            hint={t("fields.officialEmailHint")}
            error={errors.official_email?.message}
            {...checkOnBlur(form, "official_email")}
          />
          <Controller
            control={form.control}
            name="company_industry"
            render={({ field }) => (
              <Field data-invalid={Boolean(errors.company_industry)}>
                <FieldLabel htmlFor={industryId}>
                  {t("fields.industry")}
                </FieldLabel>
                <Select
                  items={industries.data ?? []}
                  value={field.value || null}
                  onValueChange={(value) => {
                    field.onChange(value ?? "")
                  }}
                  disabled={!industries.data}
                >
                  <SelectTrigger
                    id={industryId}
                    ref={field.ref}
                    className="w-full"
                    aria-invalid={Boolean(errors.company_industry)}
                    onBlur={field.onBlur}
                  >
                    <SelectValue
                      placeholder={
                        industries.isError
                          ? t("fields.industryFailed")
                          : t("fields.industryPlaceholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(industries.data ?? []).map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{errors.company_industry?.message}</FieldError>
              </Field>
            )}
          />
          <TextField
            label={t("fields.linkedin")}
            type="url"
            inputMode="url"
            error={errors.linkedin_url?.message}
            {...checkOnBlur(form, "linkedin_url")}
            onBlur={(event) => {
              form.setValue("linkedin_url", withScheme(event.target.value))
              if (event.target.value) void form.trigger("linkedin_url")
            }}
          />
          <Field data-invalid={Boolean(errors.company_description)}>
            <FieldLabel htmlFor={descriptionId}>
              {t("fields.description")}
            </FieldLabel>
            <Textarea
              id={descriptionId}
              rows={4}
              maxLength={500}
              className="field-sizing-content min-h-24"
              aria-invalid={Boolean(errors.company_description)}
              aria-describedby={`${descriptionId}-count`}
              {...checkOnBlur(form, "company_description")}
            />
            <FieldDescription
              id={`${descriptionId}-count`}
              className="text-end tabular-nums"
            >
              {t("fields.descriptionCount", { count: description.length })}
            </FieldDescription>
            <FieldError>{errors.company_description?.message}</FieldError>
          </Field>
        </FieldGroup>
      ),
    },
    {
      id: "legal",
      title: t("steps.legal"),
      validate: validate("legal"),
      content: (
        <FieldGroup>
          <TextField
            label={t("fields.registration")}
            hint={t("fields.registrationHint")}
            autoCapitalize="characters"
            error={errors.company_registration_number?.message}
            {...checkOnBlur(form, "company_registration_number")}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              label={t("fields.pan")}
              autoCapitalize="characters"
              maxLength={10}
              className="uppercase"
              error={errors.pan_number?.message}
              {...checkOnBlur(form, "pan_number")}
              onChange={(event) => {
                form.setValue("pan_number", event.target.value.toUpperCase(), {
                  shouldValidate: Boolean(errors.pan_number),
                })
              }}
            />
            <TextField
              label={t("fields.gst")}
              autoCapitalize="characters"
              maxLength={15}
              className="uppercase"
              error={errors.gst_number?.message}
              {...checkOnBlur(form, "gst_number")}
              onChange={(event) => {
                form.setValue("gst_number", event.target.value.toUpperCase(), {
                  shouldValidate: Boolean(errors.gst_number),
                })
              }}
            />
          </div>
          <TextField
            label={t("fields.address")}
            autoComplete="street-address"
            error={errors.company_address?.message}
            {...checkOnBlur(form, "company_address")}
          />
        </FieldGroup>
      ),
    },
    {
      id: "documents",
      title: t("steps.documents"),
      validate: validate("documents"),
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t("documents.lead")}</p>
          {DOCUMENTS.map(({ name, rules }) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FileDropzone
                  label={t(`documents.${name}.label`)}
                  description={t(`documents.${name}.hint`)}
                  rules={rules}
                  value={field.value}
                  error={errors[name]?.message}
                  onSelect={(file) => {
                    field.onChange(file ?? undefined)
                    if (file) form.clearErrors(name)
                  }}
                />
              )}
            />
          ))}
          {submit.isPending && (
            <div className="flex flex-col gap-2" role="status">
              <p className="text-sm text-muted-foreground tabular-nums">
                {t("submitting", { percent: Math.round(progress * 100) })}
              </p>
              <Progress value={progress * 100} aria-hidden="true" />
            </div>
          )}
          {submit.isError && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{t("submitFailed")}</AlertDescription>
            </Alert>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <Wizard
        steps={steps}
        pending={submit.isPending}
        onFinish={() =>
          form.handleSubmit(
            (values) => {
              submit.mutate(values)
            },
            (invalid) => {
              const first = Object.keys(invalid)[0]
              if (first) goToField(first)
            }
          )()
        }
      />
      {saved && (
        <p className="text-xs text-muted-foreground">{t("draftSaved")}</p>
      )}
    </div>
  )
}
