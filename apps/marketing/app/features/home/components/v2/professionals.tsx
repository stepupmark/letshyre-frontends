import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"

import { APP_LINKS } from "@/lib/app-links"
import { Band } from "@/components/band"
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
      muted
      className="grid items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20"
    >
      <div className="slide-in">
        <p className="text-sm font-medium text-brand-text">
          {t("professionals.eyebrow")}
        </p>
        <h2
          id="professionals-title"
          className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
        >
          {t("professionals.title")}{" "}
          <span className="block text-muted-foreground">
            {t("professionals.accent")}
          </span>
        </h2>
        <p className="mt-6 max-w-lg text-lg text-pretty text-muted-foreground">
          {t("professionals.body")}
        </p>
        <Points
          items={t("professionals.points", { returnObjects: true })}
          className="mt-8 text-base"
        />
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.candidateRegister}>
            {t("professionals.cta")}
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
