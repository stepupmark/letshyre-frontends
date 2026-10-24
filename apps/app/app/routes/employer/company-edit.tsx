import { useTranslation } from "@workspace/i18n/react"

import { CompanyEdit } from "@/features/company-profile"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "companyProfile" } as const

export const clientMiddleware = [namespaces(["company"])]

export default function CompanyEditPage() {
  const { t } = useTranslation(["company", "common"])
  return (
    <>
      <title>{`${t("edit.title")} · ${t("common:appName")}`}</title>
      <CompanyEdit />
    </>
  )
}
