import { useTranslation } from "@workspace/i18n/react"

import { CtaBand } from "@/components/cta-band"
import { APP_LINKS } from "@/lib/app-links"

export function FinalCta() {
  const { t } = useTranslation("home")

  return (
    <CtaBand
      eyebrow={t("hireCard.title")}
      title={`${t("hero.tagline.stop")} ${t("hero.tagline.start")}`}
      description={t("hireCard.description")}
      primary={{
        label: t("hireCard.startHiring"),
        href: APP_LINKS.employerRegister,
      }}
      secondary={{
        label: t("hireCard.applyJob"),
        href: APP_LINKS.candidateRegister,
      }}
    />
  )
}
