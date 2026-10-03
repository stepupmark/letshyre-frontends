import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { Section, SectionHeader } from "@/components/section"

const REASONS = [
  "aiPowered",
  "faster",
  "network",
  "payPerUnlock",
  "transparency",
] as const

export function WhyLetsHyre() {
  const { t } = useTranslation("about")
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId} className="border-t">
      <SectionHeader id={headingId} title={t("why.heading")} />
      <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map((id) => (
          <li key={id} className="flex flex-col gap-2 border-t pt-6">
            <h3 className="text-lg font-semibold">
              {t(`why.cards.${id}.title`)}
            </h3>
            <p className="text-pretty text-muted-foreground">
              {t(`why.cards.${id}.desc`)}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
