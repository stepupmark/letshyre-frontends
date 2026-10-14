import { useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
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
import { useEffect, useId, useState, type KeyboardEvent } from "react"

import { FileDropzone } from "@/components/file-dropzone"
import { duration, ease } from "@/lib/motion"
import type { FileRules } from "@/lib/file-rules"

import {
  resumeStatusQuery,
  reviewQuery,
  skillsQuery,
} from "../../queries/candidate-onboarding.queries"
import { uploadResume } from "../../services/candidate-onboarding.service"
import { type Review } from "../../schemas/candidate-onboarding.schema"
import { EMPTY_RESUME, type ResumeState } from "../../lib/resume-state"

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

function RolePicker({
  value,
  error,
  onChange,
}: {
  value: ResumeState
  error?: string
  onChange: (next: ResumeState) => void
}) {
  const { t } = useTranslation("candidateOnboarding")
  const customId = useId()
  const reasonId = useId()
  const [typed, setTyped] = useState(value.custom ? value.role : "")
  const [debounced, setDebounced] = useState(typed)
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(typed.trim())
    }, 600)
    return () => {
      clearTimeout(id)
    }
  }, [typed])

  const asked = value.custom ? debounced : value.role
  const skills = useQuery({ ...skillsQuery(asked), enabled: asked.length > 1 })

  const choose = (role: string, custom: boolean) => {
    onChange({
      ...value,
      role,
      custom,
      otherReason: custom ? value.otherReason : "",
    })
  }

  const mine = (value.review?.skills ?? []).map((skill) => skill.toLowerCase())
  const onResume = (topic: string) => {
    const lower = topic.toLowerCase()
    return mine.some((skill) => lower.includes(skill) || skill.includes(lower))
  }

  // arrow keys move the choice, like native radios
  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[
      event.key
    ]
    if (!step) return
    event.preventDefault()
    const radios = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]'
      ),
    ]
    const at = radios.findIndex((radio) => radio === document.activeElement)
    const next = radios[(at + step + radios.length) % radios.length]
    next?.focus()
    next?.click()
  }

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby={`${customId}-title`}
    >
      <div>
        <h3 id={`${customId}-title`} className="font-medium">
          {t("resume.roleTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {value.roles.length > 0 ? t("resume.roleLead") : t("resume.noRoles")}
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label={t("resume.roleTitle")}
        onKeyDown={moveFocus}
        className="grid gap-2 sm:grid-cols-2"
      >
        {value.roles.map((role, i) => (
          <RoleOption
            key={role}
            label={role}
            tag={i === 0 ? t("resume.bestMatch") : undefined}
            checked={!value.custom && value.role === role}
            focusable={
              value.role ? !value.custom && value.role === role : i === 0
            }
            onSelect={() => {
              choose(role, false)
            }}
          />
        ))}
        <RoleOption
          label={t("resume.otherRole")}
          other
          checked={value.custom}
          focusable={value.custom || (!value.role && value.roles.length === 0)}
          onSelect={() => {
            choose(typed.trim(), true)
          }}
        />
      </div>

      {value.custom && (
        <div className="grid gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1">
          <Field data-invalid={Boolean(error) && !value.role}>
            <FieldLabel htmlFor={customId}>{t("resume.customRole")}</FieldLabel>
            <Input
              id={customId}
              value={typed}
              placeholder={t("resume.customRolePlaceholder")}
              onChange={(event) => {
                setTyped(event.target.value)
                onChange({ ...value, role: event.target.value.trim() })
              }}
            />
          </Field>
          <Field data-invalid={Boolean(error) && !value.otherReason.trim()}>
            <FieldLabel htmlFor={reasonId}>{t("resume.reason")}</FieldLabel>
            <Textarea
              id={reasonId}
              rows={3}
              value={value.otherReason}
              placeholder={t("resume.reasonPlaceholder")}
              onChange={(event) => {
                onChange({ ...value, otherReason: event.target.value })
              }}
            />
          </Field>
        </div>
      )}

      {asked.length > 1 &&
        (skills.isFetching && !skills.data ? (
          <div
            className="flex flex-wrap gap-1.5 rounded-xl border p-4"
            aria-hidden="true"
          >
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        ) : skills.data?.kind === "clarify" ? (
          <div className="flex flex-col gap-2 text-sm">
            <p>{t("resume.clarify")}</p>
            <div className="flex flex-wrap gap-2">
              {skills.data.roles.map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTyped(role)
                    setDebounced(role)
                    onChange({ ...value, role, custom: true })
                  }}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        ) : skills.data?.kind === "skills" && skills.data.skills.length > 0 ? (
          <Topics
            key={asked}
            role={asked}
            topics={skills.data.skills}
            onResume={onResume}
          />
        ) : null)}
      <FieldError>{error}</FieldError>
    </section>
  )
}

/** What the AI interview asks about, marking topics their resume already backs. */
function Topics({
  role,
  topics,
  onResume,
}: {
  role: string
  topics: string[]
  onResume: (topic: string) => boolean
}) {
  const { t } = useTranslation("candidateOnboarding")
  const matched = topics.filter(onResume).length

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-[radial-gradient(circle_at_100%_0%,var(--brand-muted),transparent_60%)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-muted text-brand-text">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </span>
          {t("resume.roleSkills", { role })}
        </p>
        {matched > 0 && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
            <span
              aria-hidden="true"
              className="h-1.5 w-12 overflow-hidden rounded-full bg-muted"
            >
              <span
                className="grow-x block h-full rounded-full bg-success"
                style={{ width: `${(matched / topics.length) * 100}%` }}
              />
            </span>
            {t("resume.onResume", { count: matched, total: topics.length })}
          </p>
        )}
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {topics.map((topic, i) => {
          const backed = onResume(topic)
          return (
            <li
              key={topic}
              style={{ animationDelay: `${i * 50}ms` }}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium motion-safe:animate-in motion-safe:fill-mode-both motion-safe:zoom-in-95 motion-safe:fade-in",
                backed
                  ? "border-success/30 bg-success/10 text-success"
                  : "bg-card"
              )}
            >
              {backed && (
                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              )}
              {topic}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function RoleOption({
  label,
  tag,
  other = false,
  checked,
  focusable,
  onSelect,
}: {
  label: string
  tag?: string
  other?: boolean
  checked: boolean
  focusable: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={focusable ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm transition-[background-color,border-color,box-shadow] duration-200 outline-none hover:border-foreground/20 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
        other && !checked && "border-dashed",
        checked &&
          "border-brand bg-brand-muted/50 font-medium shadow-[0_6px_16px_-8px_color-mix(in_oklab,var(--brand)_45%,transparent)] hover:border-brand hover:bg-brand-muted/50"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full border transition-colors motion-reduce:transition-none",
          checked && "border-brand bg-brand"
        )}
      >
        {checked && <span className="pop size-1.5 rounded-full bg-white" />}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      {other ? (
        <Plus
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      ) : (
        tag && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-muted px-2 py-0.5 text-[0.6875rem] font-medium text-brand-text">
            <Sparkles className="size-3" aria-hidden="true" />
            {tag}
          </span>
        )
      )}
    </button>
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
