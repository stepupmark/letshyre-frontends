import { useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Check,
  CircleAlert,
  FileText,
  LoaderCircle,
  Plus,
  Sparkles,
  X,
} from "lucide-react"
import * as m from "motion/react-m"
import { useEffect, useId, useState } from "react"

import { FileDropzone } from "@/components/file-dropzone"
import { duration, ease } from "@/lib/motion"
import type { FileRules } from "@/lib/file-rules"

import {
  resumeStatusQuery,
  reviewQuery,
} from "../../queries/candidate-onboarding.queries"
import { uploadResume } from "../../services/candidate-onboarding.service"
import { type Review } from "../../schemas/candidate-onboarding.schema"
import { EMPTY_RESUME, type ResumeState } from "../../lib/resume-state"
import { RolePicker } from "./role-picker"

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

function Found({
  value,
  error,
  onChange,
  onReplace,
}: {
  value: ResumeState
  error?: string
  onChange: (next: ResumeState) => void
  onReplace: () => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const review = value.review ?? {
    skills: [],
    certifications: [],
    education: [],
    experience: [],
    projects: [],
  }
  const setReview = (next: Partial<Review>) => {
    onChange({ ...value, review: { ...review, ...next } })
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 px-4 py-3 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {t("resume.found", {
              name: value.fileName || t("resume.yourResume"),
            })}
          </span>
        </span>
        <Button variant="ghost" size="sm" onClick={onReplace}>
          {t("resume.replace")}
        </Button>
      </div>

      <RolePicker value={value} error={error} onChange={onChange} />

      <Skills
        skills={review.skills}
        onChange={(skills) => {
          setReview({ skills })
        }}
      />

      <Entries
        title={t("resume.experience")}
        empty={t("resume.noExperience")}
        items={review.experience}
        fields={[
          ["role", t("resume.fields.role")],
          ["company", t("resume.fields.company")],
          ["duration", t("resume.fields.duration")],
        ]}
        blank={{ role: "", company: "", duration: "", description: "" }}
        onChange={(experience) => {
          setReview({ experience })
        }}
      />

      <Entries
        title={t("resume.education")}
        empty={t("resume.noEducation")}
        items={review.education}
        fields={[
          ["institution", t("resume.fields.institution")],
          ["degree", t("resume.fields.degree")],
          ["duration", t("resume.fields.duration")],
        ]}
        blank={{ institution: "", degree: "", duration: "" }}
        onChange={(education) => {
          setReview({ education })
        }}
      />
    </m.div>
  )
}

function Skills({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const id = useId()
  const [draft, setDraft] = useState("")
  const add = () => {
    const skill = draft.trim()
    if (skill && !skills.some((s) => s.toLowerCase() === skill.toLowerCase()))
      onChange([...skills, skill])
    setDraft("")
  }
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-medium">{t("resume.skills")}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <li key={skill}>
            <Badge variant="outline" className="gap-1 pe-1">
              {skill}
              <button
                type="button"
                aria-label={t("resume.removeSkill", { skill })}
                className="rounded-full p-0.5 hover:bg-muted"
                onClick={() => {
                  onChange(skills.filter((s) => s !== skill))
                }}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Badge>
          </li>
        ))}
      </ul>
      <div className="flex max-w-sm gap-2">
        <Input
          id={id}
          aria-label={t("resume.addSkill")}
          placeholder={t("resume.addSkill")}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              add()
            }
          }}
        />
        <Button
          variant="outline"
          onClick={add}
          aria-label={t("resume.addSkill")}
        >
          <Plus />
        </Button>
      </div>
    </section>
  )
}

function Entries<T extends Record<string, string>>({
  title,
  empty,
  items,
  fields,
  blank,
  onChange,
}: {
  title: string
  empty: string
  items: T[]
  fields: [keyof T & string, string][]
  blank: T
  onChange: (items: T[]) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-medium">{title}</h3>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_10rem_auto]"
          >
            {fields.map(([key, label]) => (
              <Input
                key={key}
                aria-label={`${label} ${i + 1}`}
                placeholder={label}
                value={item[key]}
                onChange={(event) => {
                  onChange(
                    items.map((row, j) =>
                      j === i ? { ...row, [key]: event.target.value } : row
                    )
                  )
                }}
              />
            ))}
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("resume.removeEntry", { number: i + 1 })}
              className="justify-self-end"
              onClick={() => {
                onChange(items.filter((_, j) => j !== i))
              }}
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => {
          onChange([...items, blank])
        }}
      >
        <Plus />
        {t("resume.addEntry")}
      </Button>
    </section>
  )
}
