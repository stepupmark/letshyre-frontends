import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { CircleAlert } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import type { ResumeState } from "../../lib/resume-state"
import {
  GENDERS,
  joinAddress,
  REQUIRED_DOCUMENTS,
  type StepId,
  type Values,
} from "../../schemas/onboarding-form.schema"

export function ReviewStep({
  form,
  resume,
  pending,
  progress,
  failed,
  onEdit,
}: {
  form: UseFormReturn<Values>
  resume: ResumeState
  pending: boolean
  progress: number
  failed: string | null
  onEdit: (step: StepId) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const values = form.getValues()
  const percent = Math.round(progress * 100)
  const gender = GENDERS.find((g) => g === values.gender)
  const docs = REQUIRED_DOCUMENTS.filter(
    (name) => values[name] instanceof File
  ).length
  const missing = t("review.missing")

  const rows: { step: StepId; title: string; body: string }[] = [
    {
      step: "you",
      title: t("steps.you"),
      body:
        [gender && t(`you.genders.${gender}`), values.dob, joinAddress(values)]
          .filter(Boolean)
          .join(" · ") || missing,
    },
    {
      step: "photo",
      title: t("steps.photo"),
      body:
        values.profile_photo instanceof File ? t("review.photoReady") : missing,
    },
    {
      step: "work",
      title: t("steps.work"),
      body:
        [
          values.present_or_last_working_company,
          values.current_ctc &&
            t("review.pay", {
              now: values.current_ctc,
              next: values.expected_ctc,
              count: Number(values.expected_ctc) || 0,
            }),
          values.preferred_locations.join(", "),
        ]
          .filter(Boolean)
          .join(" · ") || missing,
    },
    {
      step: "documents",
      title: t("steps.documents"),
      body:
        docs > 0
          ? t("work.count", { added: docs, total: REQUIRED_DOCUMENTS.length })
          : missing,
    },
    {
      step: "resume",
      title: t("steps.resume"),
      body: resume.role
        ? t("review.role", {
            role: resume.role,
            count: resume.review?.skills.length ?? 0,
          })
        : missing,
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">{t("review.lead")}</p>
      <dl className="divide-y overflow-hidden rounded-xl border">
        {rows.map(({ step, title, body }) => (
          <div
            key={step}
            className="flex items-start justify-between gap-4 px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-sm font-medium">{title}</dt>
              <dd className="text-sm text-pretty wrap-break-word text-muted-foreground">
                {body}
              </dd>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("review.edit", { step: title })}
              onClick={() => {
                onEdit(step)
              }}
            >
              {t("review.editShort")}
            </Button>
          </div>
        ))}
      </dl>

      {pending && (
        <div className="flex flex-col gap-2">
          <p
            aria-hidden="true"
            className="text-sm text-muted-foreground tabular-nums"
          >
            {t("submitting", { percent })}
          </p>
          <Progress value={percent} aria-hidden="true" />
          {/* announce halfway marks, not every percent */}
          <p role="status" className="sr-only">
            {t("submitting", { percent: Math.floor(progress * 2) * 50 })}
          </p>
        </div>
      )}
      {failed && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{failed}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
