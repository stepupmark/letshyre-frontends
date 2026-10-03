import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

import { CheckIcon } from "./check-icon"

export function PricingHero() {
  const { t } = useTranslation("pricing")
  const items = t("hero.items", { returnObjects: true })

  return (
    <PageHeader
      eyebrow={t("hero.eyebrow")}
      title={t("hero.title")}
      description={t("hero.body")}
    >
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
        <p className="text-sm font-medium">{t("hero.includes")}</p>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <CheckIcon className="shrink-0 text-muted-foreground block-4 inline-4" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </PageHeader>
  )
}
