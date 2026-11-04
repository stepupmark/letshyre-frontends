import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { href, useSearchParams } from "react-router"

import { BackLink } from "@/components/back-link"
import { PageHeader } from "@/components/page-header"
import { QueryState } from "@/components/query-state"
import { Wizard } from "@/components/wizard"
import { useAutosave } from "@/hooks/use-draft"
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"

import {
  notQueued,
  RECIPIENT_LIMIT,
  type Recipient,
} from "../../lib/recipients"
import { useSendInvitations } from "../../mutations/use-send-invitations"
import { templatesQuery } from "../../queries/templates.queries"
import type { Template } from "../../schemas/template.schema"
import { LibrarySkeleton } from "../library/library-skeleton"
import { RecipientsStep } from "./recipients-step"
import { ReviewStep } from "./review-step"
import { SendResult } from "./send-result"
import { TemplateStep } from "./template-step"

const DRAFT = "invitation-send"
const STEP_PARAM = "step"
const STEP = {
  template: "template",
  candidates: "candidates",
  review: "review",
} as const

interface Plan {
  templateId: string | null
  recipients: Recipient[]
  role: string
}

export function SendInvitations({ roles }: { roles: string[] }) {
  const { t } = useTranslation("invitations")
  const templates = useQuery(templatesQuery())
  return (
    <div className="flex flex-col gap-6">
      <BackLink to={href("/employer/invitations")}>{t("title")}</BackLink>
      <QueryState
        query={templates}
        skeleton={<LibrarySkeleton />}
        error={{ title: t("library.errorTitle"), body: t("library.errorBody") }}
      >
        {(list) => <SendFlow templates={list} roles={roles} />}
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
  const [params, setParams] = useSearchParams()
  const exists = (id: string | null | undefined) =>
    templates.some((template) => template.id === id)
  const [plan, setPlan] = useState<Plan>(() => {
    const draft = loadDraft<Plan>(DRAFT)
    const asked = params.get("template")
    return {
      templateId: exists(asked)
        ? asked
        : exists(draft?.templateId)
          ? (draft?.templateId ?? null)
          : null,
      recipients: draft?.recipients ?? [],
      role: draft?.role ?? "",
    }
  })
  const [errors, setErrors] = useState<{
    template?: string
    recipients?: string
    role?: string
  }>({})
  const [result, setResult] = useState<{
    queued: string[]
    missed: Recipient[]
  } | null>(null)
  const send = useSendInvitations()
  useAutosave(plan, () => {
    saveDraft(DRAFT, plan)
  })

  const template = templates.find((item) => item.id === plan.templateId)
  const update = (next: Partial<Plan>) => {
    setPlan((current) => ({ ...current, ...next }))
    setErrors({})
  }
  const candidatesProblems = () => ({
    recipients:
      plan.recipients.length === 0
        ? t("send.errors.none")
        : plan.recipients.length > RECIPIENT_LIMIT
          ? t("send.overLimit", { max: RECIPIENT_LIMIT })
          : plan.recipients.some((recipient) => !recipient.name.trim())
            ? t("send.errors.names")
            : undefined,
    role: plan.role.trim() ? undefined : t("send.errors.role"),
  })

  if (result)
    return (
      <SendResult
        queued={result.queued}
        missed={result.missed}
        role={plan.role.trim()}
        onAgain={() => {
          setResult(null)
          update({ recipients: [] })
          setParams((prev) => {
            const search = new URLSearchParams(prev)
            search.set(STEP_PARAM, STEP.candidates)
            return search
          })
        }}
      />
    )

  return (
    <>
      <PageHeader title={t("send.title")} description={t("send.lead")} />
      <Wizard
        pending={send.isPending}
        finishLabel={
          send.isPending
            ? t("send.sending")
            : t("send.submit", { count: plan.recipients.length })
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
          clearDraft(DRAFT)
          setResult({
            queued: sent.recipients,
            missed: notQueued(recipients, sent.recipients),
          })
        }}
        steps={[
          {
            id: STEP.template,
            title: t("send.steps.template"),
            isComplete: () => Boolean(template),
            validate: () => {
              if (template) return true
              setErrors({ template: t("send.errors.template") })
              return false
            },
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
            id: STEP.candidates,
            title: t("send.steps.candidates"),
            isComplete: () =>
              Object.values(candidatesProblems()).every((v) => !v),
            validate: () => {
              const problems = candidatesProblems()
              setErrors(problems)
              return Object.values(problems).every((v) => !v)
            },
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
            id: STEP.review,
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
