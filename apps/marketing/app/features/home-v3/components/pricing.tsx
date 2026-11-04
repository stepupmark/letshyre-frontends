import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { useId } from "react"

import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"
import { CtaLink, TextLink } from "@/components/cta-links"
import { Container } from "@/components/section"

import { Magnetic } from "./pointer-effects"
import { PricingLedger } from "./pricing-ledger"

export function Pricing() {
  const { t } = useTranslation("homeV3")
  const lang = useLocale()
  const titleId = useId()

  return (
    <section
      id="pricing"
      tabIndex={-1}
      aria-labelledby={titleId}
      className="scroll-mt-20 py-16 outline-none sm:py-28"
    >
      <Container className="grid gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold text-brand-text">
            {t("pricing.eyebrow")}
          </p>
          <h2
            id={titleId}
            className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            {t("pricing.title")}{" "}
            <span className="block">{t("pricing.accent")}</span>
          </h2>
        </div>
        <div>
          <p className="max-w-lg text-lg text-pretty text-muted-foreground">
            {t("pricing.body")}
          </p>
          <PricingLedger />
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {t("pricing.points", { returnObjects: true }).map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CheckIcon
                  aria-hidden
                  className="size-4 shrink-0 text-success"
                />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Magnetic>
              <CtaLink href={APP_LINKS.employerRegister}>
                {t("pricing.cta")}
                <ArrowRightIcon aria-hidden className="rtl:-scale-x-100" />
              </CtaLink>
            </Magnetic>
            <TextLink to={localePath(lang, PAGES.pricing.path)}>
              {t("pricing.more")}
            </TextLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
