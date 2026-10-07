import { useLocale, useTranslation } from "@workspace/i18n/react"

import { CtaBand } from "@/components/cta-band"
import { APP_LINKS } from "@/lib/app-links"

import { salesContactPath } from "../lib/checkout-url"

export function PricingCta() {
  const { t } = useTranslation("pricing")
  const lang = useLocale()

  return (
    <CtaBand
      title={t("cta.title")}
      description={t("cta.body")}
      primary={{
        label: t("cta.primary"),
        href: APP_LINKS.employerRegister,
      }}
      secondary={{ label: t("cta.secondary"), to: salesContactPath(lang) }}
    />
  )
}
