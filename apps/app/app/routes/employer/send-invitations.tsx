import { useTranslation } from "@workspace/i18n/react"

import { useJobOptions } from "@/features/employer-jobs"
import { SendInvitations } from "@/features/invitations"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "invitations" } as const

export const clientMiddleware = [namespaces(["invitations"])]

export default function SendInvitationsPage() {
  const { t } = useTranslation(["invitations", "common"])
  const jobs = useJobOptions()
  return (
    <>
      <title>{`${t("send.title")} · ${t("common:appName")}`}</title>
      <SendInvitations roles={[...new Set(jobs?.map((job) => job.label))]} />
    </>
  )
}
