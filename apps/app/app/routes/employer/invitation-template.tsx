import { useTranslation } from "@workspace/i18n/react"

import { TemplateEditor } from "@/features/invitations"
import { namespaces } from "@/lib/i18n"

import type { Route } from "./+types/invitation-template"

export const handle = { crumb: "invitations" } as const

export const clientMiddleware = [namespaces(["invitations"])]

export default function InvitationTemplatePage({
  params,
}: Route.ComponentProps) {
  const { t } = useTranslation(["invitations", "common"])
  return (
    <>
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <TemplateEditor templateId={params.templateId} />
    </>
  )
}
