import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"

import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"
import { TextLink } from "@/components/cta-links"
import { usePublished } from "@/hooks/use-published"
import { PAGES } from "@/lib/pages"

interface Row {
  label: string
  value: string
}

export function PricingLine() {
  const { t } = useTranslation("employers")
  const lang = useLocale()
  const published = usePublished()
  const rows = t("pricing.rows", { returnObjects: true }) as Row[]

  return (
    <Band
      id="pricing"
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-center lg:gap-16"
    >
      <div className="slide-in flex flex-col items-start gap-6">
        <BandHeading
          id="pricing-title"
          title={t("pricing.title")}
          accent={t("pricing.accent")}
        />
        <div className="flex flex-wrap gap-x-6">
          <TextLink to={localePath(lang, PAGES.pricing.path)}>
            {t("pricing.cta")}
          </TextLink>
          {published("employerGuide") && (
            <TextLink to={localePath(lang, PAGES.employerGuide.path)}>
              {t("pricing.guide")}
            </TextLink>
          )}
        </div>
      </div>

      <dl className="reveal grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-2 bg-card p-6">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight text-brand-text">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </Band>
  )
}
