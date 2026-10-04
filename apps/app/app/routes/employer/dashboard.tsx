import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"

export default function EmployerDashboard() {
  const { t } = useTranslation("common")

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 md:p-8">
      <title>{`${t("nav.dashboard")} · ${t("appName")}`}</title>
      <PageHeader title={t("nav.dashboard")} />
    </main>
  )
}
