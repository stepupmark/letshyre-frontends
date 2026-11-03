import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"
import { BandHeading } from "@/components/band-heading"
import { CtaLink, TextLink } from "@/components/cta-links"
import { Band } from "@/components/band"
import { PAGES } from "@/lib/pages"

export function Pricing() {
  const { t } = useTranslation("home")
  const lang = useLocale()

  return (
    <Band id="pricing" muted>
      <div className="slide-in flex flex-col items-center text-center">
        <BandHeading
          id="pricing-title"
          eyebrow={t("pricing.eyebrow")}
          title={t("pricing.title")}
          accent={t("pricing.accent")}
          description={t("pricing.description")}
          center
        />
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {t("pricing.facts", { returnObjects: true }).map((fact) => (
            <li key={fact} className="inline-flex items-center gap-1.5">
              <CheckIcon aria-hidden className="size-4 text-brand-text" />
              {fact}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.employerRegister}>
            {t("pricing.ctaStart")}
            <ArrowRightIcon aria-hidden />
          </CtaLink>
          <TextLink to={localePath(lang, PAGES.pricing.path)}>
            {t("pricing.cta")}
          </TextLink>
        </div>
      </div>
    </Band>
  )
}
