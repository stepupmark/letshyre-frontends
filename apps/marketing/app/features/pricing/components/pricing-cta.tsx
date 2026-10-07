import { useLocale, useTranslation } from "@workspace/i18n/react"

import { CtaBand } from "@/components/cta-band"

import { salesContactPath } from "../lib/checkout-url"

export function PricingCta() {
  const { t } = useTranslation("pricing")
  const lang = useLocale()

  return (
    <CtaBand
      title={t("cta.title")}
      description={t("cta.body")}
      hireLabel={t("cta.primary")}
      secondary={{ label: t("cta.secondary"), to: salesContactPath(lang) }}
    />
  )
}
