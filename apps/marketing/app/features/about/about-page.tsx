import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

export function AboutPage() {
  const { t } = useTranslation("about")
  return (
    <PageHeader title={t("meta.name")} description={t("meta.description")} />
  )
}
