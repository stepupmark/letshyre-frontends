import type { Plan } from "@workspace/api/public"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ArrowRight } from "lucide-react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import { formatRupees, savingsVs } from "../../lib/money"
import { Price } from "./price"

export function PlanCard({
  plan,
  topUpRate,
  enter,
  index,
  onBuy,
}: {
  plan: Plan
  topUpRate: number | undefined
  enter: boolean
  index: number
  onBuy: () => void
}) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const save =
    plan.rate && topUpRate !== undefined ? savingsVs(plan.rate, topUpRate) : 0

  return (
    <m.article
      initial={enter ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease, delay: index * 0.04 }}
      data-highlight={plan.highlight}
      className="flex flex-col gap-6 rounded-lg border bg-card p-6 transition-colors duration-200 hover:border-brand/50 data-[highlight=true]:border-brand data-[highlight=true]:ring-1 data-[highlight=true]:ring-brand motion-reduce:transition-none"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
          {plan.highlight && (
            <m.span
              initial={enter ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: duration.base, ease, delay: 0.2 }}
            >
              <Badge>{t("plans.popular")}</Badge>
            </m.span>
          )}
        </div>
        {plan.tagline && (
          <p className="text-sm text-pretty text-muted-foreground">
            {plan.tagline}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-brand-text tabular-nums">
          {t("plans.credits", { count: plan.credits })}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Price value={plan.basePrice} />
          <span className="text-sm text-muted-foreground">
            {t("plans.once")}
          </span>
        </p>
        {plan.rate && (
          <p className="text-sm text-muted-foreground tabular-nums">
            {t("plans.rate", { rate: formatRupees(locale, plan.rate, true) })}
            {save > 0 && (
              <span className="font-medium text-success">
                {" · "}
                {t("plans.save", { percent: save })}
              </span>
            )}
          </p>
        )}
      </div>

      <Button
        variant={plan.highlight ? "default" : "outline"}
        size="lg"
        className="group/buy mt-auto w-full"
        onClick={onBuy}
      >
        {t("plans.buy", { name: plan.name })}
        <ArrowRight className="transition-transform duration-200 group-hover/buy:translate-x-0.5 group-focus-visible/buy:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/buy:-translate-x-0.5 rtl:group-focus-visible/buy:-translate-x-0.5" />
      </Button>
    </m.article>
  )
}

export function PlanSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-lg border p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
