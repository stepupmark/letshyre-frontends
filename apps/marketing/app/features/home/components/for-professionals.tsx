import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { CalendarClockIcon, CheckIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"
import { BandHeading } from "@/components/band-heading"
import { CtaLink, TextLink } from "@/components/cta-links"
import { Band } from "@/components/band"

import { AttemptTracker } from "./art/attempt-tracker"

export function ForProfessionals() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const points = t("professionals.points", { returnObjects: true })

  return (
    <Band id="for-professionals">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="slide-in">
          <BandHeading
            id="for-professionals-title"
            eyebrow={t("professionals.eyebrow")}
            title={t("professionals.title")}
            accent={t("professionals.accent")}
            description={t("professionals.description")}
          />
          <ul className="mt-8 flex flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
                  <CheckIcon aria-hidden className="size-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-6 flex gap-3 rounded-xl border bg-muted/40 p-4 text-sm text-pretty text-muted-foreground">
            <CalendarClockIcon
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-brand-text"
            />
            {t("professionals.fresh")}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CtaLink href={APP_LINKS.candidateRegister}>
              {t("professionals.cta")}
            </CtaLink>
            <TextLink to={localePath(lang, "/download")}>
              {t("professionals.download")}
            </TextLink>
          </div>
        </div>

        <AttemptTracker className="lg:order-first" />
      </div>
    </Band>
  )
}
