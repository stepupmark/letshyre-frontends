import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { UseQueryResult } from "@tanstack/react-query"
import { ArrowRight, RotateCw } from "lucide-react"
import { useId } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { StatusBadge } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"

import { LOW_CREDITS } from "../lib/employer-dashboard"
import { Meter } from "./meter"

export function CreditsCard({
  credits,
  usedPercent,
}: {
  credits: UseQueryResult<{ available_credits: number }>
  usedPercent: number | null | undefined
}) {
  const { t } = useTranslation(["dashboard", "common"])
  const locale = useLocale()
  const id = useId()
  const available = credits.data?.available_credits

  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-5 rounded-lg border bg-card p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-sm text-muted-foreground">
          {t("credits.heading")}
        </h2>
        {available !== undefined ? (
          <p className="flex items-center gap-2">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              <AnimatedNumber value={available} locale={locale} from={0} />
            </span>
            {available <= LOW_CREDITS && (
              <StatusBadge tone="warning">{t("credits.low")}</StatusBadge>
            )}
          </p>
        ) : credits.isError ? (
          <p
            role="alert"
            className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground"
          >
            {t("credits.error")}
            <Button
              variant="outline"
              size="sm"
              disabled={credits.isFetching}
              onClick={() => void credits.refetch()}
            >
              <RotateCw />
              {t("common:state.retry")}
            </Button>
          </p>
        ) : (
          <Skeleton className="my-1 h-8 w-16" />
        )}
      </div>

      <p className="text-sm text-pretty text-muted-foreground">
        {t("credits.explain")}
      </p>

      {usedPercent != null && (
        <div className="flex flex-col gap-2">
          <p className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
            {t("credits.usedLabel")}
            <span className="font-medium text-foreground tabular-nums">
              {Math.round(Math.min(100, Math.max(0, usedPercent)))}%
            </span>
          </p>
          <Meter
            value={usedPercent}
            label={t("credits.used", { percent: Math.round(usedPercent) })}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <AppLink to={href("/employer/billing")} className={buttonLink()}>
          {t("credits.add")}
        </AppLink>
        <AppLink
          to={href("/employer/invoices")}
          className="group flex items-center gap-1 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t("credits.invoices")}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
          />
        </AppLink>
      </div>
    </section>
  )
}
