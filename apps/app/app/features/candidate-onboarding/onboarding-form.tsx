import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Progress } from "@workspace/ui/components/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CircleAlert, X } from "lucide-react"
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form"
import { useSearchParams } from "react-router"

import { FileDropzone } from "@/components/file-dropzone"
import { TextField } from "@/components/text-field"
import { Wizard, type WizardStep } from "@/components/wizard"
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"
import type { FileRules } from "@/lib/file-rules"
import { checkOnBlur } from "@/lib/forms"
import { industriesQuery } from "@/lib/industries"

import {
  myProfileQuery,
  profileForm,
  submitProfile,
  type Documents,
} from "./api"
import { PhotoStep } from "./photo-step"
import { EMPTY_RESUME, type ResumeState } from "./resume-state"
import { ResumeStep } from "./resume-step"
import {
  GENDERS,
  makeSchema,
  PROOF_TYPES,
  STEP_FIELDS,
  type Values,
} from "./schema"

const DRAFT = "candidate-onboarding"
// the legacy wizard's zustand draft, picked up once
const LEGACY_DRAFT = "employee-profile-draft"

const DOCUMENT: FileRules = {
  accept: [".pdf", ".doc", ".docx"],
  maxBytes: 5 * 1024 * 1024,
}

type FileKey = Exclude<keyof Documents, "profile_photo" | "resume">

const EMPTY: Values = {
  gender: "",
  dob: "",
  aadhar_number: "",
  location: "",
  address: "",
  present_or_last_working_company: "",
  last_day_of_working: "",
  current_ctc: "",
  expected_ctc: "",
  preferred_industry: "",
  preferred_locations: [],
  notice_period_proof_type: "",
}

interface Draft {
  values: Partial<Values>
  resume: Partial<ResumeState>
}

function startingDraft(): Draft {
  const saved = loadDraft<Draft>(DRAFT)
  if (saved) return { values: saved.values ?? {}, resume: saved.resume ?? {} }
  try {
    const raw = localStorage.getItem(LEGACY_DRAFT)
    const legacy = raw
      ? ((JSON.parse(raw) as { state?: { formData?: Record<string, unknown> } })
          .state?.formData ?? {})
      : {}
    const values = Object.fromEntries(
      Object.keys(EMPTY)
        .filter((key) => key in legacy)
        .map((key) => [key, legacy[key]])
    ) as Partial<Values>
    return { values, resume: {} }
  } catch {
    return { values: {}, resume: {} }
  }
}

// which step can fix a field the server rejects
const STEP = {
  you: "you",
  photo: "photo",
  work: "work",
  resume: "resume",
  review: "review",
} as const

const REQUIRED_DOCS = [
  "resignation_letter",
  "experience_letter",
  "notice_period_proof",
] as const
const LETTERS = ["resignation_letter", "experience_letter"] as const

const FIELD_STEP: Record<string, string> = {
  gender: "you",
  dob: "you",
  aadhar_number: "you",
  location: "you",
  address: "you",
  profile_photo: "photo",
  present_or_last_working_company: "work",
  last_day_of_working: "work",
  current_ctc: "work",
  expected_ctc: "work",
  preferred_industry: "work",
  preferred_locations: "work",
  resignation_letter: "work",
  experience_letter: "work",
  notice_period_prof_type: "work",
  notice_period_prof: "work",
  resume: "resume",
  selected_role: "resume",
  role_other_reason: "resume",
}

const formatAadhaar = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 12)
    .replace(/(\d{4})(?=\d)/g, "$1 ")

