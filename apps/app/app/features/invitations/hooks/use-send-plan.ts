import { useTranslation } from "@workspace/i18n/react"
import { useState } from "react"
import { useSearchParams } from "react-router"

import { useAutosave } from "@/hooks/use-draft"
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"

import { RECIPIENT_LIMIT, type Recipient } from "../lib/recipients"
import { sendBlock } from "../lib/sendable"
import { makeSendCandidatesSchema } from "../schemas/send-form.schema"
import type { Template } from "../schemas/template.schema"

const DRAFT = "invitation-send"

export const SEND_STEP = {
  template: "template",
  candidates: "candidates",
  review: "review",
} as const

export type SendStep = (typeof SEND_STEP)[keyof typeof SEND_STEP]

interface Plan {
  templateId: string | null
  recipients: Recipient[]
  role: string
}

interface SendErrors {
  template?: string
  recipients?: string
  role?: string
}

/** What is about to be sent, kept as a draft so a refresh doesn't lose the list. */
export function useSendPlan(templates: Template[]) {
  const { t } = useTranslation("invitations")
  const [params, setParams] = useSearchParams()
  const sendable = (id: string | null | undefined) =>
    templates.some((item) => item.id === id && !sendBlock(item))
  const [plan, setPlan] = useState<Plan>(() => {
    const draft = loadDraft<Plan>(DRAFT)
    const asked = params.get("template")
    return {
      templateId: sendable(asked)
        ? asked
        : sendable(draft?.templateId)
          ? (draft?.templateId ?? null)
          : null,
      recipients: draft?.recipients ?? [],
      role: draft?.role ?? "",
    }
  })
  const [errors, setErrors] = useState<SendErrors>({})
  useAutosave(plan, () => {
    saveDraft(DRAFT, plan)
  })

  const template = templates.find((item) => item.id === plan.templateId)
  const schema = makeSendCandidatesSchema({
    none: t("send.errors.none"),
    overLimit: t("send.overLimit", { max: RECIPIENT_LIMIT }),
    names: t("send.errors.names"),
    role: t("send.errors.role"),
  })

  const candidateProblems = () => {
    const parsed = schema.safeParse(plan)
    const problems: SendErrors = {}
    for (const issue of parsed.error?.issues ?? []) {
      const field = issue.path[0]
      if (field === "recipients" || field === "role")
        problems[field] ??= issue.message
    }
    return problems
  }

  return {
    plan,
    template,
    errors,
    update: (next: Partial<Plan>) => {
      setPlan((current) => ({ ...current, ...next }))
      setErrors({})
    },
    checkTemplate: () => {
      if (template) return true
      setErrors({ template: t("send.errors.template") })
      return false
    },
    candidatesReady: () => Object.keys(candidateProblems()).length === 0,
    checkCandidates: () => {
      const problems = candidateProblems()
      setErrors(problems)
      return Object.keys(problems).length === 0
    },
    showStep: (step: SendStep) => {
      setParams(
        (prev) => {
          const search = new URLSearchParams(prev)
          search.set("step", step)
          return search
        },
        { preventScrollReset: true }
      )
    },
    clearDraft: () => {
      clearDraft(DRAFT)
    },
  }
}
