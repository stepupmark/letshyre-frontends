import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { useId } from "react"

import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"
import { CtaLink, TextLink } from "@/components/cta-links"
import { Container } from "@/components/section"

import { Magnetic } from "./pointer-effects"

export function Pricing() {
  const { t } = useTranslation("homeV3")
  const lang = useLocale()
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="py-16 sm:py-28">
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
            <span className="block text-brand-text">{t("pricing.accent")}</span>
          </h2>
        </div>
        <div>
          <p className="max-w-lg text-lg text-pretty text-muted-foreground">
            {t("pricing.body")}
          </p>
          <ul className="mt-8 divide-y border-y">
            {t("pricing.points", { returnObjects: true }).map((point) => (
              <li
                key={point}
                className="flex items-center gap-4 py-5 text-xl font-medium sm:text-2xl"
              >
                <CheckIcon
                  aria-hidden
                  className="size-5 shrink-0 text-success"
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
