import { useTranslation } from "@workspace/i18n/react"

import { CompanyProfile } from "@/features/company-profile"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "profile" } as const

export const clientMiddleware = [namespaces(["company"])]

export default function CompanyPage() {
  const { t } = useTranslation(["company", "common"])
  return (
    <>
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <CompanyProfile />
    </>
  )
}
