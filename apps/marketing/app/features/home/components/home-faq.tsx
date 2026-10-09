import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router"

import { Container } from "@/components/section"

import { HomeHeading } from "./home-heading"

interface Item {
  q: string
  a: string
}

export function HomeFaq() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const items = t("faq.items", { returnObjects: true }) as Item[]

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-20 py-14 sm:py-20"
    >
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div className="reveal flex flex-col gap-10 lg:sticky lg:top-28 lg:self-start">
          <HomeHeading
            id="faq-title"
            title={t("faq.title")}
            accent={t("faq.accent")}
            description={t("faq.description")}
          />

          <div className="relative max-w-sm rounded-2xl border bg-muted/40 p-6">
            <p className="font-display text-2xl">{t("faq.contact.title")}</p>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              {t("faq.contact.body")}
            </p>
            <Link
              to={localePath(lang, "/contact")}
              prefetch="intent"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-brand-text outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {t("faq.contact.cta")}
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
            <p
              aria-hidden
              className="font-script absolute -inset-e-2 -bottom-5 -rotate-6 text-3xl text-brand-text"
            >
              {t("faq.contact.note")}
            </p>
          </div>
        </div>

        <ol className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={item.q}>
              <details className="group rounded-2xl border border-transparent transition-colors open:border-border open:bg-card hover:bg-muted/40 open:hover:bg-card">
                <summary className="flex cursor-pointer list-none items-center gap-5 rounded-2xl p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden
                    className="font-display w-7 shrink-0 text-xl text-muted-foreground tabular-nums group-open:text-brand-text"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-medium text-pretty">
                    {item.q}
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
                    <PlusIcon
                      aria-hidden
                      className="size-4 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    />
                  </span>
                </summary>
                <p className="ps-17 pe-14 pb-6 text-pretty text-muted-foreground">
                  {item.a}
                </p>
              </details>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
