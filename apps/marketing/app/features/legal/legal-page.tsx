import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

export type LegalNamespace = "legalTerms" | "legalPolicy" | "legalRefund"

export function LegalPage({ ns }: { ns: LegalNamespace }) {
  const { t } = useTranslation(ns)
  return (
    <PageHeader title={t("meta.name")} description={t("meta.description")} />
  )
}
