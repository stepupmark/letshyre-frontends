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
    ...previewQuery(template.id, {
      candidate_name: recipient?.name ?? "",
      job_role: role,
    }),
    enabled: Boolean(recipient),
    retry: false,
    placeholderData: (previous) => previous,
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

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20">
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-lg border p-4 text-sm">
          <dt className="text-muted-foreground">{t("send.summaryTemplate")}</dt>
          <dd className="truncate font-medium">{template.name}</dd>
          <dt className="text-muted-foreground">{t("send.summaryRole")}</dt>
          <dd className="truncate font-medium">{role}</dd>
        </dl>

        <section
          aria-labelledby={listId}
          className="overflow-hidden rounded-lg border"
        >
          <h3
            id={listId}
            className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5 text-sm font-medium"
          >
            {t("send.steps.candidates")}
            <span className="rounded-full bg-brand-muted px-2 text-xs text-brand-text tabular-nums">
              {recipients.length}
            </span>
          </h3>
          <ul className="max-h-96 divide-y overflow-y-auto">
            {recipients.map((item, i) => (
              <li key={item.email}>
                <button
                  type="button"
                  aria-current={i === at}
                  onClick={() => {
                    setIndex(i)
                  }}
                  className="relative flex w-full items-center gap-3 px-4 py-2.5 text-start transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/40 aria-current:bg-brand-muted/40"
                >
                  {i === at && (
                    <m.span
                      layoutId={listId}
                      aria-hidden="true"
                      transition={{ duration: duration.base, ease }}
                      className="absolute inset-y-1 inset-s-0 w-0.5 rounded-full bg-brand"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-medium text-brand-text"
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 flex-col">
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
        </section>
      </div>

      <section
        aria-label={t("preview.frame")}
        className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card"
      >
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-b px-4 py-3 text-sm">
          <dt className="text-muted-foreground">{t("preview.to")}</dt>
          <dd className="truncate">
            {recipient && `${recipient.name} <${recipient.email}>`}
          </dd>
          <dt className="text-muted-foreground">{t("preview.subject")}</dt>
          <dd className="relative grid font-medium text-pretty">
            <AnimatePresence initial={false} mode="popLayout">
              <m.span
                key={subject}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast, ease }}
              >
                {subject}
              </m.span>
            </AnimatePresence>
          </dd>
        </dl>
        {local && (
          <p className="flex items-start gap-2 border-b bg-muted/30 px-4 py-2 text-xs text-pretty text-muted-foreground">
            <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            {t("send.localPreview")}
          </p>
        )}
        <div className="bg-muted/40 p-3">
          {html ? (
            <div className="overflow-hidden rounded-md border bg-background">
              <EmailFrame html={html} title={t("preview.frame")} />
            </div>
          ) : (
            <Skeleton className="h-96 w-full" />
          )}
        </div>
      </section>
    </div>
  )
}
