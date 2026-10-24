import { useTranslation } from "@workspace/i18n/react"

import { PricingPage } from "@/features/pricing"

export default function Pricing() {
  const { t } = useTranslation(["pricing", "common"])
  return (
    <>
      <title>{`${t("hero.eyebrow")} · ${t("common:appName")}`}</title>
      <meta name="description" content={t("meta.description")} />
      <PricingPage />
    </>
  )
}
