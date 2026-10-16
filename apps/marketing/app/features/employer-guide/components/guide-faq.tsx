import { Trans, useTranslation } from "@workspace/i18n/react"

import { GuideFaq as Faq } from "@/components/guide/guide-faq"

import { useGuideLinks } from "../hooks/use-guide-links"
import { FAQ_ANCHOR, FAQ_IDS } from "../lib/chapters"

export function GuideFaq() {
  const { t } = useTranslation("employerGuide")
  const links = useGuideLinks()

  return (
    <Faq
      anchor={FAQ_ANCHOR}
      title={t("faq.title")}
      items={FAQ_IDS.map((id) => ({
        id,
        question: t(`faq.items.${id}.q`),
        answer: (
          <Trans t={t} i18nKey={`faq.items.${id}.a`} components={links} />
        ),
      }))}
    />
  )
}
