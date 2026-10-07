import { Trans, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { HIGHLIGHT } from "@/components/highlight"
import { Section } from "@/components/section"

import { MissionVision } from "./mission-vision"

export function AboutIntro() {
  const { t } = useTranslation("about")
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId} className="py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-4">
          <h2
            id={headingId}
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            <Trans t={t} i18nKey="intro.title" components={HIGHLIGHT} />
          </h2>
          <p className="text-lg text-pretty text-muted-foreground">
            {t("intro.p1")}
          </p>
          <p className="text-pretty text-muted-foreground">{t("intro.p2")}</p>
        </div>
        <MissionVision />
      </div>
    </Section>
  )
}
