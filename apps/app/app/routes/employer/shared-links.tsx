import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"
import { SharedLinks } from "@/features/candidate"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "sharedLinks" } as const

export const clientMiddleware = [namespaces(["candidate"])]

export default function SharedLinksPage() {
  const { t } = useTranslation(["candidate", "common"])
  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("links.title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("links.title")} description={t("links.lead")} />
      <SharedLinks />
    </div>
  )
}