export function CandidateOnboarding({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation(["candidateOnboarding", "common"])
  const queryClient = useQueryClient()
  const [, setParams] = useSearchParams()
  const industries = useQuery(industriesQuery())
  const genderId = useId()
  const industryId = useId()
  const proofId = useId()
  const start = useMemo(() => startingDraft(), [])

  const schema = useMemo(
    () =>
      makeSchema({
        gender: t("errors.gender"),
        dob: t("errors.dob"),
        adult: t("errors.adult"),
        aadhaar: t("errors.aadhaar"),
        location: t("errors.location"),
        address: t("errors.address"),
        company: t("errors.company"),
        lastDay: t("errors.lastDay"),
        ctc: t("errors.ctc"),
        expectedLow: t("errors.expectedLow"),
        industry: t("errors.industry"),
        locations: t("errors.locations"),
        proofType: t("errors.proofType"),
      }),
    [t]
  )
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { ...EMPTY, ...start.values },
    mode: "onSubmit",
  })
  const errors = form.formState.errors

  const [files, setFiles] = useState<Documents>({
    profile_photo: null,
    resignation_letter: null,
    experience_letter: null,
    present_offer: null,
    notice_period_proof: null,
    resume: null,
  })
  const [fileErrors, setFileErrors] = useState<
    Partial<Record<keyof Documents | "role", string>>
  >({})
  const [resume, setResume] = useState<ResumeState>({
    ...EMPTY_RESUME,
    ...start.resume,
  })
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState<string | null>(null)

  const setFile = (key: keyof Documents, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }))
    if (file) setFileErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // text and the resume review are kept on this device; files can't be
  const watched = useWatch({ control: form.control })
  const draftJson = JSON.stringify([watched, { ...resume, file: null }])
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const id = setTimeout(() => {
      saveDraft(DRAFT, {
        values: form.getValues(),
        resume: { ...resume, file: null },
      })
    }, 600)
    return () => {
      clearTimeout(id)
    }
  }, [draftJson, form, resume])

  const goTo = (step: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set("step", step)
        return next
      },
      { preventScrollReset: true }
    )
  }

  const submit = useMutation({
    mutationFn: async (values: Values) => {
      if (!resume.review) throw new Error("resume missing")
      return submitProfile(
        profileForm(
          values,
          { ...files, resume: resume.file },
          {
            resumeId: resume.resumeId,
            role: resume.role,
            otherReason: resume.custom ? resume.otherReason : "",
            review: resume.review,
          }
        ),
        setProgress
      )
    },
    onSuccess: () => {
      clearDraft(DRAFT)
      try {
        localStorage.removeItem(LEGACY_DRAFT)
      } catch {
        /* empty */
      }
      queryClient.setQueryData(myProfileQuery().queryKey, (old) => ({
        ...old,
        is_profile_complete: true,
      }))
      onDone()
    },
    onError: (error) => {
      setProgress(0)
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      let step: string | undefined
      for (const [name, message] of Object.entries(fields ?? {})) {
        if (name in EMPTY) form.setError(name as FieldPath<Values>, { message })
        else if (name === "notice_period_prof_type")
          form.setError("notice_period_proof_type", { message })
        else if (name === "notice_period_prof")
          setFileErrors((prev) => ({ ...prev, notice_period_proof: message }))
        else if (name in files)
          setFileErrors((prev) => ({ ...prev, [name]: message }))
        step ??= FIELD_STEP[name]
      }
      if (step) goTo(step)
      else
        setFailed(
          error instanceof HttpError && error.backendMessage
            ? error.backendMessage
            : t("submitFailed")
        )
    },
  })

  const requireFiles = (keys: (keyof Documents)[]) => {
    const missing = Object.fromEntries(
      keys.filter((key) => !files[key]).map((key) => [key, t("errors.file")])
    )
    setFileErrors((prev) => ({ ...prev, ...missing }))
    return Object.keys(missing).length === 0
  }

  const values = form.getValues()
  const gender = GENDERS.find((g) => g === values.gender)
  const industryItems = (industries.data ?? []).map((item) => ({
    value: item.label,
    label: item.label,
  }))

  const steps: WizardStep[] = [
    {
      id: STEP.you,
      title: t("steps.you"),
      validate: () => form.trigger([...STEP_FIELDS.you], { shouldFocus: true }),
      content: (
        <FieldGroup>
          <p className="text-sm text-muted-foreground">{t("you.lead")}</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.gender)}>
                  <FieldLabel htmlFor={genderId}>{t("you.gender")}</FieldLabel>
                  <Select
                    items={GENDERS.map((g) => ({
                      value: g,
                      label: t(`you.genders.${g}`),
                    }))}
                    value={field.value || null}
                    onValueChange={(value) => {
                      field.onChange(value ?? "")
                    }}
                  >
                    <SelectTrigger
                      id={genderId}
                      ref={field.ref}
                      className="w-full"
                      aria-invalid={Boolean(errors.gender)}
                    >
                      <SelectValue placeholder={t("you.choose")} />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {t(`you.genders.${g}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.gender?.message}</FieldError>
                </Field>
              )}
            />
            <TextField
              label={t("you.dob")}
              type="date"
              autoComplete="bday"
              max={new Date().toISOString().slice(0, 10)}
              error={errors.dob?.message}
              {...checkOnBlur(form, "dob")}
            />
          </div>
          <TextField
            label={t("you.aadhaar")}
            hint={t("you.aadhaarHint")}
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            dir="ltr"
            error={errors.aadhar_number?.message}
            {...checkOnBlur(form, "aadhar_number")}
            onChange={(event) => {
              form.setValue(
                "aadhar_number",
                formatAadhaar(event.target.value),
                {
                  shouldValidate: Boolean(errors.aadhar_number),
                }
              )
            }}
          />
          <TextField
            label={t("you.location")}
            hint={t("you.locationHint")}
            autoComplete="address-level2"
            error={errors.location?.message}
            {...checkOnBlur(form, "location")}
          />
          <TextField
            label={t("you.address")}
            autoComplete="street-address"
            error={errors.address?.message}
            {...checkOnBlur(form, "address")}
          />
        </FieldGroup>
      ),
    },
    {
      id: STEP.photo,
      title: t("steps.photo"),
      validate: () => {
        if (files.profile_photo) return true
        setFileErrors((prev) => ({ ...prev, profile_photo: t("errors.photo") }))
        return false
      },
      content: (
        <PhotoStep
          photo={files.profile_photo}
          error={fileErrors.profile_photo}
          onChange={(file) => {
            setFile("profile_photo", file)
          }}
        />
      ),
    },
    {
      id: STEP.work,
      title: t("steps.work"),
      validate: async () => {
        const ok = await form.trigger([...STEP_FIELDS.work], {
          shouldFocus: true,
        })
        const docs = requireFiles([...REQUIRED_DOCS])
        return ok && docs
      },
      content: (
        <FieldGroup>
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              label={t("work.company")}
              autoComplete="organization"
              error={errors.present_or_last_working_company?.message}
              {...checkOnBlur(form, "present_or_last_working_company")}
            />
            <TextField
              label={t("work.lastDay")}
              hint={t("work.lastDayHint")}
              type="date"
              error={errors.last_day_of_working?.message}
              {...checkOnBlur(form, "last_day_of_working")}
            />
            <TextField
              label={t("work.current")}
              hint={t("work.lpaHint")}
              inputMode="decimal"
              error={errors.current_ctc?.message}
              {...checkOnBlur(form, "current_ctc")}
            />
            <TextField
              label={t("work.expected")}
              hint={t("work.lpaHint")}
              inputMode="decimal"
              error={errors.expected_ctc?.message}
              {...checkOnBlur(form, "expected_ctc")}
            />
          </div>
          <Controller
            control={form.control}
            name="preferred_industry"
            render={({ field }) => (
              <Field data-invalid={Boolean(errors.preferred_industry)}>
                <FieldLabel htmlFor={industryId}>
                  {t("work.industry")}
                </FieldLabel>
                <Select
                  items={industryItems}
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
                    aria-invalid={Boolean(errors.preferred_industry)}
                  >
                    <SelectValue placeholder={t("you.choose")} />
                  </SelectTrigger>
                  <SelectContent>
                    {industryItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{errors.preferred_industry?.message}</FieldError>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="preferred_locations"
            render={({ field }) => (
              <Places
                value={field.value}
                error={errors.preferred_locations?.message}
                onChange={field.onChange}
              />
            )}
          />

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-medium">{t("work.documents")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("work.documentsLead")}
              </p>
            </div>
            {LETTERS.map((key) => (
              <Doc
                key={key}
                name={key}
                file={files[key]}
                error={fileErrors[key]}
                onSelect={setFile}
              />
            ))}
            <Controller
              control={form.control}
              name="notice_period_proof_type"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.notice_period_proof_type)}>
                  <FieldLabel htmlFor={proofId}>
                    {t("work.proofType")}
                  </FieldLabel>
                  <Select
                    items={PROOF_TYPES.map((p) => ({
                      value: p,
                      label: t(`work.proofTypes.${p}`),
                    }))}
                    value={field.value || null}
                    onValueChange={(value) => {
                      field.onChange(value ?? "")
                    }}
                  >
                    <SelectTrigger
                      id={proofId}
                      ref={field.ref}
                      className="w-full"
                      aria-invalid={Boolean(errors.notice_period_proof_type)}
                    >
                      <SelectValue placeholder={t("you.choose")} />
                    </SelectTrigger>
                    <SelectContent>
                      {PROOF_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {t(`work.proofTypes.${p}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>
                    {errors.notice_period_proof_type?.message}
                  </FieldError>
                </Field>
              )}
            />
            <Doc
              name="notice_period_proof"
              file={files.notice_period_proof}
              error={fileErrors.notice_period_proof}
              onSelect={setFile}
            />
            <Doc
              name="present_offer"
              file={files.present_offer}
              error={fileErrors.present_offer}
              onSelect={setFile}
              optional
            />
          </div>
        </FieldGroup>
      ),
    },
    {
      id: STEP.resume,
      title: t("steps.resume"),
      validate: () => {
        const problem = !resume.review
          ? t("errors.resume")
          : !resume.role.trim()
            ? t("errors.role")
            : resume.custom && !resume.otherReason.trim()
              ? t("errors.reason")
              : null
        setFileErrors((prev) => ({ ...prev, role: problem ?? undefined }))
        return problem === null
      },
      content: (
        <ResumeStep
          value={resume}
          error={fileErrors.role}
          onChange={(next) => {
            setResume(next)
            setFileErrors((prev) => ({ ...prev, role: undefined }))
          }}
        />
      ),
    },
    {
      id: STEP.review,
      title: t("steps.review"),
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">{t("review.lead")}</p>
          <Summary
            title={t("steps.you")}
            onEdit={() => {
              goTo(STEP.you)
            }}
          >
            {[gender && t(`you.genders.${gender}`), values.dob, values.location]
              .filter(Boolean)
              .join(" · ")}
          </Summary>
          <Summary
            title={t("steps.photo")}
            onEdit={() => {
              goTo(STEP.photo)
            }}
          >
            {files.profile_photo ? t("review.photoReady") : t("review.missing")}
          </Summary>
          <Summary
            title={t("steps.work")}
            onEdit={() => {
              goTo(STEP.work)
            }}
          >
            {[
              values.present_or_last_working_company,
              values.current_ctc &&
                t("review.pay", {
                  now: values.current_ctc,
                  next: values.expected_ctc,
                }),
              values.preferred_locations.join(", "),
            ]
              .filter(Boolean)
              .join(" · ")}
          </Summary>
          <Summary
            title={t("steps.resume")}
            onEdit={() => {
              goTo(STEP.resume)
            }}
          >
            {resume.role
              ? t("review.role", {
                  role: resume.role,
                  count: resume.review?.skills.length ?? 0,
                })
              : t("review.missing")}
          </Summary>
          {submit.isPending && (
            <div className="flex flex-col gap-2" role="status">
              <p className="text-sm text-muted-foreground tabular-nums">
                {t("submitting", { percent: Math.round(progress * 100) })}
              </p>
              <Progress value={progress * 100} aria-hidden="true" />
            </div>
          )}
          {failed && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{failed}</AlertDescription>
            </Alert>
          )}
        </div>
      ),
    },
  ]

  return (
    <Wizard
      steps={steps}
      pending={submit.isPending}
      onFinish={() =>
        form.handleSubmit(
          (data) => {
            setFailed(null)
            if (!files.profile_photo) {
              goTo(STEP.photo)
              return
            }
            if (!requireFiles([...REQUIRED_DOCS])) {
              goTo(STEP.work)
              return
            }
            if (!resume.review) {
              goTo(STEP.resume)
              return
            }
            submit.mutate(data)
          },
          (invalid) => {
            const name = Object.keys(invalid)[0]
            const step = name ? FIELD_STEP[name] : undefined
            if (step) goTo(step)
          }
        )()
      }
    />
  )
}

