import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

export function PricingPage() {
  const { t } = useTranslation("pricing")
  return (
    <PageHeader title={t("meta.name")} description={t("meta.description")} />
  )
}
