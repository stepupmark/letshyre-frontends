import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"
import { InterviewGuide } from "@/features/interview-guide"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "interviewGuide" } as const

export const clientMiddleware = [namespaces(["guide"])]

export default function InterviewGuidePage() {
  const { t } = useTranslation(["guide", "common"])
  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("title")} description={t("lead")} />
      <InterviewGuide />
    </div>
  )
}
