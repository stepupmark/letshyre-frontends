import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { buttonVariants } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { ArrowRightIcon, MessagesSquareIcon } from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { Section, SectionHeader } from "@/components/section"
import { PAGES } from "@/lib/pages"

import { FaqAnswer } from "./faq-answer"

export function PricingFaq() {
  const { t } = useTranslation("pricing")
  const lang = useLocale()
  const titleId = useId()
  const items = t("faq.items", { returnObjects: true })

  return (
    <Section aria-labelledby={titleId} className="border-t py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <SectionHeader
            id={titleId}
            title={<span className="text-brand">{t("faq.title")}</span>}
          />
          <Card className="gap-4 p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <MessagesSquareIcon aria-hidden className="size-5" />
            </span>
            <p className="font-medium">{t("faq.body")}</p>
            <Link
              to={localePath(lang, PAGES.contact.path)}
              className={buttonVariants({
                variant: "outline",
                className: "h-9 w-fit",
              })}
            >
              {t("faq.contact")}
              <ArrowRightIcon aria-hidden className="rtl:rotate-180" />
            </Link>
          </Card>
        </div>

        <Accordion className="gap-3 lg:col-span-2">
          {items.map((item) => (
            <AccordionItem
              key={item.q}
              className="rounded-xl border bg-card px-5 transition-colors hover:border-brand/40 data-open:border-brand/40 data-open:bg-brand/5"
            >
              <AccordionTrigger className="py-4 text-base hover:no-underline">
                {item.q}
              </AccordionTrigger>
              {/* keepMounted leaves every answer in the prerendered HTML */}
              <AccordionContent
                keepMounted
                className="max-w-prose pb-5 text-base text-pretty text-muted-foreground"
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
