import { useFormat, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { Section, SectionHeader } from "@/components/section"

import { plainText } from "../lib/plain-text"

const STEPS = ["post", "screen", "scorecards"] as const

export function HowItWorks() {
  const { t } = useTranslation("home")
  const titleId = useId()
  const format = useFormat()

  return (
    <Section
      id="how-it-works"
      aria-labelledby={titleId}
      className="scroll-mt-16"
    >
      <SectionHeader
        id={titleId}
        title={t("assistance.ariaLabel")}
        description={t("assistance.intro")}
      />
      <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, index) => (
          <li key={step} className="flex flex-col gap-3 border-t pt-6">
            <span
              aria-hidden
              className="text-sm font-medium text-muted-foreground tabular-nums"
            >
              {format.number(index + 1, { minimumIntegerDigits: 2 })}
            </span>
            <p className="text-sm font-medium">
              {t(`assistance.steps.${step}.pill`)}
            </p>
            <h3 className="text-lg font-semibold text-balance">
              {plainText(t(`assistance.steps.${step}.heading`))}
            </h3>
            <p className="text-pretty text-muted-foreground">
              {t(`assistance.steps.${step}.description`)}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
