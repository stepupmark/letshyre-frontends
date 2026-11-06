import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Switch } from "@workspace/ui/components/switch"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, useState, type KeyboardEvent } from "react"

import { duration, ease } from "@/lib/motion"

import { useEmailPreview } from "../../hooks/use-email-preview"
import type { Recipient } from "../../lib/recipients"
import type { Template } from "../../schemas/template.schema"
import { EmailFrame } from "../preview/email-frame"
import { Monogram } from "../shared/monogram"

export function ReviewStep({
  template,
  recipients,
  role,
}: {
  template: Template
  recipients: Recipient[]
  role: string
}) {
  const { t } = useTranslation("invitations")
  const locale = useLocale()
  const listId = useId()
  const subjectId = useId()
  const [index, setIndex] = useState(0)
  const [mark, setMark] = useState(false)
  const total = recipients.length
  const at = Math.min(index, total - 1)
  const recipient = recipients[at]
  const preview = useEmailPreview({
    templateId: template.id,
    subject: template.subject_template,
    body: template.body_html_template,
    person: { candidate_name: recipient?.name.trim() ?? "", job_role: role },
    mark,
  })
  const company = preview.values.employer_company_name
  const number = new Intl.NumberFormat(locale)

  const move = (delta: number) => {
    const next = (((at + delta) % total) + total) % total
    setIndex(next)
    return next
  }

  const onListKey = (event: KeyboardEvent) => {
    const delta =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0
    if (!delta) return
    event.preventDefault()
    document.getElementById(`${listId}-${move(delta)}`)?.focus()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
      <aside className="min-w-0 overflow-hidden rounded-lg border max-lg:hidden lg:sticky lg:top-20">
        <h3
          id={listId}
          className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5 text-sm font-medium"
        >
          {t("send.steps.candidates")}
          <span className="text-xs text-muted-foreground tabular-nums">
            {number.format(total)}
          </span>
        </h3>
        <ul
          aria-labelledby={listId}
          className="max-h-120 overflow-y-auto p-1.5"
        >
          {recipients.map((item, i) => (
            <li key={item.email}>
              <button
                id={`${listId}-${i}`}
                type="button"
                aria-current={i === at ? "true" : undefined}
                tabIndex={i === at ? 0 : -1}
                aria-keyshortcuts="ArrowUp ArrowDown"
                onKeyDown={onListKey}
                onClick={() => {
                  setIndex(i)
                }}
                className="group relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-start transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {i === at && (
                  <m.span
                    layoutId={listId}
                    aria-hidden="true"
                    transition={{ duration: duration.base, ease }}
                    className="absolute inset-0 rounded-md bg-brand-muted/60"
                  />
                )}
                <Monogram
                  name={item.name}
                  className="relative bg-background ring-1 ring-border"
                />
                <span className="relative flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {item.name}
                  </span>
                  <span
                    dir="ltr"
                    className="truncate text-start text-xs text-muted-foreground group-aria-current:text-foreground/75"
                  >
                    {item.email}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section
        aria-labelledby={subjectId}
        className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card"
      >
        <header className="flex flex-col gap-4 border-b px-5 py-4">
          {total > 1 && (
            <div className="flex items-center justify-between gap-2 lg:hidden">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="max-md:size-11"
                aria-label={t("send.prevCandidate")}
                onClick={() => {
                  move(-1)
                }}
              >
                <ChevronLeft className="rtl:-scale-x-100" />
              </Button>
              <span
                aria-live="polite"
                className="text-sm text-muted-foreground tabular-nums"
              >
                {t("send.position", {
                  current: number.format(at + 1),
                  total: number.format(total),
                })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="max-md:size-11"
                aria-label={t("send.nextCandidate")}
                onClick={() => {
                  move(1)
                }}
              >
                <ChevronRight className="rtl:-scale-x-100" />
              </Button>
            </div>
          )}
          <div className="relative grid">
            <AnimatePresence initial={false} mode="popLayout">
              <m.h3
                id={subjectId}
                key={preview.subject}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast, ease }}
                className="text-base font-semibold text-pretty"
              >
                {preview.subject}
              </m.h3>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 text-sm">
              <Monogram name={company} className="size-8" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{company}</span>
                {recipient && (
                  <span className="truncate text-xs text-muted-foreground">
                    {t("preview.to")} {recipient.name}{" "}
                    <bdi dir="ltr">&lt;{recipient.email}&gt;</bdi>
                  </span>
                )}
              </span>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground max-md:min-h-11">
              <Switch
                checked={mark}
                onCheckedChange={(checked) => {
                  setMark(checked)
                }}
              />
              {t("send.highlightFields")}
            </label>
          </div>
          {preview.local && (
            <p className="flex items-start gap-1.5 text-xs text-pretty text-muted-foreground">
              <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              {t("send.sampleNote")}
            </p>
          )}
        </header>
        {preview.pending ? (
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <EmailFrame html={preview.html} title={t("preview.frame")} />
        )}
      </section>
    </div>
  )
}
