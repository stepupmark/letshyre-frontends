import { useTranslation } from "@workspace/i18n/react"

import { CtaBand } from "@/components/cta-band"

export function FinalCta() {
  const { t } = useTranslation("home")

  return (
    <CtaBand
      eyebrow={t("hireCard.title")}
      title={`${t("hero.tagline.stop")} ${t("hero.tagline.start")}`}
      description={t("hireCard.description")}
      hireLabel={t("hireCard.startHiring")}
      joinLabel={t("hireCard.applyJob")}
    />
  )
}
