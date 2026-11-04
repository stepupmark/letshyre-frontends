import { useTranslation } from "@workspace/i18n/react"

import { TemplateLibrary } from "@/features/invitations"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "invitations" } as const

export const clientMiddleware = [namespaces(["invitations"])]

export default function InvitationsPage() {
  const { t } = useTranslation(["invitations", "common"])
  return (
    <>
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <TemplateLibrary />
    </>
  )
}
