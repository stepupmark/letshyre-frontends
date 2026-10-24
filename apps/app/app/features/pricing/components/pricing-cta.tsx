import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"

import { salesContactUrl } from "../lib/checkout-url"
import { Section, SectionHeader } from "./section"

export function PricingCta() {
  const { t } = useTranslation("pricing")
  const locale = useLocale()
  const titleId = useId()

  return (
    <Section
      aria-labelledby={titleId}
      className="border-t bg-muted/40 py-12 sm:py-16"
    >
      <div className="flex flex-col items-start gap-6">
        <SectionHeader
          id={titleId}
          title={t("cta.title")}
          description={t("cta.body")}
        />
        <div className="flex flex-wrap gap-3">
          <AppLink
            to={href("/employer/register")}
            className={buttonLink({ size: "lg", className: "h-10 px-4" })}
          >
            {t("cta.primary")}
          </AppLink>
          <AppLink
            to={salesContactUrl(locale)}
            className={buttonLink({
              variant: "outline",
              size: "lg",
              className: "h-10 px-4",
            })}
          >
            {t("cta.secondary")}
          </AppLink>
        </div>
      </div>
    </Section>
  )
}
