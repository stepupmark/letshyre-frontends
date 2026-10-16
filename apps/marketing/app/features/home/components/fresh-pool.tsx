import { useTranslation } from "@workspace/i18n/react"

import { type Side, SideBySide } from "./side-by-side"

/** The 90-day window a profile stays in the talent pool. */
export function FreshPool() {
  const { t } = useTranslation("home")
  const sides = [
    t("fresh.employer", { returnObjects: true }),
    t("fresh.candidate", { returnObjects: true }),
  ] as Side[]

  return (
    <div className="slide-in grid gap-10 rounded-2xl border bg-muted/40 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16">
      <div aria-hidden>
        <p className="flex items-baseline gap-2">
          <span className="text-7xl font-semibold tracking-tight text-brand-text tabular-nums sm:text-8xl">
            90
          </span>
          <span className="text-xl font-medium text-muted-foreground">
            {t("fresh.days")}
          </span>
        </p>
        <svg
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          className="mt-6 h-2 w-full rtl:-scale-x-100"
        >
          <rect width="100" height="4" rx="2" className="fill-border" />
          <rect width="100" height="4" rx="2" className="grow-in fill-brand" />
        </svg>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{t("fresh.start")}</span>
          <span>{t("fresh.end")}</span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-brand-text">
          {t("fresh.eyebrow")}
        </p>
        <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {t("fresh.title")}{" "}
          <span className="text-brand-text">{t("fresh.accent")}</span>
        </h3>
        <SideBySide sides={sides} className="mt-8" />
      </div>
    </div>
  )
}
