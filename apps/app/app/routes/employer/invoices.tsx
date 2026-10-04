import { useTranslation } from "@workspace/i18n/react"
import { Coins } from "lucide-react"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { Invoices } from "@/features/billing"
import { buttonLink } from "@/lib/button-link"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "billing" } as const

export const clientMiddleware = [namespaces(["billing"])]

export default function InvoicesPage() {
  const { t } = useTranslation(["billing", "common"])
  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("invoiceList.title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("invoiceList.title")}
        description={t("invoiceList.lead")}
        actions={
          <AppLink to="/employer/billing" className={buttonLink()}>
            <Coins />
            {t("buyCredits")}
          </AppLink>
        }
      />
      <Invoices />
    </div>
  )
}
