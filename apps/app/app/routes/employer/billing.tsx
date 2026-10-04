import { useTranslation } from "@workspace/i18n/react"

import { Billing } from "@/features/billing"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "billing" } as const

export const clientMiddleware = [namespaces(["billing"])]

export default function BillingPage() {
  const { t } = useTranslation(["billing", "common"])
  return (
    <>
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <Billing />
    </>
  )
}
