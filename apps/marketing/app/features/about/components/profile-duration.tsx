import { Trans, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { Section } from "@/components/section"

export function ProfileDuration() {
  const { t } = useTranslation("about")
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId} className="border-t">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <h2
          id={headingId}
          className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          {t("profileDuration.title")}
        </h2>
        <div className="flex flex-col gap-4 text-pretty text-muted-foreground">
          <p className="text-lg">
            <Trans
              t={t}
              i18nKey="profileDuration.p1"
              components={{
                b: <strong className="font-semibold text-foreground" />,
              }}
            />
          </p>
          <p>{t("profileDuration.p2")}</p>
          <p>{t("profileDuration.p3")}</p>
          <p>{t("profileDuration.p4")}</p>
        </div>
      </div>
    </Section>
  )
}
