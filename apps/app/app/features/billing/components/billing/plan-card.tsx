import type { Plan } from "@workspace/api/public"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Check } from "lucide-react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import { formatRupees, savingsVs } from "../../lib/money"

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
  const features = [
    t("plans.credits", { count: plan.credits }),
    t("plans.unlocks"),
    t("plans.noExpiry"),
    t("plans.topUps"),
  ]

  return (
    <m.article
      initial={enter ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease, delay: index * 0.05 }}
      data-highlight={plan.highlight}
      className="flex flex-col gap-5 rounded-lg border bg-card p-6 data-[highlight=true]:border-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
          {plan.tagline && (
            <p className="text-sm text-pretty text-muted-foreground">
              {plan.tagline}
            </p>
          )}
        </div>
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
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">
            {formatRupees(locale, plan.basePrice, true)}
          </span>
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
      <ul className="flex flex-1 flex-col gap-2 border-t pt-5 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant={plan.highlight ? "default" : "outline"}
        size="lg"
        onClick={onBuy}
      >
        {t("plans.buy", { name: plan.name })}
      </Button>
    </m.article>
  )
}

export function PlanSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-lg border p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="flex flex-col gap-2.5 border-t pt-5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4 w-3/4" />
        ))}
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  )
}
