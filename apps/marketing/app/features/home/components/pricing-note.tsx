import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"

import { HomeHeading } from "./home-heading"
import { CtaLink, TextLink } from "./home-links"
import { HomeSection } from "./home-section"

interface Row {
  label: string
  value: string
}

export function PricingNote() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const rows = t("pricing.rows", { returnObjects: true }) as Row[]

  return (
    <HomeSection
      id="pricing"
      muted
      className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-16"
    >
      <div className="reveal">
        <HomeHeading
          id="pricing-title"
          eyebrow={t("pricing.eyebrow")}
          title={t("pricing.title")}
          accent={t("pricing.accent")}
          description={t("pricing.description")}
        />
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.employerRegister}>
            {t("pricing.ctaStart")}
            <ArrowRightIcon aria-hidden />
          </CtaLink>
          <TextLink to={localePath(lang, "/pricing")}>
            {t("pricing.cta")}
          </TextLink>
        </div>
      </div>

      <div className="reveal relative mx-auto w-full max-w-sm pt-10 lg:me-0">
        <p
          aria-hidden
          className="font-script absolute inset-s-2 top-0 -rotate-3 text-3xl text-brand-text"
        >
          {t("pricing.note")}
        </p>

        <div className="drop-shadow-[0_18px_30px_rgb(0_0_0/0.08)] dark:drop-shadow-[0_18px_30px_rgb(0_0_0/0.55)]">
          <div className="receipt-edge bg-card px-6 pt-6 pb-14 sm:px-7 sm:pt-7">
            <h3 className="font-display border-b border-dashed pb-4 text-2xl">
              {t("pricing.receipt")}
            </h3>

            <dl className="mt-2">
              {rows.map((row) => (
                <div key={row.label} className="flex items-baseline gap-2 py-3">
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <span
                    aria-hidden
                    className="flex-1 -translate-y-1 border-b border-dotted border-foreground/20"
                  />
                  <dd className="font-semibold">{row.value}</dd>
                </div>
              ))}
              <div className="mt-3 flex items-baseline justify-between gap-4 border-t-2 border-double border-foreground/30 pt-4">
                <dt className="text-sm font-medium">
                  {t("pricing.total.label")}
                </dt>
                <dd className="font-display text-3xl text-brand-text">
                  {t("pricing.total.value")}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <p
          aria-hidden
          className="absolute inset-e-6 -bottom-3 rotate-[-8deg] rounded-md border-2 border-brand-text bg-card px-3 py-1 text-xs font-bold tracking-widest text-brand-text uppercase"
        >
          {t("pricing.stamp")}
        </p>
      </div>
    </HomeSection>
  )
}
