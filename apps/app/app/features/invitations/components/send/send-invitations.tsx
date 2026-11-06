import { useTranslation } from "@workspace/i18n/react"
import { Spinner } from "@workspace/ui/components/spinner"
import { useQuery } from "@tanstack/react-query"
import { Send } from "lucide-react"
import { useState } from "react"
import { href } from "react-router"

import { BackLink } from "@/components/back-link"
import { PageHeader } from "@/components/page-header"
import { QueryState } from "@/components/query-state"
import { Wizard } from "@/components/wizard"

import { SEND_STEP, useSendPlan } from "../../hooks/use-send-plan"
import { notQueued, type Recipient } from "../../lib/recipients"
import { useSendInvitations } from "../../mutations/use-send-invitations"
import { templatesQuery } from "../../queries/templates.queries"
import type { Template } from "../../schemas/template.schema"
import { RecipientsStep } from "./recipients-step"
import { ReviewStep } from "./review-step"
import { SendResult } from "./send-result"
import { SendSkeleton } from "./send-skeleton"
import { SendSummary } from "./send-summary"
import { TemplateStep } from "./template-step"

export function SendInvitations({ jobTitles }: { jobTitles: string[] }) {
  const { t } = useTranslation("invitations")
  const templates = useQuery(templatesQuery())
  return (
    <div className="flex flex-col gap-6">
      <BackLink to={href("/employer/invitations")}>{t("title")}</BackLink>
      <QueryState
        query={templates}
        skeleton={<SendSkeleton />}
        error={{
          title: t("library.errorTitle"),
          body: t("library.errorRetry"),
        }}
      >
        {(list) => (
          <SendFlow templates={list} roles={[...new Set(jobTitles)]} />
        )}
      </QueryState>
    </div>
  )
}

function SendFlow({
  templates,
  roles,
}: {
  templates: Template[]
  roles: string[]
}) {
  const { t } = useTranslation("invitations")
  const flow = useSendPlan(templates)
  const { plan, template, errors, update } = flow
  const send = useSendInvitations()
  const [step, setStep] = useState<string>()
  const [result, setResult] = useState<{
    sent: Recipient[]
    queued: string[]
    missed: Recipient[]
    at: Date
  } | null>(null)

  const startOver = (recipients: Recipient[]) => {
    setResult(null)
    update({ recipients })
    flow.showStep(SEND_STEP.candidates)
  }

  if (result)
    return (
      <SendResult
        sent={result.sent}
        queued={result.queued}
        missed={result.missed}
        role={plan.role.trim()}
        templateName={template?.name ?? ""}
        sentAt={result.at}
        onAgain={() => {
          startOver([])
        }}
        onRetry={startOver}
      />
    )

  const summary = (
    <SendSummary
      template={template}
      role={plan.role}
      recipients={plan.recipients}
      current={step}
      onChange={flow.showStep}
    />
  )

  return (
    <>
      <PageHeader title={t("send.title")} />
      <Wizard
        wide
        hideHeadings
        pending={send.isPending}
        onStepChange={setStep}
        finishLabel={
          send.isPending ? (
            <>
              <Spinner />
              {t("send.sending")}
            </>
          ) : (
            <>
              <Send className="rtl:-scale-x-100" />
              {t("send.submit", { count: plan.recipients.length })}
            </>
          )
        }
        onFinish={async () => {
          if (!template) return
          const recipients = plan.recipients.map((recipient) => ({
            email: recipient.email,
            name: recipient.name.trim(),
          }))
          const sent = await send.mutateAsync({
            templateId: template.id,
            recipients,
            jobRole: plan.role.trim(),
          })
          flow.clearDraft()
          setResult({
            sent: recipients,
            queued: sent.recipients,
            missed: notQueued(recipients, sent.recipients),
            at: new Date(),
          })
        }}
        steps={[
          {
            id: SEND_STEP.template,
            title: t("send.steps.template"),
            aside: summary,
            isComplete: () => Boolean(template),
            validate: flow.checkTemplate,
            content: (
              <TemplateStep
                templates={templates}
                value={plan.templateId}
                error={errors.template}
                onChange={(templateId) => {
                  update({ templateId })
                }}
              />
            ),
          },
          {
            id: SEND_STEP.candidates,
            title: t("send.steps.candidates"),
            aside: summary,
            isComplete: flow.candidatesReady,
            validate: flow.checkCandidates,
            content: (
              <RecipientsStep
                recipients={plan.recipients}
                role={plan.role}
                roles={roles}
                errors={errors}
                onRecipients={(recipients) => {
                  update({ recipients })
                }}
                onRole={(role) => {
                  update({ role })
                }}
              />
            ),
          },
          {
            id: SEND_STEP.review,
            title: t("send.steps.review"),
            content: template && (
              <ReviewStep
                template={template}
                recipients={plan.recipients}
                role={plan.role.trim()}
              />
            ),
          },
        ]}
      />
    </>
  )
}
