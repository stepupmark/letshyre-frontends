import { Trans, useTranslation } from "@workspace/i18n/react"
import { CheckIcon } from "lucide-react"

import { HIGHLIGHT } from "@/components/highlight"
import { PageHeader } from "@/components/section"

export function PricingHero() {
  const { t } = useTranslation("pricing")
  const items = t("hero.items", { returnObjects: true })

  return (
    <PageHeader
      eyebrow={t("hero.eyebrow")}
      title={<Trans t={t} i18nKey="hero.title" components={HIGHLIGHT} />}
      description={t("hero.body")}
    >
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
        <p className="text-sm font-medium">{t("hero.includes")}</p>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <CheckIcon aria-hidden className="size-4 shrink-0 text-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </PageHeader>
  )
}
