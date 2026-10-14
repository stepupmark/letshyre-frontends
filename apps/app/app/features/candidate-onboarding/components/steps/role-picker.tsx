import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Check, Plus, Sparkles } from "lucide-react"
import { useEffect, useId, useState, type KeyboardEvent } from "react"

import type { ResumeState } from "../../lib/resume-state"
import { topicMatcher } from "../../lib/topic-match"
import { skillsQuery } from "../../queries/candidate-onboarding.queries"

export function RolePicker({
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

  const onResume = topicMatcher(value.review?.skills ?? [])
  const checkedAt = value.custom
    ? value.roles.length
    : value.roles.indexOf(value.role)
  const focusAt = Math.max(checkedAt, 0)

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
        tabIndex={-1}
        onKeyDown={moveFocus}
        className="grid gap-2 sm:grid-cols-2"
      >
        {value.roles.map((role, i) => (
          <RoleOption
            key={role}
            label={role}
            tag={i === 0 ? t("resume.bestMatch") : undefined}
            checked={!value.custom && value.role === role}
            focusable={i === focusAt}
            onSelect={() => {
              choose(role, false)
            }}
          />
        ))}
        <RoleOption
          label={t("resume.otherRole")}
          other
          checked={value.custom}
          focusable={focusAt === value.roles.length}
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
          checked && "border-brand"
        )}
      >
        {checked && <span className="pop size-2 rounded-full bg-brand" />}
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
