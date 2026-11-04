import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"
import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"
import { CtaLink, TextLink } from "@/components/cta-links"
import { PAGES } from "@/lib/pages"

import { Points } from "./points"
import { InterviewScene } from "./scenes/interview-scene"

export function Professionals() {
  const { t } = useTranslation("homeV2")
  const lang = useLocale()

  return (
    <Band
      id="professionals"
      tinted
      className="grid items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20"
    >
      <div className="slide-in">
        <BandHeading
          id="professionals-title"
          eyebrow={t("professionals.eyebrow")}
          title={t("professionals.title")}
          accent={t("professionals.accent")}
          description={t("professionals.body")}
          stacked
          className="max-w-xl"
        />
        <Points
          items={t("professionals.points", { returnObjects: true })}
          className="mt-8 text-base"
        />
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.candidateRegister}>
            {t("professionals.cta")}
            <ArrowRightIcon aria-hidden className="rtl:-scale-x-100" />
          </CtaLink>
          <TextLink to={localePath(lang, PAGES.download.path)}>
            {t("professionals.download")}
          </TextLink>
        </div>
      </div>
      <div className="reveal">
        <InterviewScene />
      </div>
    </Band>
  )
}
