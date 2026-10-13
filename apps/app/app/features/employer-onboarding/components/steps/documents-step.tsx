import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Progress } from "@workspace/ui/components/progress"
import {
  CircleAlert,
  FileBadge,
  FileText,
  ImageIcon,
  Info,
  MapPinHouse,
  type LucideIcon,
} from "lucide-react"
import { Controller, useWatch, type UseFormReturn } from "react-hook-form"

import { FileDropzone } from "@/components/file-dropzone"

import {
  DOCUMENTS,
  type FileField,
  type StepId,
  type Values,
} from "../../schemas/onboarding-form.schema"
import { ReviewSummary } from "./review-summary"

const ICONS: Record<FileField, LucideIcon> = {
  company_logo: ImageIcon,
  registration_certificate: FileBadge,
  gst_certificate: FileText,
  address_proof: MapPinHouse,
}

export function DocumentsStep({
  form,
  pending,
  progress,
  failed,
  onEdit,
}: {
  form: UseFormReturn<Values>
  pending: boolean
  progress: number
  failed: boolean
  onEdit: (step: StepId) => void
}) {
  const { t } = useTranslation("onboarding")
  const { errors } = form.formState
  const percent = Math.round(progress * 100)
  const files = useWatch({
    control: form.control,
    name: DOCUMENTS.map((doc) => doc.name),
  })
  const added = files.filter((file) => file instanceof File).length

  return (
    <div className="flex flex-col gap-5">
      <Alert>
        <Info />
        <AlertDescription>{t("documents.keepWarning")}</AlertDescription>
      </Alert>
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">{t("documents.lead")}</p>
          <p className="shrink-0 text-xs font-medium tabular-nums">
            {t("documents.count", { count: added, total: DOCUMENTS.length })}
          </p>
        </div>
        <div className="divide-y">
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
                  layout="row"
                  icon={ICONS[name]}
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
        </div>
      </div>

      <ReviewSummary form={form} onEdit={onEdit} />

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
          <AlertDescription>{t("submitFailed")}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
