import { Trans, useTranslation } from "@workspace/i18n/react"
import { LockKeyholeIcon } from "lucide-react"
import { useId } from "react"

import { useGuideLinks } from "../hooks/use-guide-links"
import { PRIVACY_ANCHOR } from "../lib/sections"

export function InterviewPrivacy() {
  const { t } = useTranslation("interview")
  const titleId = useId()
  const links = useGuideLinks()

  return (
    <section
      id={PRIVACY_ANCHOR}
      aria-labelledby={titleId}
      className="flex scroll-mt-24 flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:p-6"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <LockKeyholeIcon aria-hidden className="size-5" />
      </span>
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="text-xl font-semibold tracking-tight">
          {t("privacy.title")}
        </h2>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          <Trans t={t} i18nKey="privacy.body" components={links} />
        </p>
      </div>
    </section>
  )
}
