import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { useId } from "react"
import { Link } from "react-router"

import { Section, SectionHeader } from "@/components/section"

import { FaqAnswer } from "./faq-answer"

export function PricingFaq() {
  const { t } = useTranslation("pricing")
  const lang = useLocale()
  const titleId = useId()
  const items = t("faq.items", { returnObjects: true })

  return (
    <Section aria-labelledby={titleId}>
      <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
        <SectionHeader
          id={titleId}
          title={t("faq.title")}
          description={
            <>
              {t("faq.body")}{" "}
              <Link
                to={localePath(lang, "/contact")}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {t("faq.contact")}
              </Link>
            </>
          }
        />
        <Accordion className="border-t lg:col-span-2">
          {items.map((item) => (
            <AccordionItem key={item.q} className="border-b">
              <AccordionTrigger className="py-4 text-base hover:no-underline">
                {item.q}
              </AccordionTrigger>
              {/* keepMounted leaves every answer in the prerendered HTML */}
              <AccordionContent
                keepMounted
                className="max-w-prose pb-4 text-base text-pretty text-muted-foreground"
              >
                <FaqAnswer text={item.a} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}
