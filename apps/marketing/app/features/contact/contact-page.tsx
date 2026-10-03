import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

export function ContactPage() {
  const { t } = useTranslation("contact")
  return (
    <PageHeader title={t("meta.name")} description={t("meta.description")} />
  )
}
