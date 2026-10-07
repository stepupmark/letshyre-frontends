import { Trans, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { Section } from "@/components/section"

import { Disclaimer } from "./disclaimer"

const STEPS = [
  { id: "live", body: "p1" },
  { id: "update", body: "p2" },
  { id: "removed", body: "p3" },
  { id: "again", body: "p4" },
] as const

export function ProfileDuration() {
  const { t } = useTranslation("about")
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId} className="border-t py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <h2
          id={headingId}
          className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          {t("profileDuration.title")}
        </h2>
        <ol className="flex flex-col gap-6 border-s-2 border-brand/30 ps-6">
          {STEPS.map(({ id, body }) => (
            <li key={id} className="relative flex flex-col gap-1">
              <span
                aria-hidden
                className="absolute inset-s-[-31px] top-1.5 size-3 rounded-full bg-brand ring-4 ring-background"
              />
              <p className="text-sm font-semibold text-primary">
                {t(`profileDuration.steps.${id}`)}
              </p>
              <p className="text-pretty text-muted-foreground">
                <Trans
                  t={t}
                  i18nKey={`profileDuration.${body}`}
                  components={{
                    b: <strong className="font-semibold text-foreground" />,
                  }}
                />
              </p>
            </li>
          ))}
        </ol>
      </div>
      <Disclaimer />
    </Section>
  )
}
