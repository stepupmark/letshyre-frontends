import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"

export const handle = { crumb: "dashboard" } as const

export default function EmployerDashboard() {
  const { t } = useTranslation(["shell", "common"])

  return (
    <>
      <title>{`${t("shell:nav.dashboard")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("shell:nav.dashboard")} />
    </>
  )
}
