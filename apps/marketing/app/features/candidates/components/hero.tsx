import { useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"

import { AudienceHero } from "@/components/audience-hero"
import { CtaLink, OutlineLink } from "@/components/cta-links"
import { APP_LINKS } from "@/lib/app-links"
import { usePagePath } from "@/hooks/use-page-path"

import { HeroCard } from "./art/hero-card"

export function Hero() {
  const { t } = useTranslation("candidates")
  const pagePath = usePagePath()

  return (
    <AudienceHero
      eyebrow={t("hero.eyebrow")}
      title={t("hero.title")}
      accent={t("hero.accent")}
      description={t("hero.description")}
      note={t("hero.reassurance")}
      actions={
        <>
          <CtaLink href={APP_LINKS.candidateRegister}>
            {t("hero.cta")}
            <ArrowRightIcon aria-hidden className="rtl:-scale-x-100" />
          </CtaLink>
          <OutlineLink to={pagePath("interview")}>
            {t("hero.guide")}
          </OutlineLink>
        </>
      }
      art={<HeroCard />}
    />
  )
}
