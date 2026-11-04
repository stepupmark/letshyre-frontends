import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { Info } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, useState } from "react"

import { duration, ease } from "@/lib/motion"

import { fillFields } from "../../lib/merge-fields"
import { previewDocument } from "../../lib/preview-html"
import type { Recipient } from "../../lib/recipients"
import { sampleInviteLink } from "../../lib/sample-values"
import { previewQuery } from "../../queries/templates.queries"
import type { Template } from "../../schemas/template.schema"
import { EmailFrame } from "../preview/email-frame"

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
  const listId = useId()
  const [index, setIndex] = useState(0)
  const at = Math.min(index, recipients.length - 1)
  const recipient = recipients[at]
  const preview = useQuery({
    ...previewQuery(template.id),
    retry: false,
  })

  const values = {
    employer_company_name: t("preview.sampleCompany"),
    sender_name: t("preview.sampleSender"),
    invite_link: sampleInviteLink(),
    candidate_name: recipient?.name ?? "",
    job_role: role,
  }
  const local = preview.isError && !preview.data
  const subject =
    preview.data?.subject ??
    fillFields(template.subject_template, values, { html: false })
  const html =
    preview.data?.preview_html ??
    (local
      ? previewDocument({ body: template.body_html_template, values })
      : null)

  const company = values.employer_company_name

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
      <aside className="min-w-0 overflow-hidden rounded-lg border lg:sticky lg:top-20">
        <dl className="flex flex-col gap-3 border-b p-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">
              {t("send.summaryTemplate")}
            </dt>
            <dd className="truncate font-medium">{template.name}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">
              {t("send.summaryRole")}
            </dt>
            <dd className="truncate font-medium">{role}</dd>
          </div>
        </dl>
        <h3
          id={listId}
          className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-muted-foreground"
        >
          {t("send.steps.candidates")}
          <span className="rounded-full bg-muted px-1.5 tabular-nums">
            {recipients.length}
          </span>
        </h3>
        <ul aria-labelledby={listId} className="max-h-96 overflow-y-auto p-1.5">
          {recipients.map((item, i) => (
            <li key={item.email}>
              <button
                type="button"
                aria-current={i === at}
                onClick={() => {
                  setIndex(i)
                }}
                className="relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-start transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {i === at && (
                  <m.span
                    layoutId={listId}
                    aria-hidden="true"
                    transition={{ duration: duration.base, ease }}
                    className="absolute inset-0 rounded-md bg-brand-muted/60"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium text-brand-text ring-1 ring-border"
                >
                  {item.name.charAt(0).toUpperCase()}
                </span>
                <span className="relative flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {item.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {item.email}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section
        aria-label={t("preview.frame")}
        className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card"
      >
        <header className="flex flex-col gap-3 border-b px-5 py-4">
          <div className="relative grid">
            <AnimatePresence initial={false} mode="popLayout">
              <m.h3
                key={subject}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast, ease }}
                className="text-base font-semibold text-pretty"
              >
                {subject}
              </m.h3>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-medium text-brand-text"
            >
              {company.charAt(0).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{company}</span>
              <span className="truncate text-xs text-muted-foreground">
                {t("preview.to")}{" "}
                {recipient && `${recipient.name} <${recipient.email}>`}
              </span>
            </span>
          </div>
          {local && (
            <p className="flex items-start gap-1.5 text-xs text-pretty text-muted-foreground">
              <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              {t("send.localPreview")}
            </p>
          )}
        </header>
        <div className="max-h-160 overflow-y-auto">
          {html ? (
            <EmailFrame html={html} title={t("preview.frame")} />
          ) : (
            <div className="flex flex-col gap-3 p-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
