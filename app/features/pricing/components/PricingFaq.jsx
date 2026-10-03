import { Link } from "react-router";
import { Trans, useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { localePath } from "@/i18n/config";
import { useLocale } from "@/i18n/hooks";

export function PricingFaq() {
  const { t } = useTranslation("pricing");
  const lang = useLocale();
  const items = t("faq.items", { returnObjects: true });

  return (
    <section
      aria-labelledby="faq-title"
      className="mx-auto w-full max-w-content px-4 pt-20 sm:px-6 md:pt-28 lg:px-8 3xl:max-w-wide 3xl:pt-36"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div>
          <h2 id="faq-title" className="text-fluid-xl leading-tight font-bold tracking-tight text-text-main">
            {t("faq.title")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            {t("faq.body")}{" "}
            <Link
              to={localePath(lang, "/contact")}
              className="font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              {t("faq.contact")}
            </Link>
          </p>
        </div>

        {/* forceMount keeps every answer in the prerendered HTML for crawlers; CSS hides the closed ones. */}
        <Accordion type="single" collapsible className="border-t border-border">
          {items.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`} className="border-border">
              <AccordionTrigger className="py-5 text-base font-semibold text-text-main hover:no-underline 3xl:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent
                forceMount
                className="max-w-prose pb-5 text-base leading-relaxed text-text-muted [[data-state=closed]_&]:hidden"
              >
                <Trans
                  t={t}
                  i18nKey={`faq.items.${index}.a`}
                  components={{
                    refund: (
                      <Link
                        to={localePath(lang, "/refund-policy")}
                        className="font-semibold text-brand-600 underline underline-offset-4"
                      />
                    ),
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
