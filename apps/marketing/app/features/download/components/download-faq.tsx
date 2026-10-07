import { useTranslation } from "@workspace/i18n/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { useId } from "react"

export function DownloadFaq() {
  const { t } = useTranslation("download")
  const titleId = useId()
  const items = t("faq.items", { returnObjects: true })

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <h2
        id={titleId}
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {t("faq.title")}
      </h2>
      <Accordion className="border-t">
        {items.map((item) => (
          <AccordionItem key={item.q} className="border-b">
            <AccordionTrigger className="py-4 text-base hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent
              keepMounted
              className="max-w-prose pb-4 text-base text-pretty text-muted-foreground"
            >
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
