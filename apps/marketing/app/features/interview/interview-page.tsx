import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

export function InterviewPage() {
  const { t } = useTranslation("interview")
  return (
    <PageHeader title={t("meta.name")} description={t("meta.description")} />
  )
}
