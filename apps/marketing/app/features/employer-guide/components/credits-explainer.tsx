import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { Link } from "react-router"

import { PAGES } from "@/lib/pages"

interface Row {
  label: string
  value: string
}

export function CreditsExplainer() {
  const { t } = useTranslation("employerGuide")
  const lang = useLocale()
  const rows = t("credits.rows", { returnObjects: true }) as Row[]
  const points = t("credits.points", { returnObjects: true })

  return (
    <div className="mt-10 grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-balance text-brand-text">
          {t("credits.title")}
        </h3>
        <p className="text-sm text-pretty text-muted-foreground">
          {t("credits.lead")}
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm">
              <CheckIcon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-brand-text"
              />
              {point}
            </li>
          ))}
        </ul>
        <Link
          to={localePath(lang, PAGES.pricing.path)}
          prefetch="intent"
          className="more-link group/link mt-3 inline-flex w-fit items-center gap-1.5 text-sm"
        >
          {t("credits.link")}
          <ArrowRightIcon
            aria-hidden
            className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100"
          />
        </Link>
      </div>

      <figure className="reveal receipt-edge rounded-t-xl border-x border-t bg-card p-5 pb-8">
        <figcaption className="text-sm font-medium">
          {t("credits.ledger")}
        </figcaption>
        <dl className="mt-3 flex flex-col text-sm">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 border-b border-dashed py-2"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium tabular-nums">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 pt-3">
            <dt className="font-semibold">{t("credits.balance")}</dt>
            <dd className="text-2xl font-semibold text-brand-text tabular-nums">
              {t("credits.balanceValue")}
            </dd>
          </div>
        </dl>
      </figure>
    </div>
  )
}
