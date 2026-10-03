import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useId } from "react"

import { Container } from "@/components/section"

import { useMoney } from "../hooks/use-money"
import { usePlans } from "../hooks/use-plans"
import { isPricePending } from "../lib/price-status"
import { sharedRate } from "../lib/plans"
import { PlanCard } from "./plan-card"
import { PriceNotice } from "./price-notice"

export function PlanGrid() {
  const { t } = useTranslation("pricing")
  const titleId = useId()
  const money = useMoney()
  const { status, plans, retry, isRetrying } = usePlans()
  const pending = isPricePending(status)
  const rate = status === "ready" ? sharedRate(plans) : null

  return (
    <section aria-labelledby={titleId} className="pt-12 sm:pt-16">
      <Container className="flex flex-col gap-6">
        <h2 id={titleId} className="sr-only">
          {t("plans.heading")}
        </h2>
        <PriceNotice status={status} onRetry={retry} isRetrying={isRetrying} />
        <p role="status" className="sr-only">
          {pending ? t("prices.loading") : null}
        </p>
        <div
          aria-busy={pending || undefined}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} pending={pending} />
          ))}
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {rate !== null && (
            <p className="font-medium text-foreground">
              {t("plans.rate", { price: money(rate) })}
            </p>
          )}
          {pending && (
            <Skeleton className="my-[0.15lh] h-[0.7lh] w-72 max-w-full rounded-sm" />
          )}
          {status === "slow" && <p>{t("prices.slow")}</p>}
          <p>{t("plans.note")}</p>
        </div>
      </Container>
    </section>
  )
}
