import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useSearchParams } from "react-router"

import { DraftSaved } from "@/components/draft-saved"
import { Wizard, type WizardStep } from "@/components/wizard"

import {
  discardDraft,
  draftFiles,
  startingDraft,
  useDraftAutosave,
  useStoredFiles,
} from "../hooks/use-onboarding-draft"
import { profileForm } from "../lib/candidate-onboarding"
import type { ResumeState } from "../lib/resume-state"
import { myProfileQuery } from "../queries/candidate-onboarding.queries"
import {
  makeSchema,
  STEPS,
  type StepId,
  type Values,
} from "../schemas/onboarding-form.schema"
import { submitProfile } from "../services/candidate-onboarding.service"
import { ProfilePreview } from "./preview/profile-preview"
import { PhotoStep } from "./steps/photo-step"
import { ResumeStep } from "./steps/resume-step"
import { ReviewStep } from "./steps/review-step"
import { DocumentsStep } from "./steps/documents-step"
import { WorkStep } from "./steps/work-step"
import { YouStep } from "./steps/you-step"

// the API's names for fields the form keeps differently
const ALIASES: Record<string, keyof Values> = {
  location: "address_city",
  address: "address_line",
  notice_period_prof_type: "notice_period_proof_type",
  notice_period_prof: "notice_period_proof",
}
const RESUME_FIELDS = [
  "resume",
  "resume_id",
  "selected_role",
  "role",
  "role_other_reason",
]

const fieldOf = (name: string) => ALIASES[name] ?? name

const stepOf = (name: string): StepId | undefined =>
  RESUME_FIELDS.includes(name)
    ? "resume"
    : (Object.keys(STEPS) as (keyof typeof STEPS)[]).find((id) =>
        (STEPS[id] as readonly string[]).includes(fieldOf(name))
      )

