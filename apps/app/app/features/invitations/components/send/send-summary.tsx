import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Mail } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, type ReactNode } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { duration, ease } from "@/lib/motion"

import { useEmailPreview } from "../../hooks/use-email-preview"
import { SEND_STEP, type SendStep } from "../../hooks/use-send-plan"
import type { Recipient } from "../../lib/recipients"
import type { Template } from "../../schemas/template.schema"
import { EmailFrame } from "../preview/email-frame"
import { Monogram } from "../shared/monogram"

const STACK = 4

/** The invitation as it stands, filled in step by step. */
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
  const titleId = useId()
  const extra = recipients.length - STACK

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col overflow-hidden rounded-lg border bg-card"
    >
      <h3
        id={titleId}
        className="border-b px-4 py-3 text-sm font-medium text-muted-foreground"
      >
        {t("send.summaryTitle")}
      </h3>
      <dl className="flex flex-col divide-y">
        <Row
          label={t("send.summaryTemplate")}
          filled={Boolean(template)}
          animateKey={template?.id}
          placeholder={t("send.notChosen")}
          action={
            template &&
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
          {template && <span className="font-medium">{template.name}</span>}
        </Row>
        <Row
          label={t("send.summaryRole")}
          filled={Boolean(role.trim())}
          placeholder={t("send.notSet")}
          action={
            role.trim() &&
            current === SEND_STEP.review && (
              <ChangeButton
                label={t("send.summaryRole")}
                onClick={() => {
                  onChange(SEND_STEP.candidates)
                }}
              />
            )
          }
        >
          {role.trim() && <span className="font-medium">{role.trim()}</span>}
        </Row>
        <Row
          label={t("send.steps.candidates")}
          filled={recipients.length > 0}
          placeholder={t("send.noCandidates")}
          action={
            recipients.length > 0 &&
            current === SEND_STEP.review && (
              <ChangeButton
                label={t("send.steps.candidates")}
                onClick={() => {
                  onChange(SEND_STEP.candidates)
                }}
              />
            )
          }
        >
          {recipients.length > 0 && (
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
              <span className="font-medium tabular-nums">
                <AnimatedNumber value={recipients.length} locale={locale} />
              </span>
            </span>
          )}
        </Row>
      </dl>
      <SummaryPreview
        template={template}
        role={role}
        firstName={recipients[0]?.name}
      />
    </section>
  )
}

function Row({
  label,
  filled,
  animateKey,
  placeholder,
  action,
  children,
}: {
  label: string
  filled: boolean
  /** a new value under this key fades in again, e.g. another template */
  animateKey?: string
  placeholder: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 text-sm">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-start justify-between gap-3">
        <span className="relative min-w-0 wrap-break-word">
          <AnimatePresence initial={false} mode="popLayout">
            <m.span
              key={animateKey ?? String(filled)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease }}
              className="block"
            >
              {filled ? (
                children
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </m.span>
          </AnimatePresence>
        </span>
        {action}
      </dd>
    </div>
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
      className="-my-1 -me-2 shrink-0 max-md:h-11"
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
  template: Template | undefined
  role: string
  firstName: string | undefined
}) {
  const { t } = useTranslation("invitations")
  if (!template)
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 border-t bg-muted/40 px-6 text-center text-sm text-pretty text-muted-foreground">
        <Mail aria-hidden="true" className="size-5" />
        {t("send.previewEmpty")}
      </div>
    )
  return (
    <div className="relative h-56 overflow-hidden border-t bg-muted mask-b-from-70%">
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
