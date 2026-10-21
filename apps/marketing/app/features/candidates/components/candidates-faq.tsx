import { useTranslation } from "@workspace/i18n/react"

import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"
import { type FaqItem, FaqList } from "@/components/faq-list"

export function CandidatesFaq() {
  const { t } = useTranslation("candidates")
  const items = t("faq.items", { returnObjects: true }) as FaqItem[]

  return (
    <Band id="faq" className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
      <BandHeading
        id="faq-title"
        className="slide-in lg:sticky lg:top-28 lg:self-start"
        title={t("faq.title")}
        accent={t("faq.accent")}
      />
      <FaqList items={items} />
    </Band>
  )
}
