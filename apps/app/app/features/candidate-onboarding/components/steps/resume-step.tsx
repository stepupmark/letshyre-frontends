import { useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Check, CircleAlert, FileText, LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"

import { FileDropzone } from "@/components/file-dropzone"
import type { FileRules } from "@/lib/file-rules"

import {
  resumeStatusQuery,
  reviewQuery,
} from "../../queries/candidate-onboarding.queries"
import { uploadResume } from "../../services/candidate-onboarding.service"
import { type Review } from "../../schemas/candidate-onboarding.schema"
import { EMPTY_RESUME, type ResumeState } from "../../lib/resume-state"
import { Found } from "./resume-found"

const RESUME: FileRules = {
  accept: [".pdf", ".doc", ".docx"],
  maxBytes: 5 * 1024 * 1024,
}
// polling gives up after about a minute
const MAX_WAIT = 60_000

export function ResumeStep({
  value,
  error,
  onChange,
}: {
  value: ResumeState
  error?: string
  onChange: (next: ResumeState) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const [progress, setProgress] = useState(0)

  const upload = useMutation({
    mutationFn: (file: File) => uploadResume(file, setProgress),
    onSuccess: (jobId, file) => {
      onChange({ ...EMPTY_RESUME, file, fileName: file.name, jobId })
    },
  })

  const reset = () => {
    upload.reset()
    setProgress(0)
    onChange(EMPTY_RESUME)
  }

  if (value.review)
    return (
      <Found
        value={value}
        error={error}
        onChange={onChange}
        onReplace={reset}
      />
    )

  if (value.jobId)
    return (
      <Reading
        jobId={value.jobId}
        fileName={value.fileName}
        onDone={(result) => {
          onChange({
            ...value,
            ...result,
            role: result.roles[0] ?? "",
            custom: result.roles.length === 0,
          })
        }}
        onRetry={reset}
      />
    )

  if (upload.isPending)
    return (
      <Stages
        fileName={upload.variables.name}
        current={0}
        progress={progress}
      />
    )

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t("resume.lead")}</p>
      <FileDropzone
        label={t("resume.label")}
        description={t("resume.hint")}
        rules={RESUME}
        value={null}
        error={error}
        onSelect={(file) => {
          if (file) upload.mutate(file)
        }}
      />
      {upload.isError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{t("resume.uploadFailed")}</AlertTitle>
          <AlertDescription>{t("resume.uploadFailedBody")}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function Reading({
  jobId,
  fileName,
  onDone,
  onRetry,
}: {
  jobId: string
  fileName: string
  onDone: (result: {
    resumeId: string
    roles: string[]
    review: Review
  }) => void
  onRetry: () => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const status = useQuery(resumeStatusQuery(jobId))
  const state = status.data?.state
  const done = state === "completed"
  const review = useQuery({ ...reviewQuery(jobId), enabled: done })
  const [startedAt] = useState(Date.now)
  const tooLong = !done && status.dataUpdatedAt - startedAt > MAX_WAIT

  const result =
    done && review.data && status.data
      ? {
          resumeId: status.data.resumeId,
          roles: status.data.roles,
          review: review.data,
        }
      : null
  useEffect(() => {
    if (result) onDone(result)
  })

  const failed =
    state === "failed" || status.isError || review.isError || tooLong
  if (failed)
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>
          {tooLong ? t("resume.slowTitle") : t("resume.failedTitle")}
        </AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          {tooLong ? t("resume.slowBody") : t("resume.failedBody")}
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t("resume.tryAnother")}
          </Button>
        </AlertDescription>
      </Alert>
    )

  return <Stages fileName={fileName} current={done ? 2 : 1} progress={1} />
}

const STAGES = ["upload", "read", "roles"] as const

function Stages({
  fileName,
  current,
  progress,
}: {
  fileName: string
  current: number
  progress: number
}) {
  const { t } = useTranslation("candidateOnboarding")
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-5" role="status">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="truncate">{fileName}</span>
      </p>
      <ol className="flex flex-col gap-3">
        {STAGES.map((stage, i) => (
          <li
            key={stage}
            className={cn(
              "flex items-center gap-3 text-sm",
              i > current && "text-muted-foreground"
            )}
          >
            <span
              className="flex size-5 items-center justify-center"
              aria-hidden="true"
            >
              {i < current ? (
                <Check className="size-4 text-success" />
              ) : i === current ? (
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <span className="size-1.5 rounded-full bg-border" />
              )}
            </span>
            {t(`resume.stages.${stage}`)}
            {i === 0 && i === current && (
              <span className="ms-auto text-xs text-muted-foreground tabular-nums">
                {Math.round(progress * 100)}%
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">{t("resume.wait")}</p>
    </div>
  )
}
