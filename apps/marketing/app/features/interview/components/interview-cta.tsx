import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"

import { CtaBand } from "@/components/cta-band"
import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

export function InterviewCta() {
  const { t } = useTranslation("interview")
  const lang = useLocale()

  return (
    <CtaBand
      title={t("cta.title")}
      description={t("cta.desc")}
      primary={{
        label: t("cta.button"),
        to: localePath(lang, PAGES.download.path),
      }}
      secondary={{
        label: t("cta.secondary"),
        href: APP_LINKS.candidateRegister,
      }}
    />
  )
}