export function CandidateOnboarding({
  name,
  onDone,
}: {
  name: string
  onDone: (role: string) => void
}) {
  const { t } = useTranslation(["candidateOnboarding", "common"])
  const queryClient = useQueryClient()
  const [, setParams] = useSearchParams()
  const start = useMemo(() => startingDraft(), [])
  const [resume, setResume] = useState<ResumeState>(start.resume)
  const [resumeError, setResumeError] = useState<string>()
  const [current, setCurrent] = useState<StepId>("you")
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState<string | null>(null)

  const { schema, isDone } = useMemo(
    () =>
      makeSchema({
        gender: t("errors.gender"),
        dob: t("errors.dob"),
        adult: t("errors.adult"),
        aadhaar: t("errors.aadhaar"),
        address: t("errors.address"),
        city: t("errors.city"),
        state: t("errors.state"),
        pin: t("errors.pin"),
        photo: t("errors.photo"),
        company: t("errors.company"),
        lastDay: t("errors.lastDay"),
        ctc: t("errors.ctc"),
        expectedLow: t("errors.expectedLow"),
        industry: t("errors.industry"),
        locations: t("errors.locations"),
        proofType: t("errors.proofType"),
        file: t("errors.file"),
        fileInvalid: t("errors.fileInvalid"),
      }),
    [t]
  )
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: start.values,
    mode: "onSubmit",
  })
  const photo = useWatch({ control: form.control, name: "profile_photo" })
  const saves = useDraftAutosave(form, resume)
  const restored = useStoredFiles(form, (file) => {
    setResume((prev) => (prev.review ? { ...prev, file } : prev))
  })

  const goTo = (step: StepId) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set("step", step)
        return next
      },
      { preventScrollReset: true }
    )
  }

  const resumeProblem = () =>
    !resume.review
      ? t("errors.resume")
      : !resume.role.trim()
        ? t("errors.role")
        : resume.custom && !resume.otherReason.trim()
          ? t("errors.reason")
          : undefined

  const submit = useMutation({
    mutationFn: (values: Values) => {
      if (!resume.review) throw new Error("resume missing")
      return submitProfile(
        profileForm(values, {
          file: resume.file,
          resumeId: resume.resumeId,
          role: resume.role,
          otherReason: resume.custom ? resume.otherReason : "",
          review: resume.review,
        }),
        setProgress
      )
    },
    onSuccess: () => {
      discardDraft()
      queryClient.setQueryData(myProfileQuery().queryKey, (old) => ({
        ...old,
        is_profile_complete: true,
      }))
      onDone(resume.role)
    },
    onError: (error) => {
      setProgress(0)
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      const known = Object.entries(fields ?? {}).filter(([field]) =>
        stepOf(field)
      )
      for (const [field, message] of known)
        if (RESUME_FIELDS.includes(field)) setResumeError(message)
        else form.setError(fieldOf(field) as keyof Values, { message })
      const step = known[0] && stepOf(known[0][0])
      if (step) goTo(step)
      else
        setFailed(
          error instanceof HttpError && error.backendMessage
            ? error.backendMessage
            : t("submitFailed")
        )
    },
  })

  // the upload can't resume, so leaving mid-way needs a second thought
  useEffect(() => {
    if (!submit.isPending) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => {
      window.removeEventListener("beforeunload", warn)
    }
  }, [submit.isPending])

  const fieldsStep = (id: keyof typeof STEPS, content: ReactNode) => ({
    id,
    title: t(`steps.${id}`),
    validate: () => form.trigger([...STEPS[id]], { shouldFocus: true }),
    isComplete: () => isDone(id, form.getValues()),
    content,
  })

  const pickPhoto = (file: File) => {
    form.setValue("profile_photo", file)
    form.clearErrors("profile_photo")
    void draftFiles.save("profile_photo", file)
  }

  const changeResume = (next: ResumeState) => {
    if (next.file !== resume.file) void draftFiles.save("resume", next.file)
    setResume(next)
    setResumeError(undefined)
  }

  const steps: WizardStep[] = [
    fieldsStep("you", <YouStep form={form} />),
    fieldsStep(
      "photo",
      <PhotoStep
        photo={photo instanceof File ? photo : null}
        error={form.formState.errors.profile_photo?.message}
        onChange={pickPhoto}
      />
    ),
    fieldsStep("work", <WorkStep form={form} />),
    fieldsStep("documents", <DocumentsStep form={form} />),
    {
      id: "resume",
      title: t("steps.resume"),
      validate: () => {
        const problem = resumeProblem()
        setResumeError(problem)
        return problem === undefined
      },
      isComplete: () => resumeProblem() === undefined,
      content: (
        <ResumeStep
          value={resume}
          error={resumeError}
          onChange={changeResume}
        />
      ),
    },
    {
      id: "review",
      title: t("steps.review"),
      content: (
        <ReviewStep
          form={form}
          resume={resume}
          pending={submit.isPending}
          progress={progress}
          failed={failed}
          onEdit={goTo}
        />
      ),
    },
  ]

  const preview = { control: form.control, resume, name, step: current }

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-20">
      <div className="flex flex-col gap-4">
        {/* wait for stored files, or a refresh would bounce back to the photo step */}
        {restored ? (
          <Wizard
            steps={steps}
            pending={submit.isPending}
            onStepChange={setCurrent as (id: string) => void}
            onFinish={() =>
              form.handleSubmit(
                (values) => {
                  setFailed(null)
                  const problem = resumeProblem()
                  if (problem) {
                    setResumeError(problem)
                    goTo("resume")
                    return
                  }
                  submit.mutate(values)
                },
                (invalid) => {
                  const step = stepOf(Object.keys(invalid)[0] ?? "")
                  if (step) goTo(step)
                }
              )()
            }
          />
        ) : (
          <div className="min-h-96" />
        )}
        <DraftSaved saves={saves} />
      </div>
      <div className="sticky top-24 hidden lg:block">
        <ProfilePreview {...preview} />
      </div>
    </div>
  )
}
