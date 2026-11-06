import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { duration, ease } from "@/lib/motion"

import { useEmailPreview } from "../../hooks/use-email-preview"
import { SEND_STEP, type SendStep } from "../../hooks/use-send-plan"
import type { Recipient } from "../../lib/recipients"
import type { Template } from "../../schemas/template.schema"
import { EmailFrame } from "../preview/email-frame"
import { Monogram } from "../shared/monogram"

const STACK = 4

/** The invitation as it stands; rows appear as they're filled in. */
export function SendSummary({
  template,
  role,
  recipients,
  current,
  onChange,
}: {
  template: Template | undefined
  role: string
  recipients: Recipient[]
  current: string | undefined
  onChange: (step: SendStep) => void
}) {
  const { t } = useTranslation("invitations")
  const locale = useLocale()
  if (!template) return null
  const extra = recipients.length - STACK
  const onReview = current === SEND_STEP.review

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border bg-card">
      <SummaryPreview
        template={template}
        role={role}
        firstName={recipients[0]?.name}
      />
      <dl className="flex flex-col divide-y border-t">
        <Row
          id={template.id}
          label={t("send.summaryTemplate")}
          action={
            current !== SEND_STEP.template && (
              <ChangeButton
                label={t("send.summaryTemplate")}
                onClick={() => {
                  onChange(SEND_STEP.template)
                }}
              />
            )
          }
        >
          {template.name}
        </Row>
        <AnimatePresence initial={false}>
          {role.trim() && (
            <Row
              key="role"
              label={t("send.summaryRole")}
              action={
                onReview && (
                  <ChangeButton
                    label={t("send.summaryRole")}
                    onClick={() => {
                      onChange(SEND_STEP.candidates)
                    }}
                  />
                )
              }
            >
              {role.trim()}
            </Row>
          )}
          {recipients.length > 0 && (
            <Row
              key="candidates"
              label={t("send.steps.candidates")}
              action={
                onReview && (
                  <ChangeButton
                    label={t("send.steps.candidates")}
                    onClick={() => {
                      onChange(SEND_STEP.candidates)
                    }}
                  />
                )
              }
            >
              <span className="flex items-center gap-3">
                <span className="flex -space-x-1.5 rtl:space-x-reverse">
                  <AnimatePresence initial={false}>
                    {recipients.slice(0, STACK).map((recipient) => (
                      <m.span
                        key={recipient.email.toLowerCase()}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: duration.base, ease }}
                      >
                        <Monogram
                          name={recipient.name || recipient.email}
                          className="ring-2 ring-card"
                        />
                      </m.span>
                    ))}
                  </AnimatePresence>
                  {extra > 0 && (
                    <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground tabular-nums ring-2 ring-card">
                      +{extra}
                    </span>
                  )}
                </span>
                <span className="tabular-nums">
                  <AnimatedNumber value={recipients.length} locale={locale} />
                </span>
              </span>
            </Row>
          )}
        </AnimatePresence>
      </dl>
    </section>
  )
}

function Row({
  id,
  label,
  action,
  children,
}: {
  /** a new value under this id fades in again, e.g. another template */
  id?: string
  label: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <m.div
      key={id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: duration.base, ease }}
      className="flex flex-col px-4 py-2.5 text-sm"
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 font-medium wrap-break-word">{children}</span>
        {action}
      </dd>
    </m.div>
  )
}

function ChangeButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  const { t } = useTranslation("invitations")
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-my-1.5 -me-2 shrink-0 max-md:h-11"
      onClick={onClick}
    >
      {t("send.change")}
      <span className="sr-only"> {label}</span>
    </Button>
  )
}

function SummaryPreview({
  template,
  role,
  firstName,
}: {
  template: Template
  role: string
  firstName: string | undefined
}) {
  const { t } = useTranslation("invitations")
  return (
    <div className="relative h-56 overflow-hidden bg-muted mask-b-from-70%">
      <AnimatePresence initial={false}>
        <m.div
          key={template.id}
          inert
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.slow, ease }}
          className="absolute inset-0"
        >
          <MiniEmail
            template={template}
            person={{
              candidate_name: firstName?.trim()
                ? firstName.trim()
                : t("preview.sampleName"),
              job_role: role.trim() ? role.trim() : t("preview.sampleRole"),
            }}
          />
        </m.div>
      </AnimatePresence>
    </div>
  )
}

function MiniEmail({
  template,
  person,
}: {
  template: Template
  person: { candidate_name: string; job_role: string }
}) {
  const { t } = useTranslation("invitations")
  const { html } = useEmailPreview({
    templateId: template.id,
    subject: template.subject_template,
    body: template.body_html_template,
    person,
  })
  return (
    <div className="absolute inset-x-0 top-0 w-[200%] origin-top-left scale-50 rtl:origin-top-right">
      <EmailFrame html={html} title={t("preview.frame")} />
    </div>
  )
}
