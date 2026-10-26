import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { updateUser } from "@workspace/auth"
import { useTranslation } from "@workspace/i18n/react"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams } from "react-router"

import { Wizard, type WizardStep } from "@/components/wizard"
import { DraftSaved } from "@/components/draft-saved"

import {
  discardDraft,
  startingDraft,
  useDraftAutosave,
  useStoredFiles,
} from "../hooks/use-onboarding-draft"
import {
  makeSchema,
  STEPS,
  stepSchema,
  type StepId,
  type Values,
} from "../schemas/onboarding-form.schema"
import { submitKyc } from "../services/employer-onboarding.service"
import { OnboardingPreview } from "./preview/onboarding-preview"
import { CompanyStep } from "./steps/company-step"
import { DocumentsStep } from "./steps/documents-step"
import { LegalStep } from "./steps/legal-step"

// the API reports the address under the single field it stores
const fieldOf = (name: string) =>
  name === "company_address" ? "address_line" : name

const stepOf = (name: string) =>
  (Object.keys(STEPS) as StepId[]).find((id) =>
    (STEPS[id] as readonly string[]).includes(fieldOf(name))
  )

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
  const [current, setCurrent] = useState<StepId>("company")

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
        city: t("validation.city"),
        state: t("validation.state"),
        pin: t("validation.pin"),
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
  const saves = useDraftAutosave(form)
  const restored = useStoredFiles(form)

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

  const submit = useMutation({
    mutationFn: (values: Values) => submitKyc(values, setProgress),
    onSuccess: () => {
      discardDraft()
      updateUser({ is_profile_completed: true })
      onSubmitted()
    },
    onError: (error) => {
      setProgress(0)
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      const known = Object.entries(fields ?? {}).filter(([name]) =>
        stepOf(name)
      )
      for (const [name, message] of known)
        form.setError(fieldOf(name) as keyof Values, { message })
      const step = known[0] && stepOf(known[0][0])
      if (step) goTo(step)
    },
  })

  const validate = (step: StepId) => () =>
    form.trigger([...STEPS[step]], { shouldFocus: true })

  const isComplete = (step: StepId) => () =>
    stepSchema(schema, step).safeParse(form.getValues()).success

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

  const steps: WizardStep[] = [
    {
      id: "company",
      title: t("steps.company"),
      validate: validate("company"),
      isComplete: isComplete("company"),
      content: <CompanyStep form={form} />,
    },
    {
      id: "legal",
      title: t("steps.legal"),
      validate: validate("legal"),
      isComplete: isComplete("legal"),
      content: <LegalStep form={form} />,
    },
    {
      id: "documents",
      title: t("steps.documents"),
      validate: validate("documents"),
      content: (
        <DocumentsStep
          key={String(restored)}
          form={form}
          pending={submit.isPending}
          progress={progress}
          failed={submit.isError}
          onEdit={goTo}
        />
      ),
    },
  ]

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-20">
      <div className="flex flex-col gap-4">
        <Wizard
          steps={steps}
          pending={submit.isPending}
          onStepChange={setCurrent as (id: string) => void}
          onFinish={() =>
            form.handleSubmit(
              (values) => {
                submit.mutate(values)
              },
              (invalid) => {
                const step = stepOf(Object.keys(invalid)[0] ?? "")
                if (step) goTo(step)
              }
            )()
          }
        />
        <DraftSaved saves={saves} />
      </div>
      <div className="sticky top-24 hidden lg:block">
        <OnboardingPreview form={form} step={current} />
      </div>
    </div>
  )
}
