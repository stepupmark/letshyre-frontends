import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { CalendarClockIcon, CheckIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"
import { BandHeading } from "@/components/band-heading"
import { CtaLink, TextLink } from "@/components/cta-links"
import { Band } from "@/components/band"
import { PAGES } from "@/lib/pages"

import { ProductShot } from "./product-shot"
import { MY_SCORECARDS } from "./shots"

export function ForProfessionals() {
  const { t } = useTranslation(["home", "homeV2"])
  const lang = useLocale()

  return (
    <Band
      id="for-professionals"
      className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16"
    >
      <div className="slide-in">
        <BandHeading
          id="for-professionals-title"
          eyebrow={t("home:professionals.eyebrow")}
          title={t("home:professionals.title")}
          accent={t("home:professionals.accent")}
          description={t("home:professionals.description")}
        />
        <ul className="mt-8 flex flex-col gap-3">
          {t("home:professionals.points", { returnObjects: true }).map(
            (point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
                  <CheckIcon aria-hidden className="size-3" />
                </span>
                {point}
              </li>
            )
          )}
        </ul>
        <p className="mt-6 flex gap-3 text-sm text-pretty text-muted-foreground">
          <CalendarClockIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-brand-text"
          />
          {t("home:professionals.fresh")}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.candidateRegister}>
            {t("home:professionals.cta")}
          </CtaLink>
          <TextLink to={localePath(lang, PAGES.download.path)}>
            {t("home:professionals.download")}
          </TextLink>
        </div>
      </div>

      <ProductShot
        shot={MY_SCORECARDS}
        alt={t("homeV2:professionals.alt")}
        sizes="(min-width: 1024px) 600px, 100vw"
        className="reveal"
      />
    </Band>
  )
}
