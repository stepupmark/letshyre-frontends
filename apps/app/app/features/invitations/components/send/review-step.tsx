import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useState } from "react"

import { LoadError } from "@/components/query-state"
import { duration, ease } from "@/lib/motion"

import type { Recipient } from "../../lib/recipients"
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
  const [index, setIndex] = useState(0)
  const at = Math.min(index, recipients.length - 1)
  const recipient = recipients[at]
  const preview = useQuery({
    ...previewQuery(template.id, {
      candidate_name: recipient?.name ?? "",
      job_role: role,
    }),
    enabled: Boolean(recipient),
    placeholderData: (previous) => previous,
  })

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-lg border p-4 text-sm">
        <dt className="text-muted-foreground">{t("send.summaryTemplate")}</dt>
        <dd className="truncate font-medium">{template.name}</dd>
        <dt className="text-muted-foreground">{t("send.summaryRole")}</dt>
        <dd className="truncate font-medium">{role}</dd>
        <dt className="text-muted-foreground">{t("send.summaryTo")}</dt>
        <dd className="font-medium tabular-nums">
          {t("send.listTitle", { count: recipients.length })}
        </dd>
      </dl>

      <section className="flex flex-col overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
          <p className="text-sm tabular-nums" aria-live="polite">
            {t("send.previewAs", {
              name: recipient?.name ?? "",
              at: at + 1,
              total: recipients.length,
            })}
          </p>
          <span className="flex">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("send.previous")}
              disabled={at === 0}
              onClick={() => {
                setIndex(at - 1)
              }}
            >
              <ChevronLeft className="rtl:-scale-x-100" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("send.next")}
              disabled={at >= recipients.length - 1}
              onClick={() => {
                setIndex(at + 1)
              }}
            >
              <ChevronRight className="rtl:-scale-x-100" />
            </Button>
          </span>
        </div>
        {preview.data ? (
          <>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-b px-4 py-3 text-sm">
              <dt className="text-muted-foreground">{t("preview.to")}</dt>
              <dd className="truncate">
                {recipient && `${recipient.name} <${recipient.email}>`}
              </dd>
              <dt className="text-muted-foreground">{t("preview.subject")}</dt>
              <dd className="relative grid font-medium text-pretty">
                <AnimatePresence initial={false} mode="popLayout">
                  <m.span
                    key={preview.data.subject}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration.fast, ease }}
                  >
                    {preview.data.subject}
                  </m.span>
                </AnimatePresence>
              </dd>
            </dl>
            <div className="bg-muted/40 p-3">
              <div className="overflow-hidden rounded-md border bg-background">
                <EmailFrame
                  html={preview.data.preview_html}
                  title={t("preview.frame")}
                />
              </div>
            </div>
          </>
        ) : preview.isError ? (
          <div className="p-4">
            <LoadError
              title={t("send.previewErrorTitle")}
              body={t("send.previewErrorBody")}
              onRetry={() => void preview.refetch()}
              retrying={preview.isFetching}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-80 w-full" />
          </div>
        )}
      </section>
    </div>
  )
}
