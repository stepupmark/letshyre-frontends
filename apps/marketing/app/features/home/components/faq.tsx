import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { TextLink } from "@/components/cta-links"
import { type FaqItem, FaqList } from "@/components/faq-list"
import { PAGES } from "@/lib/pages"
import { Container } from "@/components/section"

export function Faq() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const titleId = useId()
  const items = t("faq.items", { returnObjects: true }) as FaqItem[]

  return (
    <section aria-labelledby={titleId} className="border-t py-16 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-5 lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:col-span-2 lg:self-start">
          <h2
            id={titleId}
            className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            {t("faq.title")} <span className="block">{t("faq.accent")}</span>
          </h2>
          <p className="mt-4 max-w-sm text-pretty text-muted-foreground">
            {t("faq.description")}
          </p>
          <p className="mt-8 text-sm text-muted-foreground">
            {t("faq.contact.title")}{" "}
            <TextLink to={localePath(lang, PAGES.contact.path)}>
              {t("faq.contact.cta")}
            </TextLink>
          </p>
        </div>
        <div className="lg:col-span-3">
          <FaqList items={items} />
        </div>
      </Container>
    </section>
  )
}
