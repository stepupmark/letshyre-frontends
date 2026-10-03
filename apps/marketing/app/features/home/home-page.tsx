import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

export function HomePage() {
  const { t } = useTranslation("home")
  return (
    <PageHeader title={t("meta.name")} description={t("meta.description")} />
  )
}
