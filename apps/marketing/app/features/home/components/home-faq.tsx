import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { PlusIcon } from "lucide-react"

import { twoDigit } from "../lib/format"
import { HomeHeading } from "./home-heading"
import { TextLink } from "./home-links"
import { HomeSection } from "./home-section"

interface Item {
  q: string
  a: string
}

export function HomeFaq() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const items = t("faq.items", { returnObjects: true }) as Item[]

  return (
    <HomeSection
      id="faq"
      className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20"
    >
      <div className="contents lg:sticky lg:top-28 lg:flex lg:flex-col lg:gap-10 lg:self-start">
        <HomeHeading
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

      <ol className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={item.q}>
            <details className="group rounded-2xl border border-transparent transition-colors open:border-border open:bg-card hover:bg-muted/40 open:hover:bg-card">
              <summary className="flex cursor-pointer list-none items-center gap-5 rounded-2xl p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden
                  className="w-6 shrink-0 text-sm font-semibold text-muted-foreground tabular-nums group-open:text-brand-text"
                >
                  {twoDigit(index + 1)}
                </span>
                <span className="flex-1 font-medium text-pretty">{item.q}</span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
                  <PlusIcon
                    aria-hidden
                    className="size-4 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  />
                </span>
              </summary>
              <p className="rise ps-16 pe-14 pb-6 text-pretty text-muted-foreground">
                {item.a}
              </p>
            </details>
          </li>
        ))}
      </ol>
    </HomeSection>
  )
}
