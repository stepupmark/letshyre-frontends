import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useId } from "react"
import { Link } from "react-router"

import { Section, SectionHeader } from "@/components/section"

import { CheckIcon } from "./icons"

export function PricingTeaser() {
  const { t } = useTranslation("home")
  const titleId = useId()
  const lang = useLocale()
  const points = t("pricingTeaser.points", { returnObjects: true })

  return (
    <Section aria-labelledby={titleId}>
      <div className="flex flex-col gap-8 rounded-xl border p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-6">
          <SectionHeader
            id={titleId}
            eyebrow={t("pricingTeaser.eyebrow")}
            title={t("pricingTeaser.title")}
            description={t("pricingTeaser.body")}
          />
          <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm">
                <CheckIcon className="shrink-0 text-muted-foreground block-4 inline-4" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to={localePath(lang, "/pricing")}
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-10 self-start px-4 lg:self-end",
            })
          )}
        >
          {t("pricingTeaser.cta")}
        </Link>
      </div>
    </Section>
  )
}
