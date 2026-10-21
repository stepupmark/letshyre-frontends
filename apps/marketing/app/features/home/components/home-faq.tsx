import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"

import { BandHeading } from "@/components/band-heading"
import { TextLink } from "@/components/cta-links"
import { Band } from "@/components/band"
import { type FaqItem, FaqList } from "@/components/faq-list"

export function HomeFaq() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const items = t("faq.items", { returnObjects: true }) as FaqItem[]

  return (
    <Band id="faq" className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
      <div className="contents lg:sticky lg:top-28 lg:flex lg:flex-col lg:gap-10 lg:self-start">
        <BandHeading
          className="slide-in"
          id="faq-title"
          title={t("faq.title")}
          accent={t("faq.accent")}
          description={t("faq.description")}
        />

        <div className="slide-in max-w-sm rounded-2xl border bg-muted/40 p-6 max-lg:order-last">
          <p className="text-lg font-semibold">{t("faq.contact.title")}</p>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">
            {t("faq.contact.body")}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4">
            <TextLink to={localePath(lang, "/contact")}>
              {t("faq.contact.cta")}
            </TextLink>
            <p className="text-xs text-muted-foreground">
              {t("faq.contact.note")}
            </p>
          </div>
        </div>
      </div>

      <FaqList items={items} />
    </Band>
  )
}
