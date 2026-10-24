import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  InfinityIcon,
  ReceiptIcon,
  RefreshCwOffIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { useId } from "react"

import { useMoney } from "../hooks/use-money"
import { usePlans } from "../hooks/use-plans"
import { sharedRate } from "../lib/plans"
import { isPricePending } from "../lib/price-status"
import { PlanCard } from "./plan-card"
import { PriceNotice } from "./price-notice"
import { Container } from "./section"

const TRUST = [
  { id: "oneTime", icon: ReceiptIcon },
  { id: "noRenewal", icon: RefreshCwOffIcon },
  { id: "noExpiry", icon: InfinityIcon },
  { id: "razorpay", icon: ShieldCheckIcon },
] as const

export function PlanGrid() {
  const { t } = useTranslation("pricing")
  const titleId = useId()
  const money = useMoney()
  const { status, plans, retry, isRetrying } = usePlans()
  const pending = isPricePending(status)
  const rate = status === "ready" ? sharedRate(plans) : null

  return (
    <section aria-labelledby={titleId} className="pt-10 sm:pt-14">
      <Container className="flex flex-col gap-5">
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
        <ul
          aria-label={t("plans.trust.label")}
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium"
        >
          {TRUST.map(({ id, icon: Icon }) => (
            <li key={id} className="flex items-center gap-2">
              <Icon aria-hidden className="size-4 shrink-0 text-brand" />
              {t(`plans.trust.${id}`)}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {rate !== null && (
            <p className="font-semibold text-primary">
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
