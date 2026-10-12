import { Trans, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { useGuideLinks } from "../hooks/use-guide-links"
import { PRIVACY_ANCHOR } from "../lib/sections"
import { RecordArt } from "./art/record-art"

export function InterviewPrivacy() {
  const { t } = useTranslation("interview")
  const titleId = useId()
  const links = useGuideLinks()

  return (
    <section
      id={PRIVACY_ANCHOR}
      aria-labelledby={titleId}
      className="flex scroll-mt-24 flex-col gap-5 rounded-2xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6"
    >
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="text-xl font-semibold tracking-tight">
          {t("privacy.title")}
        </h2>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          <Trans t={t} i18nKey="privacy.body" components={links} />
        </p>
      </div>
      <div className="shrink-0 sm:ms-auto">
        <RecordArt />
      </div>
    </section>
  )
}
