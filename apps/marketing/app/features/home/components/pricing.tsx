import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { useId } from "react"

import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"
import { CtaLink, TextLink } from "@/components/cta-links"
import { Container } from "@/components/section"

import { Photo } from "./photo"
import { Magnetic } from "./pointer-effects"

export function Pricing() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const titleId = useId()

  return (
    <section
      id="pricing"
      tabIndex={-1}
      aria-labelledby={titleId}
      className="scroll-mt-20 py-12 outline-none sm:py-20 lg:py-24"
    >
      <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
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
          <p className="mt-5 max-w-lg text-pretty text-muted-foreground sm:text-lg">
            {t("pricing.body")}
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-3xl border bg-card">
            <Photo
              name="home/unlock-podium"
              alt={t("pricing.photo")}
              sizes="(min-width: 64rem) 38rem, 100vw"
              className="aspect-video"
            />
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t px-5 py-4 text-sm font-medium">
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
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
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
