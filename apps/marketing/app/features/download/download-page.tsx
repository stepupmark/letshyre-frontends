import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

export function DownloadPage() {
  const { t } = useTranslation("download")
  return (
    <PageHeader title={t("meta.name")} description={t("meta.description")} />
  )
}
