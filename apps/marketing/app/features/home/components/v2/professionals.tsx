import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"

import { APP_LINKS } from "@/lib/app-links"
import { Band } from "@/components/band"
import { CtaLink, TextLink } from "@/components/cta-links"
import { PAGES } from "@/lib/pages"

import { Heading } from "./heading"
import { InterviewScene } from "./scenes/interview-scene"
import { Points } from "./step"

export function Professionals() {
  const { t } = useTranslation("homeV2")
  const lang = useLocale()

  return (
    <Band id="professionals">
      <div className="slide-in grid overflow-hidden rounded-3xl border bg-card lg:grid-cols-2">
        <div className="flex flex-col justify-center p-6 sm:p-12">
          <Heading
            id="professionals-title"
            eyebrow={t("professionals.eyebrow")}
            title={t("professionals.title")}
            accent={t("professionals.accent")}
            description={t("professionals.body")}
          />
          <Points
            items={t("professionals.points", { returnObjects: true })}
            className="mt-8"
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
        <div className="flex items-center border-t bg-muted/50 p-6 sm:p-10 lg:border-s lg:border-t-0">
          <div className="reveal w-full">
            <InterviewScene />
          </div>
        </div>
      </div>
    </Band>
  )
}