function Doc({
  name,
  file,
  error,
  optional = false,
  onSelect,
}: {
  name: FileKey
  file: File | null
  error?: string
  optional?: boolean
  onSelect: (key: FileKey, file: File | null) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  return (
    <FileDropzone
      label={
        optional
          ? t("work.optional", { label: t(`work.docs.${name}`) })
          : t(`work.docs.${name}`)
      }
      description={t(`work.docHints.${name}`)}
      rules={DOCUMENT}
      value={file}
      error={error}
      onSelect={(picked) => {
        onSelect(name, picked)
      }}
    />
  )
}

function Places({
  value,
  error,
  onChange,
}: {
  value: string[]
  error?: string
  onChange: (value: string[]) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const id = useId()
  const [draft, setDraft] = useState("")
  const add = () => {
    const parts = draft
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    const next = [...value]
    for (const part of parts)
      if (!next.some((p) => p.toLowerCase() === part.toLowerCase()))
        next.push(part)
    onChange(next)
    setDraft("")
  }
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{t("work.places")}</FieldLabel>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((place) => (
            <li key={place}>
              <Badge variant="secondary" className="gap-1 pe-1">
                {place}
                <button
                  type="button"
                  aria-label={t("work.removePlace", { place })}
                  className="rounded-full p-0.5 hover:bg-background"
                  onClick={() => {
                    onChange(value.filter((p) => p !== place))
                  }}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Input
        id={id}
        value={draft}
        placeholder={t("work.placesPlaceholder")}
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          setDraft(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault()
            add()
          }
        }}
        onBlur={add}
      />
      <FieldError>{error}</FieldError>
    </Field>
  )
}

function Summary({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: ReactNode
}) {
  const { t } = useTranslation("candidateOnboarding")
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-4 last:border-0">
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        aria-label={t("review.edit", { step: title })}
      >
        {t("review.editShort")}
      </Button>
    </div>
  )
}
