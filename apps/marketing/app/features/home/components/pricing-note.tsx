import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { lazy, Suspense } from "react"

import { APP_LINKS } from "@/lib/app-links"

import { BandHeading } from "@/components/band-heading"
import { CtaLink, TextLink } from "@/components/cta-links"
import { Band } from "@/components/band"
import { useHydrated } from "@/hooks/use-hydrated"

// decorative, so it loads after hydration; a prerendered Suspense needs inline scripts the CSP blocks
const CreditUnlock = lazy(() => import("./art/credit-unlock"))

export function PricingNote() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const hydrated = useHydrated()
  const facts = t("pricing.facts", { returnObjects: true })

  return (
    <Band
      id="pricing"
      muted
      className="grid gap-12 md:grid-cols-2 md:items-center lg:gap-20"
    >
      <div className="slide-in">
        <BandHeading
          id="pricing-title"
          eyebrow={t("pricing.eyebrow")}
          title={t("pricing.title")}
          accent={t("pricing.accent")}
          description={t("pricing.description")}
        />
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.employerRegister}>
            {t("pricing.ctaStart")}
            <ArrowRightIcon aria-hidden />
          </CtaLink>
          <TextLink to={localePath(lang, "/pricing")}>
            {t("pricing.cta")}
          </TextLink>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {facts.map((fact) => (
            <li key={fact} className="inline-flex items-center gap-1.5">
              <CheckIcon aria-hidden className="size-4 text-brand-text" />
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <div className="reveal mx-auto w-full max-w-md lg:me-0">
        <div className="min-h-71 sm:min-h-65">
          {hydrated && (
            <Suspense>
              <CreditUnlock />
            </Suspense>
          )}
        </div>
      </div>
    </Band>
  )
}
