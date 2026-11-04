import { useTranslation } from "@workspace/i18n/react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import type { Recipient } from "../lib/recipients"
import { sendInvitations } from "../services/templates.service"

export function useSendInvitations() {
  const { t } = useTranslation("invitations")
  return useMutation({
    mutationFn: ({
      templateId,
      recipients,
      jobRole,
    }: {
      templateId: string
      recipients: Recipient[]
      jobRole: string
    }) =>
      sendInvitations(templateId, {
        recipients: recipients.map(({ email, name }) => ({ email, name })),
        job_role: jobRole,
      }),
    onError: () => {
      toast.error(t("toast.sendFailed"))
    },
  })
}
