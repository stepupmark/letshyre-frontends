import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useId } from "react"
import { Link } from "react-router"

import { Section, SectionHeader } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { salesContactPath } from "../lib/checkout-url"

export function PricingCta() {
  const { t } = useTranslation("pricing")
  const lang = useLocale()
  const titleId = useId()

  return (
    <Section aria-labelledby={titleId} className="border-t bg-muted/40">
      <div className="flex flex-col items-start gap-8">
        <SectionHeader
          id={titleId}
          title={t("cta.title")}
          description={t("cta.body")}
        />
        <div className="flex flex-wrap gap-3">
          <a
            href={APP_LINKS.employerRegister}
            className={cn(
              buttonVariants({ size: "lg", className: "h-10 px-4" })
            )}
          >
            {t("cta.primary")}
          </a>
          <Link
            to={salesContactPath(lang)}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-10 px-4",
              })
            )}
          >
            {t("cta.secondary")}
          </Link>
        </div>
      </div>
    </Section>
  )
}
