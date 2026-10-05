import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"
import { ScorecardList } from "@/features/candidate"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "scorecards" } as const

export const clientMiddleware = [namespaces(["candidate"])]

export default function ScorecardsPage() {
  const { t } = useTranslation(["candidate", "common"])
  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("list.title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("list.title")} description={t("list.lead")} />
      <ScorecardList />
    </div>
  )
}
