import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRightIcon } from "lucide-react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { HomeHeading } from "./home-heading"

interface Row {
  label: string
  value: string
}

export function PricingNote() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const rows = t("pricing.rows", { returnObjects: true }) as Row[]

  return (
    <section
      aria-labelledby="pricing-title"
      className="overflow-x-clip bg-muted/40 py-14 sm:py-20"
    >
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="reveal">
          <HomeHeading
            id="pricing-title"
            eyebrow={t("pricing.eyebrow")}
            title={t("pricing.title")}
            accent={t("pricing.accent")}
            description={t("pricing.description")}
          />
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={APP_LINKS.employerRegister}
              className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}
            >
              {t("pricing.ctaStart")}
              <ArrowRightIcon aria-hidden />
            </a>
            <Link
              to={localePath(lang, "/pricing")}
              prefetch="intent"
              className="rounded-md text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {t("pricing.cta")}
            </Link>
          </div>
        </div>

        <div className="reveal relative mx-auto w-full max-w-sm">
          <div className="drop-shadow-[0_18px_30px_rgb(0_0_0/0.08)] dark:drop-shadow-[0_18px_30px_rgb(0_0_0/0.55)]">
            <div className="receipt-edge bg-card px-7 pt-7 pb-10">
              <h3 className="font-display border-b border-dashed pb-4 text-2xl">
                {t("pricing.receipt")}
              </h3>

              <dl className="mt-2">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline gap-2 py-3"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {row.label}
                    </dt>
                    <span
                      aria-hidden
                      className="flex-1 -translate-y-1 border-b border-dotted border-foreground/20"
                    />
                    <dd className="font-semibold">{row.value}</dd>
                  </div>
                ))}
                <div className="mt-3 flex items-baseline justify-between gap-4 border-t-2 border-double border-foreground/30 pt-4">
                  <dt className="text-sm font-medium">
                    {t("pricing.total.label")}
                  </dt>
                  <dd className="font-display text-3xl text-brand-text">
                    {t("pricing.total.value")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <p
            aria-hidden
            className="absolute -inset-e-4 bottom-24 rotate-[-14deg] rounded-md border-2 border-brand-text px-3 py-1 text-xs font-bold tracking-widest text-brand-text uppercase sm:-inset-e-10"
          >
            {t("pricing.stamp")}
          </p>
          <p
            aria-hidden
            className="font-script absolute -inset-s-6 top-14 -rotate-6 text-3xl text-brand-text max-sm:hidden lg:-inset-s-28"
          >
            {t("pricing.note")}
          </p>
        </div>
      </Container>
    </section>
  )
}
