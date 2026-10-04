import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"

export const handle = { crumb: "findJobs" } as const

export default function FindJobs() {
  const { t } = useTranslation(["shell", "common"])

  return (
    <>
      <title>{`${t("shell:nav.findJobs")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("shell:nav.findJobs")} />
    </>
  )
}
