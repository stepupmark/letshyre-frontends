import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { Section } from "@/components/section"

import { plainText } from "../lib/plain-text"

export function AboutIntro() {
  const { t } = useTranslation("about")
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId}>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <h2
          id={headingId}
          className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          {plainText(t("intro.title"))}
        </h2>
        <div className="flex flex-col gap-4 text-lg text-pretty text-muted-foreground">
          <p>{t("intro.p1")}</p>
          <p>{t("intro.p2")}</p>
        </div>
      </div>
    </Section>
  )
}
