import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"

/** Live from the first release, so each deploy can confirm nginx hands routes to this app. */
export default function ReleaseCheck() {
  const { t } = useTranslation("common")

  return (
    <>
      <title>{`${t("releaseCheck.title")} · ${t("appName")}`}</title>
      <PageHeader
        title={t("releaseCheck.title")}
        description={t("releaseCheck.body")}
      />
    </>
  )
}
