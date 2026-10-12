import { Trans, useTranslation } from "@workspace/i18n/react"
import { EyeIcon, TargetIcon } from "lucide-react"
import { useId } from "react"

import { HIGHLIGHT } from "@/components/highlight"
import { Section } from "@/components/section"

const STATEMENTS = [
  { key: "mission", icon: TargetIcon },
  { key: "vision", icon: EyeIcon },
] as const

export function AboutIntro() {
  const { t } = useTranslation("about")
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId} className="py-14 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2
            id={headingId}
            className="text-3xl/[1.15] font-semibold tracking-tight text-balance sm:text-4xl/[1.1]"
          >
            <Trans t={t} i18nKey="intro.title" components={HIGHLIGHT} />
          </h2>
          <p className="max-w-prose text-lg/7 text-pretty text-muted-foreground">
            {t("intro.p1")}
          </p>
          <p className="max-w-prose text-pretty text-muted-foreground">
            {t("intro.p2")}
          </p>
        </div>
        <div className="flex flex-col gap-10 lg:pt-2">
          {STATEMENTS.map(({ key, icon: Icon }) => (
            <section
              key={key}
              aria-labelledby={`${headingId}-${key}`}
              className="flex flex-col gap-3"
            >
              <h3
                id={`${headingId}-${key}`}
                className="flex items-center gap-2 text-sm font-semibold text-brand-text"
              >
                <Icon aria-hidden className="size-4" />
                {t(`${key}.title`)}
              </h3>
              <p className="text-xl/7 font-medium tracking-tight text-pretty">
                {t(`${key}.desc`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </Section>
  )
}
